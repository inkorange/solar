'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef, useMemo, useEffect, useCallback, Suspense, useState } from 'react';
import { Vector3 } from 'three';

// Minimal interface for OrbitControls methods/properties used in this file
interface OrbitControlsRef {
  target: Vector3;
  update: () => void;
  minDistance?: number;
  maxDistance?: number;
}
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Sun from './Sun';
import Planet, { planetFrameCallback } from './Planet';
import Orbit from './Orbit';
import MoonOrbit from './MoonOrbit';
import Stars from './Stars';
import Spaceship, { spaceshipGroupRef, updateCameraCallback } from './Spaceship';
import Moon from './Moon';
import Asteroid from './Asteroid';
import AsteroidBelt from './AsteroidBelt';
import { PLANETS, DWARF_PLANETS, SCALE_FACTORS } from '@/app/data/planets';
import { getMoonsForPlanet } from '@/app/data/moons';
import { ASTEROIDS } from '@/app/data/asteroids';
import { cameraPositionFor } from '@/app/lib/focusBody';
import { useStore } from '@/app/store/useStore';
import { calculateCelestialBodyPosition } from '@/app/lib/orbital-mechanics';
import { getPropulsionById, calculateDistanceTraveled, calculateCurrentSpeed, getFlightPhase, calculateTravelTime } from '@/app/data/propulsion';

function SceneUpdater({ active }: { active: boolean }) {
  const updateSimulationTime = useStore((state) => state.updateSimulationTime);
  const updateJourneyProgress = useStore((state) => state.updateJourneyProgress);
  const journeyStatus = useStore((state) => state.journeyStatus);
  const journeyElapsedTime = useStore((state) => state.journeyElapsedTime);
  const totalDistance = useStore((state) => state.totalDistance);
  const selectedPropulsion = useStore((state) => state.selectedPropulsion);
  const useFlipAndBurn = useStore((state) => state.useFlipAndBurn);
  const completeJourney = useStore((state) => state.completeJourney);

  useFrame((_state, delta) => {
    // Don't tick the store until the scene has mounted. A store update every frame re-renders this
    // root at a higher priority than the Suspense retry, which starves it: the textures finish
    // downloading in about a second but the scene then takes 30s+ (or never) to appear.
    if (!active) return;
    updateSimulationTime(delta);

    // Update journey progress if traveling
    if (journeyStatus === 'traveling') {
      updateJourneyProgress(delta);

      // Check if journey is complete based on speed reaching 0 (for flip-and-burn) or distance (for no flip-and-burn)
      if (selectedPropulsion) {
        const propulsion = getPropulsionById(selectedPropulsion);
        if (propulsion) {
          const currentSpeed = calculateCurrentSpeed(
            journeyElapsedTime,
            totalDistance,
            propulsion,
            useFlipAndBurn
          );

          const distanceTraveled = calculateDistanceTraveled(
            journeyElapsedTime,
            totalDistance,
            propulsion,
            useFlipAndBurn
          );

          const totalTime = calculateTravelTime(totalDistance, propulsion, useFlipAndBurn);

          // Arrive once the trip's full duration has passed. At high time speeds a single frame
          // can step right over the last stretch (the whole braking burn can be shorter than
          // one frame), so this can't depend on catching the ship inside a narrow window.
          const timeUp = journeyElapsedTime >= totalTime;

          if (useFlipAndBurn && propulsion.supportsFlipAndBurn) {
            // Flip-and-burn: also arrive when nearly stopped at the destination
            if (timeUp || (currentSpeed < 0.5 && distanceTraveled >= totalDistance * 0.999)) {
              completeJourney();
            }
          } else if (timeUp || distanceTraveled >= totalDistance * 0.999) {
            // No deceleration: arrive on reaching the destination
            completeJourney();
          }
        }
      }
    }
  });

  return null;
}

function CameraController() {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsRef | null>(null);
  const { cameraTarget, focusedPlanetName, cameraMode, journeyStatus, timeSpeed } = useStore();
  const showWelcome = useStore((st) => st.showWelcome);

  // Track last target to prevent re-animation
  const lastTargetRef = useRef<string>('');

  // Camera offset from the planet in planet-focus mode. In follow-spaceship mode it only
  // marks that the chase position has been set up (non-null = initialised).
  const cameraOffsetRef = useRef<Vector3 | null>(null);

  // Reset camera offset when mode changes
  useEffect(() => {
    cameraOffsetRef.current = null;
  }, [cameraMode]);


  // Register camera update callback for ship to use
  useEffect(() => {
    if (cameraMode === 'follow-spaceship') {
      const shipDelta = new Vector3();
      updateCameraCallback.current = (shipPosition: Vector3) => {
        if (!controlsRef.current || !cameraOffsetRef.current) return;

        // Carry the camera along by exactly the distance the ship moved this frame. The orbit
        // target was the ship's previous position, so the camera keeps whatever angle and zoom
        // the user has dragged to. This runs from the ship's own frame update, so the ship and
        // camera never differ by a frame - that lag is what shows up as jitter at high time
        // speeds, where one frame of travel dwarfs the camera distance.
        // No controls.update() here: a pure translation leaves the view direction unchanged,
        // and a second update per frame would apply rotation/zoom damping twice.
        const target = controlsRef.current.target;
        shipDelta.subVectors(shipPosition, target);
        camera.position.add(shipDelta);
        target.copy(shipPosition);
      };
    } else {
      // Clear callback when not in follow mode
      updateCameraCallback.current = null;
    }

    return () => {
      updateCameraCallback.current = null;
    };
  }, [cameraMode, camera]);

  // Animation state. With `body` set, the four vectors are offsets from that body's drawn
  // position, so the fly-in travels with the planet instead of aiming at where it used to be.
  const animationRef = useRef<{
    active: boolean;
    startTime: number;
    startPos: Vector3;
    targetPos: Vector3;
    startLookAt: Vector3;
    targetLookAt: Vector3;
    body?: string;
    bodyPos?: Vector3; // last known position, used only if the body isn't being drawn
  } | null>(null);

  // Where each planet was actually drawn on its latest frame (see planetFrameCallback).
  const drawnPositionsRef = useRef(new Map<string, Vector3>());

  // Advance the fly-in. `origin` is the body's drawn position for body-relative animations.
  const stepAnimation = useCallback((origin: Vector3 | null) => {
    const anim = animationRef.current;
    const controls = controlsRef.current;
    if (!anim || !anim.active || !controls) return;

    const t = Math.min((Date.now() - anim.startTime) / 1000 / 1.5, 1);
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // ease in-out

    camera.position.lerpVectors(anim.startPos, anim.targetPos, eased);
    controls.target.lerpVectors(anim.startLookAt, anim.targetLookAt, eased);
    if (origin) {
      camera.position.add(origin);
      controls.target.add(origin);
    }
    controls.update();

    if (t >= 1) {
      anim.active = false;
      // From here the planet-focus follow takes over; non-null marks it as set up.
      if (anim.body && useStore.getState().cameraMode === 'planet-focus') {
        cameraOffsetRef.current = camera.position.clone().sub(controls.target);
      }
    }
  }, [camera]);

  // Start a fly-in to a body that keeps up with the body while it moves. `targetPos` and
  // `bodyPosAtTarget` must come from the same simulation time.
  const flyToBody = useCallback((name: string, targetPos: Vector3, bodyPosAtTarget: Vector3) => {
    if (!controlsRef.current) return;
    const drawn = drawnPositionsRef.current.get(name) ?? bodyPosAtTarget;
    animationRef.current = {
      active: true,
      startTime: Date.now(),
      startPos: camera.position.clone().sub(drawn),
      targetPos: targetPos.clone().sub(bodyPosAtTarget),
      startLookAt: controlsRef.current.target.clone().sub(drawn),
      targetLookAt: new Vector3(0, 0, 0),
      body: name,
      bodyPos: drawn.clone(),
    };
  }, [camera]);

  // Planet-focus follow. Runs from each planet's own frame update, straight after it has
  // placed itself, so the camera and the planet always agree on where the planet is. Working
  // the planet's position out separately from the clock put the two a frame or more apart,
  // which at high time speeds made the planet shake in view.
  useEffect(() => {
    const drawn = drawnPositionsRef.current;
    const delta = new Vector3();
    planetFrameCallback.current = (name, position) => {
      const stored = drawn.get(name);
      if (stored) stored.copy(position);
      else drawn.set(name, position.clone());

      const controls = controlsRef.current;
      if (!controls) return;

      const anim = animationRef.current;
      if (anim?.active) {
        if (anim.body === name) stepAnimation(position);
        return;
      }

      const st = useStore.getState();
      if (st.cameraMode !== 'planet-focus' || st.focusedPlanetName !== name || !cameraOffsetRef.current) return;

      // Shift camera and orbit target by the planet's movement; angle and zoom are untouched.
      delta.subVectors(position, controls.target);
      camera.position.add(delta);
      controls.target.copy(position);
    };
    return () => {
      planetFrameCallback.current = null;
    };
  }, [camera, stepAnimation]);

  // An explicit view pick (buttons / C key) always re-frames, even if the mode didn't change.
  // Free view just lets go of the camera where it is (beside the ship, or at the planet);
  // picking Free again while already free flies back out to the whole-system overview.
  const cameraRequest = useStore((s) => s.cameraRequest);
  const prevModeRef = useRef(cameraMode);
  useEffect(() => {
    if (!cameraRequest || !controlsRef.current) return;
    cameraOffsetRef.current = null;
    const st = useStore.getState();
    if (st.cameraMode !== 'free') {
      lastTargetRef.current = '';
    } else if (prevModeRef.current !== 'free') {
      // Stay put: drop any fly-in still running, and mark the stored target as already
      // handled so the target effect below doesn't fly back to the last focused planet.
      animationRef.current = null;
      if (st.cameraTarget && st.focusedPlanetName) {
        lastTargetRef.current = `${st.focusedPlanetName}-${st.cameraTarget.join(',')}`;
      }
    } else {
      animationRef.current = {
        active: true,
        startTime: Date.now(),
        startPos: camera.position.clone(),
        targetPos: new Vector3(0, 50, 100), // same as the initial camera
        startLookAt: controlsRef.current.target.clone(),
        targetLookAt: new Vector3(0, 0, 0),
      };
    }
  }, [cameraRequest, camera]);

  // Must stay below the effect above, which needs the mode from before this pick.
  useEffect(() => {
    prevModeRef.current = cameraMode;
  }, [cameraMode]);

  // Initialize animation when target changes or when entering ship follow mode
  useEffect(() => {
    if (!controlsRef.current) return;

    if (cameraMode === 'follow-spaceship') {
      // Skip - will be handled in useFrame
      return;
    }

    if (!cameraTarget || !focusedPlanetName) return;

    // Create unique key for this target
    const targetKey = `${focusedPlanetName}-${cameraTarget.join(',')}`;
    if (targetKey === lastTargetRef.current) return; // Prevent re-trigger
    lastTargetRef.current = targetKey;

    // Get planet position for controls target (check both PLANETS and DWARF_PLANETS)
    const allBodies = [...PLANETS, ...DWARF_PLANETS];
    const planet = allBodies.find(p => p.name === focusedPlanetName);
    if (!planet) return;

    const { scaleMode, simulationTime } = useStore.getState();
    const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
    const planetPos = calculateCelestialBodyPosition(simulationTime, planet, scaleFactor.DISTANCE, allBodies, scaleMode);

    // Setup animation
    const planetPosVec = new Vector3(planetPos.x, planetPos.y, planetPos.z);
    if (cameraMode === 'planet-focus') {
      flyToBody(planet.name, new Vector3(...cameraTarget), planetPosVec);
    } else {
      animationRef.current = {
        active: true,
        startTime: Date.now(),
        startPos: camera.position.clone(),
        targetPos: new Vector3(...cameraTarget),
        startLookAt: controlsRef.current.target.clone(),
        targetLookAt: planetPosVec,
      };
    }
  }, [cameraTarget, focusedPlanetName, camera, cameraMode, flyToBody]);

  // Run animation and handle camera modes
  useFrame(() => {
    if (!controlsRef.current) return;

    // Handle animation
    const anim = animationRef.current;
    if (anim && anim.active) {
      // Body-relative fly-ins are stepped from the planet's frame update (planetFrameCallback);
      // only step here if that planet isn't being drawn.
      if (!anim.body) stepAnimation(null);
      else if (!drawnPositionsRef.current.has(anim.body)) stepAnimation(anim.bodyPos ?? null);
      return; // Skip camera mode updates during animation
    }

    // Handle camera modes
    if (cameraMode === 'follow-spaceship') {
      // Initialize camera offset on first entry
      if (!cameraOffsetRef.current && spaceshipGroupRef.current) {
        const shipPos = spaceshipGroupRef.current.position.clone();

        // Get the actual travel direction from origin to destination
        const { origin, destinationPositionAtArrival } = useStore.getState();

        let travelDirection = new Vector3(0, 0, 1); // Default fallback direction

        if (origin && destinationPositionAtArrival) {
          // Calculate origin position
          const { scaleMode, simulationTime } = useStore.getState();
          const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
          const allBodies = [...PLANETS, ...DWARF_PLANETS];
          const originPos = calculateCelestialBodyPosition(simulationTime, origin, scaleFactor.DISTANCE, allBodies);
          const originPosVec = new Vector3(originPos.x, originPos.y, originPos.z);

          // Destination's predicted arrival position
          const destPosVec = new Vector3(
            destinationPositionAtArrival.x,
            destinationPositionAtArrival.y,
            destinationPositionAtArrival.z
          );

          // Calculate the actual travel direction (from origin to destination intercept point)
          travelDirection = new Vector3().subVectors(destPosVec, originPosVec).normalize();
        }

        // Position camera BEHIND the ship along the travel direction
        // Ship is roughly 0.00625 units long (SHIP_SCALE 0.003125 * 2)
        // To fill 15% of screen with FOV 60°, camera should be ~4x ship length away
        const shipLength = 0.00625;
        const cameraDistance = shipLength * 4; // ~0.025 units - close enough for 15% screen fill
        const cameraHeight = cameraDistance * 0.25; // Slightly above for better view

        // Offset BEHIND the ship (negative travel direction)
        const offsetPos = travelDirection.clone().multiplyScalar(-cameraDistance)
          .add(new Vector3(0, cameraHeight, 0));

        // Mark the chase position as set up; from here the ship callback keeps it attached
        cameraOffsetRef.current = offsetPos;

        // Set initial camera position and look-at target
        const initialCameraPos = shipPos.clone().add(offsetPos);
        camera.position.copy(initialCameraPos);
        controlsRef.current.target.copy(shipPos);
        controlsRef.current.update();
      }
      // Camera updates are now handled by the callback from ship's useFrame
    } else if (cameraMode === 'planet-focus' && focusedPlanetName) {
      // Planet focus mode - camera follows planet while maintaining rotation ability
      const allBodies = [...PLANETS, ...DWARF_PLANETS];
      const planet = allBodies.find(p => p.name === focusedPlanetName);
      if (planet) {
        const { scaleMode, simulationTime } = useStore.getState();
        const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
        const planetPos = calculateCelestialBodyPosition(simulationTime, planet, scaleFactor.DISTANCE, allBodies, scaleMode);
        const planetPosVec = new Vector3(planetPos.x, planetPos.y, planetPos.z);

        // Entering planet view: fly in to the same close framing used when a planet is picked,
        // instead of snapping to a distant default. The animation's completion sets the offset.
        if (!cameraOffsetRef.current) {
          flyToBody(planet.name, new Vector3(...cameraPositionFor(planet, simulationTime, scaleMode)), planetPosVec);
        }
        // Once set up, following the planet happens in planetFrameCallback.
      }
    } else {
      // 'free' mode doesn't need special handling - orbit controls work normally
      cameraOffsetRef.current = null; // Clear offset when not in planet-focus or follow-spaceship mode
    }
  });

  // Disable controls when propulsion selector or other modal is open
  const controlsEnabled = journeyStatus !== 'selecting-propulsion';

  // Panning would drag the orbit target off the ship, which the follow camera pins every frame.
  const panEnabled = controlsEnabled && cameraMode !== 'follow-spaceship';
  const dampingFactor = 0.1;

  return (
    <OrbitControls
      // store the internal OrbitControls instance in our typed ref via callback
  ref={(inst: unknown) => { controlsRef.current = inst as OrbitControlsRef; }}
      enablePan={panEnabled}
      enableZoom={controlsEnabled}
      enableRotate={controlsEnabled}
      minDistance={0.01}
      maxDistance={2500}
      zoomSpeed={1.0}
      rotateSpeed={0.8}
      enableDamping
      dampingFactor={dampingFactor}
      // Slow orbit behind the splash; stops as soon as it is dismissed.
      autoRotate={showWelcome}
      autoRotateSpeed={0.35}
    />
  );
}

// Component to render a planet with its moons
function PlanetWithMoons({ planetData }: { planetData: typeof PLANETS[0] }) {
  const { scaleMode, simulationTime } = useStore();

  // Get moons for this planet
  const moons = getMoonsForPlanet(planetData.name);

  // Calculate planet's position using elliptical orbit
  const planetPosition = useMemo(() => {
    const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
    const allBodies = [...PLANETS, ...DWARF_PLANETS];
    const position = calculateCelestialBodyPosition(
      simulationTime,
      planetData,
      scaleFactor.DISTANCE,
      allBodies
    );

    return new Vector3(position.x, position.y, position.z);
  }, [simulationTime, scaleMode, planetData]);

  // Check if this is the Moon (satellite rendered as Planet)
  const isMoon = planetData.isMoon && planetData.parentPlanet;
  const parentPlanet = isMoon ? PLANETS.find(p => p.name === planetData.parentPlanet) : null;

  return (
    <>
      <Orbit planetData={planetData} />
      <Planet data={planetData} />
      {moons.map((moon) => (
        <Moon key={moon.name} planetPosition={planetPosition} moonData={moon} />
      ))}
      {/* Render moon orbit around parent planet if this is a moon */}
      {isMoon && parentPlanet && (
        <MoonOrbit moonData={planetData} parentPlanet={parentPlanet} color="#60a5fa" opacity={0.25} />
      )}
    </>
  );
}

function LoadingTracker({ onLoadComplete }: { onLoadComplete: () => void }) {
  const [loadedCount, setLoadedCount] = useState(0);
  const totalItems = useRef(0);
  const hasCompleted = useRef(false);
  const loadedNames = useRef(new Set<string>());

  useEffect(() => {
    // Count total items to load: planets with textures (9: Mercury-Pluto) + Sun (1) = 10 total
    totalItems.current = PLANETS.filter(p => p.texture).length + 1; // +1 for Sun
  }, []);

  // Check loading complete whenever count changes
  useEffect(() => {
    if (loadedCount >= totalItems.current && totalItems.current > 0 && !hasCompleted.current) {
      hasCompleted.current = true;
      // Delay to ensure scene is fully rendered
      setTimeout(() => onLoadComplete(), 500);
    }
  }, [loadedCount, onLoadComplete]);

  // Expose a way for planets to report loading
  useEffect(() => {
    const handleTextureLoad = (event: Event) => {
      const customEvent = event as CustomEvent;
      const name = customEvent.detail?.name || 'Unknown';

      // Only count each planet once (prevent duplicate events from StrictMode)
      if (!loadedNames.current.has(name)) {
        loadedNames.current.add(name);
        setLoadedCount(prev => prev + 1);
      }
    };

    // Listen for texture load events
    window.addEventListener('planet-texture-loaded', handleTextureLoad);
    return () => window.removeEventListener('planet-texture-loaded', handleTextureLoad);
  }, []);

  return null;
}

export default function SolarSystem() {
  const [isLoading, setIsLoading] = useState(true);
  // The cover stays mounted while it fades out, then is removed.
  const [loaderGone, setLoaderGone] = useState(false);
  // The splash screen covers loading; only show the spinner text once it's dismissed.
  const hideLoaderText = useStore((s) => s.showWelcome);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#000000' }}>
      {/* Loading indicator overlay with backdrop */}
      {!loaderGone && (
        <div
          onTransitionEnd={(e) => {
            if (e.target === e.currentTarget && !isLoading) setLoaderGone(true);
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            // Fade the black cover out so the scene eases in instead of popping.
            opacity: isLoading ? 1 : 0,
            transition: 'opacity 1.4s ease',
            pointerEvents: isLoading ? 'auto' : 'none',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              color: 'white',
              fontFamily: 'var(--font-geist-sans)',
              visibility: hideLoaderText ? 'hidden' : 'visible',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                border: '3px solid rgba(96, 165, 250, 0.2)',
                borderTop: '3px solid #60a5fa',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px',
              }}
            />
            <div style={{ fontSize: '18px', fontWeight: 600 }}>Loading Solar System...</div>
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        </div>
      )}

      <Canvas
        camera={{
          position: [0, 50, 100],
          fov: 60,
          near: 0.001,
          far: 10000,
        }}
        style={{ background: '#000000' }}
        shadows
      >
        {/* Scene updater component */}
        <SceneUpdater active={!isLoading} />

        {/* Loading tracker */}
        <LoadingTracker onLoadComplete={() => setIsLoading(false)} />

        <Suspense fallback={null}>
          {/* Stars background */}
          <Stars />

          {/* Sun at the center */}
          <Sun />

          {/* All planets with their orbits and moons */}
          {PLANETS.map((planet) => (
            <PlanetWithMoons key={planet.name} planetData={planet} />
          ))}

          {/* Dwarf planets (Eris, Haumea, Makemake) with their moons */}
          {DWARF_PLANETS.map((dwarfPlanet) => (
            <PlanetWithMoons key={dwarfPlanet.name} planetData={dwarfPlanet} />
          ))}

          {/* Asteroid Belt visualization */}
          <AsteroidBelt />

          {/* Major asteroids (Ceres, Vesta, Pallas) */}
          {ASTEROIDS.map((asteroid) => (
            <Asteroid key={asteroid.name} data={asteroid} />
          ))}

          {/* Spaceship */}
          <Spaceship />
        </Suspense>

        {/* Camera controls */}
        <CameraController />

        {/* Post-processing effects for sun glow */}
        <EffectComposer>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.75}
            luminanceSmoothing={0.9}
            radius={0.8}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
