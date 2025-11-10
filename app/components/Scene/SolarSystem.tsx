'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef, useMemo, useEffect, Suspense } from 'react';
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
import { calculateTravelTime, getPropulsionById } from '@/app/data/propulsion';

function SceneUpdater() {
  const updateSimulationTime = useStore((state) => state.updateSimulationTime);
  const updateJourneyProgress = useStore((state) => state.updateJourneyProgress);
  const journeyStatus = useStore((state) => state.journeyStatus);
  const journeyElapsedTime = useStore((state) => state.journeyElapsedTime);
  const totalDistance = useStore((state) => state.totalDistance);
  const selectedPropulsion = useStore((state) => state.selectedPropulsion);
  const completeJourney = useStore((state) => state.completeJourney);

  useFrame((state, delta) => {
    updateSimulationTime(delta);

    // Update journey progress if traveling
    if (journeyStatus === 'traveling') {
      updateJourneyProgress(delta);

      // Check if journey is complete
      if (selectedPropulsion) {
        const propulsion = getPropulsionById(selectedPropulsion);
        if (propulsion) {
          const totalTime = calculateTravelTime(totalDistance, propulsion);
          if (journeyElapsedTime >= totalTime) {
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

          // Position camera behind ship (opposite of Earth-to-ship direction)
          const cameraDistance = 15; // Distance behind the ship
          const cameraHeight = 5; // Height above the ship
          const initialCameraPos = shipPos.clone()
            .add(earthToShip.clone().multiplyScalar(-cameraDistance))
            .add(new Vector3(0, cameraHeight, 0));

          camera.position.copy(initialCameraPos);
          controlsRef.current.target.copy(shipPos);

          // Store the initial offset
          cameraOffsetRef.current = camera.position.clone().sub(shipPos);
        }
      }

      // Calculate how much the ship has moved
      const previousTarget = controlsRef.current.target.clone();
      const shipMovement = shipPos.clone().sub(previousTarget);

      // Move both camera and target by the same amount to maintain relative position
      camera.position.add(shipMovement);
      controlsRef.current.target.copy(shipPos);

      // Update the stored offset based on current camera position (accounts for user rotation/zoom)
      cameraOffsetRef.current = camera.position.clone().sub(shipPos);

      controlsRef.current.update();
    } else if (cameraMode === 'planet-focus' && focusedPlanetName) {
      // Planet focus mode - camera follows planet while maintaining rotation ability
      const planet = PLANETS.find(p => p.name === focusedPlanetName);
      if (planet) {
        const { scaleMode, simulationTime } = useStore.getState();
        const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
        const planetPos = calculateEllipticalOrbitPosition(simulationTime, planet, scaleFactor.DISTANCE);
        const planetPosVec = new Vector3(planetPos.x, 0, planetPos.z);

        // Initialize offset on first frame
        if (!cameraOffsetRef.current) {
          cameraOffsetRef.current = camera.position.clone().sub(planetPosVec);
          controlsRef.current.target.copy(planetPosVec);
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
      minDistance={0.25}
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

export default function SolarSystem() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{
          position: [0, 50, 100],
          fov: 60,
          near: 0.1,
          far: 10000,
        }}
        style={{ background: '#000000' }}
        shadows
      >
        {/* Scene updater component */}
        <SceneUpdater />

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
