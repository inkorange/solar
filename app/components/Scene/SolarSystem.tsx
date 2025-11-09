'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef, useMemo, useEffect, Suspense } from 'react';
import { Vector3 } from 'three';
import Sun from './Sun';
import Planet from './Planet';
import Orbit from './Orbit';
import Stars from './Stars';
import Spaceship from './Spaceship';
import Moon from './Moon';
import { PLANETS, SCALE_FACTORS } from '@/app/data/planets';
import { useStore } from '@/app/store/useStore';

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
        const { calculateTravelTime, getPropulsionById } = require('@/app/data/propulsion');
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
  const controlsRef = useRef<any>(null);
  const { cameraTarget, focusedPlanetName } = useStore();

  // Track last target to prevent re-animation
  const lastTargetRef = useRef<string>('');

  // Animation state
  const animationRef = useRef<{
    active: boolean;
    startTime: number;
    startPos: Vector3;
    targetPos: Vector3;
    startLookAt: Vector3;
    targetLookAt: Vector3;
  } | null>(null);

  // Initialize animation when target changes
  useEffect(() => {
    if (!cameraTarget || !controlsRef.current || !focusedPlanetName) return;

    // Create unique key for this target
    const targetKey = `${focusedPlanetName}-${cameraTarget.join(',')}`;
    if (targetKey === lastTargetRef.current) return; // Prevent re-trigger
    lastTargetRef.current = targetKey;

    // Get planet position for controls target
    const planet = PLANETS.find(p => p.name === focusedPlanetName);
    if (!planet) return;

    const { scaleMode, simulationTime } = useStore.getState();
    const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
    const { calculateEllipticalOrbitPosition } = require('@/app/lib/orbital-mechanics');
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
  }, [cameraTarget, focusedPlanetName, camera]);

  // Run animation
  useFrame(() => {
    const anim = animationRef.current;
    if (!anim || !anim.active || !controlsRef.current) return;

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
  });

  return <OrbitControls ref={controlsRef} enablePan={true} enableZoom={true} enableRotate={true} minDistance={2} maxDistance={500} zoomSpeed={1.5} rotateSpeed={0.5} />;
}

// Component to track Earth's position and render the Moon
function EarthWithMoon() {
  const earthData = PLANETS.find(p => p.name === 'Earth')!;
  const { scaleMode, simulationTime } = useStore();

  // Calculate Earth's position (same logic as Planet component)
  const earthPosition = useMemo(() => {
    const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
    const orbitRadius = earthData.distanceFromSun * scaleFactor.DISTANCE;
    const orbitalPeriodSeconds = earthData.orbitalPeriod * 24 * 60 * 60;
    const angle = (simulationTime / orbitalPeriodSeconds) * Math.PI * 2;

    return new Vector3(
      Math.cos(angle) * orbitRadius,
      0,
      Math.sin(angle) * orbitRadius
    );
  }, [simulationTime, scaleMode]);

  return (
    <>
      <Orbit planetData={earthData} />
      <Planet data={earthData} />
      <Moon planetPosition={earthPosition} />
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
          far: 2000,
        }}
        style={{ background: '#000000' }}
      >
        {/* Scene updater component */}
        <SceneUpdater />

        <Suspense fallback={null}>
          {/* Stars background */}
          <Stars />

          {/* Sun at the center */}
          <Sun />

          {/* All planets with their orbits - special handling for Earth */}
          {PLANETS.map((planet) => {
            if (planet.name === 'Earth') {
              return <EarthWithMoon key={planet.name} />;
            }
            return (
              <group key={planet.name}>
                <Orbit planetData={planet} />
                <Planet data={planet} />
              </group>
            );
          })}

          {/* Spaceship */}
          <Spaceship />
        </Suspense>

        {/* Camera controls */}
        <CameraController />
      </Canvas>
    </div>
  );
}
