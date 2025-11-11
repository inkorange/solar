'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef, useMemo, useEffect, Suspense, useState } from 'react';
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
import Planet from './Planet';
import Orbit from './Orbit';
import Stars from './Stars';
import Spaceship from './Spaceship';
import Moon from './Moon';
import Asteroid from './Asteroid';
import AsteroidBelt from './AsteroidBelt';
import { PLANETS, SCALE_FACTORS } from '@/app/data/planets';
import { getMoonsForPlanet } from '@/app/data/moons';
import { ASTEROIDS } from '@/app/data/asteroids';
import { useStore } from '@/app/store/useStore';
import { calculateEllipticalOrbitPosition } from '@/app/lib/orbital-mechanics';
import { getPropulsionById, calculateDistanceTraveled, calculateCurrentSpeed, getFlightPhase, calculateTravelTime } from '@/app/data/propulsion';

function SceneUpdater() {
  const updateSimulationTime = useStore((state) => state.updateSimulationTime);
  const updateJourneyProgress = useStore((state) => state.updateJourneyProgress);
  const journeyStatus = useStore((state) => state.journeyStatus);
  const journeyElapsedTime = useStore((state) => state.journeyElapsedTime);
  const totalDistance = useStore((state) => state.totalDistance);
  const selectedPropulsion = useStore((state) => state.selectedPropulsion);
  const useFlipAndBurn = useStore((state) => state.useFlipAndBurn);
  const completeJourney = useStore((state) => state.completeJourney);

  const frameCountRef = useRef<number>(0);
  const accumulatedDeltaRef = useRef<number>(0);

  useFrame((state, delta) => {
    // Debug: Track delta accumulation
    frameCountRef.current++;
    accumulatedDeltaRef.current += delta;

    // Log every 60 frames (about 1 second at 60fps)
    if (frameCountRef.current % 60 === 0) {
      console.log('[Frame 60] Delta:', delta.toFixed(4), 's | Total accumulated:', accumulatedDeltaRef.current.toFixed(2), 's | Frames:', frameCountRef.current);
      accumulatedDeltaRef.current = 0; // Reset accumulator
    }

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

          const progress = (distanceTraveled / totalDistance) * 100;
          const flightPhase = getFlightPhase(journeyElapsedTime, totalDistance, propulsion, useFlipAndBurn);
          const totalTime = calculateTravelTime(totalDistance, propulsion, useFlipAndBurn);

          // Debug logging every 2 seconds of journey time
          if (Math.floor(journeyElapsedTime) % 2 === 0 && Math.floor(journeyElapsedTime) !== Math.floor(journeyElapsedTime - delta)) {
            console.log('[Journey Status]', {
              phase: flightPhase,
              elapsed: journeyElapsedTime.toFixed(1) + 's / ' + totalTime.toFixed(1) + 's',
              speed: currentSpeed.toFixed(2) + ' km/s (max: ' + propulsion.maxSpeed + ')',
              progress: progress.toFixed(2) + '%',
              distance: (distanceTraveled / 1000000).toFixed(2) + 'M km / ' + (totalDistance / 1000000).toFixed(2) + 'M km',
              useFlipAndBurn,
            });
          }

          // For flip-and-burn: complete when speed reaches near 0 AND distance is close to total
          // For no flip-and-burn: complete when distance traveled reaches destination
          if (useFlipAndBurn && propulsion.supportsFlipAndBurn) {
            // Log when we're getting close to arrival
            if (progress > 95) {
              console.log('[Arrival Check] Speed:', currentSpeed.toFixed(2), 'km/s | Progress:', progress.toFixed(2), '% | Need: speed < 1 km/s AND progress > 99%');
            }

            // Complete when speed is very low (< 1 km/s) and we're close to destination (> 99% distance)
            if (currentSpeed < 1 && distanceTraveled >= totalDistance * 0.99) {
              console.log('[JOURNEY COMPLETE] Arrived with speed:', currentSpeed.toFixed(2), 'km/s at', progress.toFixed(2), '% distance');
              completeJourney();
            }
          } else {
            // No deceleration - complete when we reach the destination
            if (distanceTraveled >= totalDistance * 0.999) {
              console.log('[JOURNEY COMPLETE] Arrived at', progress.toFixed(2), '% distance (no flip-and-burn)');
              completeJourney();
            }
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
  const { cameraTarget, focusedPlanetName, cameraMode, spaceshipPosition, journeyStatus } = useStore();

  // Track last target to prevent re-animation
  const lastTargetRef = useRef<string>('');

  // Store camera offset when planet-focus or follow-spaceship mode is activated
  const cameraOffsetRef = useRef<Vector3 | null>(null);

  // Reset camera offset when mode changes
  useEffect(() => {
    cameraOffsetRef.current = null;
  }, [cameraMode]);

  // Animation state
  const animationRef = useRef<{
    active: boolean;
    startTime: number;
    startPos: Vector3;
    targetPos: Vector3;
    startLookAt: Vector3;
    targetLookAt: Vector3;
  } | null>(null);

  // Initialize animation when target changes or when entering ship follow mode
  useEffect(() => {
    if (!controlsRef.current) return;

    if (cameraMode === 'follow-spaceship') {
      const shipPos = new Vector3(spaceshipPosition[0], spaceshipPosition[1], spaceshipPosition[2]);
      controlsRef.current.target.copy(shipPos);
      controlsRef.current.update();
      return;
    }

    if (!cameraTarget || !focusedPlanetName) return;

    // Create unique key for this target
    const targetKey = `${focusedPlanetName}-${cameraTarget.join(',')}`;
    if (targetKey === lastTargetRef.current) return; // Prevent re-trigger
    lastTargetRef.current = targetKey;

    // Get planet position for controls target
    const planet = PLANETS.find(p => p.name === focusedPlanetName);
    if (!planet) return;

    const { scaleMode, simulationTime } = useStore.getState();
    const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
    const planetPos = calculateEllipticalOrbitPosition(simulationTime, planet, scaleFactor.DISTANCE);

    // Setup animation
    animationRef.current = {
      active: true,
      startTime: Date.now(),
      startPos: camera.position.clone(),
      targetPos: new Vector3(...cameraTarget),
      startLookAt: controlsRef.current.target.clone(),
      targetLookAt: new Vector3(planetPos.x, 0, planetPos.z),
    };
  }, [cameraTarget, focusedPlanetName, camera, cameraMode, spaceshipPosition]);

  // Run animation and handle camera modes
  useFrame(() => {
    if (!controlsRef.current) return;

    // Handle animation
    const anim = animationRef.current;
    if (anim && anim.active) {
      const elapsed = (Date.now() - anim.startTime) / 1000;
      const duration = 1.5;
      const t = Math.min(elapsed / duration, 1);

      // Ease in-out
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      // Update camera
      camera.position.lerpVectors(anim.startPos, anim.targetPos, eased);
      controlsRef.current.target.lerpVectors(anim.startLookAt, anim.targetLookAt, eased);
      controlsRef.current.update();

      if (t >= 1) {
        anim.active = false;

        // Initialize camera offset for planet-focus mode after animation completes
        if (cameraMode === 'planet-focus' && focusedPlanetName) {
          const planet = PLANETS.find(p => p.name === focusedPlanetName);
          if (planet) {
            const { scaleMode, simulationTime } = useStore.getState();
            const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
            const planetPos = calculateEllipticalOrbitPosition(simulationTime, planet, scaleFactor.DISTANCE);
            const planetPosVec = new Vector3(planetPos.x, 0, planetPos.z);

            // Set the camera offset based on final animated position
            cameraOffsetRef.current = camera.position.clone().sub(planetPosVec);
          }
        }
      }
      return; // Skip camera mode updates during animation
    }

    // Handle camera modes
    if (cameraMode === 'follow-spaceship') {
      const shipPos = new Vector3(spaceshipPosition[0], spaceshipPosition[1], spaceshipPosition[2]);

      // Initialize camera position behind the ship from Earth's perspective on first entry
      if (!cameraOffsetRef.current) {
        // Get Earth's position
        const earth = PLANETS.find(p => p.name === 'Earth');
        if (earth) {
          const { scaleMode, simulationTime } = useStore.getState();
          const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
          const earthPos = calculateEllipticalOrbitPosition(simulationTime, earth, scaleFactor.DISTANCE);
          const earthPosVec = new Vector3(earthPos.x, 0, earthPos.z);

          // Calculate direction from Earth to ship
          const earthToShip = shipPos.clone().sub(earthPosVec).normalize();

          // Position camera much closer behind ship (scaled to match smaller ship size)
          const cameraDistance = 0.5; // Distance behind the ship (much closer now)
          const cameraHeight = 0.2; // Height above the ship (much closer now)
          const initialCameraPos = shipPos.clone()
            .add(earthToShip.clone().multiplyScalar(-cameraDistance))
            .add(new Vector3(0, cameraHeight, 0));

          // Set initial camera position
          camera.position.copy(initialCameraPos);
          controlsRef.current.target.copy(shipPos);

          // Mark as initialized (set to a placeholder value)
          cameraOffsetRef.current = new Vector3(0, 0, 0);
        }
      } else {
        // Track how much the ship has moved since last frame
        const previousTarget = controlsRef.current.target.clone();
        const shipMovement = shipPos.clone().sub(previousTarget);

        // Move camera by the same amount to follow the ship
        camera.position.add(shipMovement);

        // Update target to current ship position
        controlsRef.current.target.copy(shipPos);
      }

      controlsRef.current.update();
    } else if (cameraMode === 'planet-focus' && focusedPlanetName) {
      // Planet focus mode - camera follows planet while maintaining rotation ability
      const planet = PLANETS.find(p => p.name === focusedPlanetName);
      if (planet) {
        const { scaleMode, simulationTime } = useStore.getState();
        const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
        const planetPos = calculateEllipticalOrbitPosition(simulationTime, planet, scaleFactor.DISTANCE);
        const planetPosVec = new Vector3(planetPos.x, 0, planetPos.z);

        // Initialize offset on first frame with appropriate zoom based on planet size
        if (!cameraOffsetRef.current) {
          const planetSize = (planet.diameter / 12742) * scaleFactor.SIZE * 5;
          const cameraDistance = Math.max(planetSize * 8, 15); // At least 8x planet radius, minimum 15 units
          const cameraHeight = planetSize * 3;

          // Position camera offset from planet
          const initialCameraPos = planetPosVec.clone()
            .add(new Vector3(cameraDistance, cameraHeight, cameraDistance));

          camera.position.copy(initialCameraPos);
          controlsRef.current.target.copy(planetPosVec);
          cameraOffsetRef.current = camera.position.clone().sub(planetPosVec);
        }

        // Calculate how much the planet has moved
        const previousTarget = controlsRef.current.target.clone();
        const planetMovement = planetPosVec.clone().sub(previousTarget);

        // Move both camera and target by the same amount to maintain relative position
        camera.position.add(planetMovement);
        controlsRef.current.target.copy(planetPosVec);

        // Update the stored offset based on current camera position (accounts for user rotation/zoom)
        cameraOffsetRef.current = camera.position.clone().sub(planetPosVec);

        controlsRef.current.update();
      }
    } else {
      // 'free' mode doesn't need special handling - orbit controls work normally
      cameraOffsetRef.current = null; // Clear offset when not in planet-focus or follow-spaceship mode
    }
  });

  // Disable controls when propulsion selector or other modal is open
  const controlsEnabled = journeyStatus !== 'selecting-propulsion';

  return (
    <OrbitControls
      // store the internal OrbitControls instance in our typed ref via callback
  ref={(inst: unknown) => { controlsRef.current = inst as OrbitControlsRef; }}
      enablePan={controlsEnabled}
      enableZoom={controlsEnabled}
      enableRotate={controlsEnabled}
      minDistance={0.01}
      maxDistance={2500}
      zoomSpeed={1.0}
      rotateSpeed={0.8}
      enableDamping={true}
      dampingFactor={0.1}
      autoRotate={false}
      autoRotateSpeed={0}
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
    const position = calculateEllipticalOrbitPosition(
      simulationTime,
      planetData,
      scaleFactor.DISTANCE
    );

    return new Vector3(position.x, 0, position.z);
  }, [simulationTime, scaleMode, planetData]);

  return (
    <>
      <Orbit planetData={planetData} />
      <Planet data={planetData} />
      {moons.map((moon) => (
        <Moon key={moon.name} planetPosition={planetPosition} moonData={moon} />
      ))}
    </>
  );
}

function LoadingTracker({ onLoadComplete }: { onLoadComplete: () => void }) {
  const [loadedCount, setLoadedCount] = useState(0);
  const totalItems = useRef(0);
  const hasCompleted = useRef(false);

  useEffect(() => {
    // Count total items to load (8 planets with textures)
    totalItems.current = PLANETS.filter(p => p.texture).length;
  }, []);

  useFrame(() => {
    // Check if all items are loaded and first frame has rendered
    if (!hasCompleted.current && loadedCount >= totalItems.current && totalItems.current > 0) {
      hasCompleted.current = true;
      // Small delay to ensure first render is complete
      setTimeout(() => onLoadComplete(), 100);
    }
  });

  // Expose a way for planets to report loading
  useEffect(() => {
    const handleTextureLoad = () => {
      setLoadedCount(prev => prev + 1);
    };

    // Listen for texture load events
    window.addEventListener('planet-texture-loaded', handleTextureLoad);
    return () => window.removeEventListener('planet-texture-loaded', handleTextureLoad);
  }, []);

  return null;
}

export default function SolarSystem() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Loading indicator overlay */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'white',
            fontFamily: 'var(--font-geist-sans)',
            zIndex: 1000,
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
        <SceneUpdater />

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
            intensity={2.0}
            luminanceThreshold={0.6}
            luminanceSmoothing={0.9}
            radius={1.0}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
