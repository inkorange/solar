'use client';

import { useRef, useMemo } from 'react';
import { Mesh, Vector3, Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { useStore } from '@/app/store/useStore';
import { SCALE_FACTORS, PLANETS } from '@/app/data/planets';
import { getPropulsionById, getFlightPhase, calculateDistanceTraveled } from '@/app/data/propulsion';
import { calculateEllipticalOrbitPosition } from '@/app/lib/orbital-mechanics';
import EngineTrail from './EngineTrail';

export default function Spaceship() {
  const bodyRef = useRef<Mesh | null>(null);
  const groupRef = useRef<Group | null>(null);
  const previousPositionRef = useRef<Vector3 | null>(null);

  const {
    journeyStatus,
    origin,
    destination,
    selectedPropulsion,
    useFlipAndBurn,
    journeyElapsedTime,
    journeyStartTime,
    totalDistance,
    destinationPositionAtArrival,
    scaleMode,
    simulationTime,
    setSpaceshipPosition,
  } = useStore();

  // Calculate current position during journey
  const position = useMemo(() => {
    const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;

    // If we've arrived at a destination, stay at that planet's current position
    if (journeyStatus === 'arrived' && destination) {
      const destPosData = calculateEllipticalOrbitPosition(
        simulationTime,
        destination,
        scaleFactor.DISTANCE
      );
      return new Vector3(destPosData.x, 0, destPosData.z);
    }

    // If not traveling and no arrival state, default to Earth orbit
    if (journeyStatus !== 'traveling' || !origin || !destination || !selectedPropulsion || !destinationPositionAtArrival) {
      const earthData = PLANETS.find(p => p.name === 'Earth') || PLANETS[2];
      const orbitRadius = earthData.distanceFromSun * scaleFactor.DISTANCE;
      const orbitalPeriodSeconds = earthData.orbitalPeriod * 24 * 60 * 60;
      const angle = (simulationTime / orbitalPeriodSeconds) * Math.PI * 2;

      return new Vector3(
        Math.cos(angle) * orbitRadius + 5,
        0,
        Math.sin(angle) * orbitRadius + 5
      );
    }

    // Origin position at journey start time (departure point)
    const originPosData = calculateEllipticalOrbitPosition(
      journeyStartTime,
      origin,
      scaleFactor.DISTANCE
    );
    const originPos = new Vector3(originPosData.x, 0, originPosData.z);

    // Destination position at arrival (from intercept calculation)
    const destPos = new Vector3(
      destinationPositionAtArrival.x,
      0,
      destinationPositionAtArrival.z
    );

    // Calculate actual distance traveled using physics-based calculations
    const propulsion = getPropulsionById(selectedPropulsion);
    if (!propulsion) return originPos;

    const distanceTraveled = calculateDistanceTraveled(
      journeyElapsedTime,
      totalDistance,
      propulsion,
      useFlipAndBurn
    );

    // Calculate progress based on actual distance traveled (0 to 1)
    const progress = Math.min(1, distanceTraveled / totalDistance);

    // Interpolate position from departure point to intercept point
    return new Vector3().lerpVectors(originPos, destPos, progress);
  }, [journeyStatus, origin, destination, selectedPropulsion, useFlipAndBurn, journeyElapsedTime, journeyStartTime, totalDistance, destinationPositionAtArrival, scaleMode, simulationTime]);

  // Calculate current flight phase for rendering
  const flightPhase = useMemo(() => {
    if (journeyStatus !== 'traveling' || !selectedPropulsion) return 'cruising';
    const propulsion = getPropulsionById(selectedPropulsion);
    return propulsion ? getFlightPhase(journeyElapsedTime, totalDistance, propulsion, useFlipAndBurn) : 'cruising';
  }, [journeyStatus, selectedPropulsion, journeyElapsedTime, totalDistance, useFlipAndBurn]);

  // Update spaceship position and rotation
  useFrame(() => {
    if (groupRef.current && journeyStatus === 'traveling' && selectedPropulsion && destinationPositionAtArrival) {
      // Get current flight phase
      const isDecelerating = flightPhase === 'decelerating';

      // Calculate direction to destination (the trajectory)
      const destPos = new Vector3(
        destinationPositionAtArrival.x,
        0,
        destinationPositionAtArrival.z
      );
      const directionToDestination = new Vector3()
        .subVectors(destPos, position)
        .normalize();

      // Calculate angle in XZ plane (horizontal rotation)
      const angle = Math.atan2(directionToDestination.z, directionToDestination.x);

      // Rotate the entire group to face travel direction
      // During acceleration/cruise: face forward (engines behind)
      // During deceleration: flip 180 degrees (engines in front, pointing toward destination)
      // Spaceship model points in +X direction by default (Math.PI / 2 rotation applied in mesh)
      groupRef.current.rotation.y = -angle + (isDecelerating ? Math.PI : 0);

      // Update position
      groupRef.current.position.copy(position);

      // Store current position for next frame
      previousPositionRef.current = position.clone();

      // Update the store so camera can follow
      setSpaceshipPosition([position.x, position.y, position.z]);
    }
  });

  // Only render spaceship when actively traveling
  if (journeyStatus !== 'traveling') {
    return null;
  }

  // Scale factor to make spaceship much smaller (5% of original size)
  const SHIP_SCALE = 0.05;

  return (
    <group ref={groupRef}>
      {/* Realistic spacecraft design */}

      {/* Main fuselage - elongated body */}
      <mesh ref={bodyRef} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25 * SHIP_SCALE, 0.25 * SHIP_SCALE, 1.2 * SHIP_SCALE, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Nose cone - aerodynamic front */}
      <mesh position={[0.7 * SHIP_SCALE, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.25 * SHIP_SCALE, 0.5 * SHIP_SCALE, 16]} />
        <meshStandardMaterial color="#d0d0d0" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Cockpit window - transparent */}
      <mesh position={[0.5 * SHIP_SCALE, 0, 0.26 * SHIP_SCALE]} rotation={[0, 0, 0]}>
        <sphereGeometry args={[0.15 * SHIP_SCALE, 16, 16, 0, Math.PI]} />
        <meshStandardMaterial
          color="#1a4d7a"
          metalness={0.5}
          roughness={0.3}
          transparent
          opacity={0.7}
          emissive="#1a4d7a"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Upper solar panel wing */}
      <group position={[0, 0.25 * SHIP_SCALE, 0]}>
        <mesh position={[0, 0.5 * SHIP_SCALE, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.8 * SHIP_SCALE, 0.02 * SHIP_SCALE, 1.4 * SHIP_SCALE]} />
          <meshStandardMaterial
            color="#1a3d5c"
            metalness={0.4}
            roughness={0.6}
            emissive="#0a1d3c"
            emissiveIntensity={0.1}
          />
        </mesh>
        {/* Solar panel frame */}
        <mesh position={[0, 0.51 * SHIP_SCALE, 0]}>
          <boxGeometry args={[0.85 * SHIP_SCALE, 0.01 * SHIP_SCALE, 1.45 * SHIP_SCALE]} />
          <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.5} />
        </mesh>
      </group>

      {/* Lower solar panel wing */}
      <group position={[0, -0.25 * SHIP_SCALE, 0]}>
        <mesh position={[0, -0.5 * SHIP_SCALE, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.8 * SHIP_SCALE, 0.02 * SHIP_SCALE, 1.4 * SHIP_SCALE]} />
          <meshStandardMaterial
            color="#1a3d5c"
            metalness={0.4}
            roughness={0.6}
            emissive="#0a1d3c"
            emissiveIntensity={0.1}
          />
        </mesh>
        {/* Solar panel frame */}
        <mesh position={[0, -0.51 * SHIP_SCALE, 0]}>
          <boxGeometry args={[0.85 * SHIP_SCALE, 0.01 * SHIP_SCALE, 1.45 * SHIP_SCALE]} />
          <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.5} />
        </mesh>
      </group>

      {/* Engine section - rear block */}
      <mesh position={[-0.65 * SHIP_SCALE, 0, 0]}>
        <boxGeometry args={[0.3 * SHIP_SCALE, 0.35 * SHIP_SCALE, 0.35 * SHIP_SCALE]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Main engine nozzle - center */}
      <mesh position={[-0.85 * SHIP_SCALE, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12 * SHIP_SCALE, 0.15 * SHIP_SCALE, 0.25 * SHIP_SCALE, 16]} />
        <meshStandardMaterial color="#606060" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Top thruster */}
      <mesh position={[-0.75 * SHIP_SCALE, 0.15 * SHIP_SCALE, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06 * SHIP_SCALE, 0.08 * SHIP_SCALE, 0.15 * SHIP_SCALE, 12]} />
        <meshStandardMaterial color="#505050" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Bottom thruster */}
      <mesh position={[-0.75 * SHIP_SCALE, -0.15 * SHIP_SCALE, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06 * SHIP_SCALE, 0.08 * SHIP_SCALE, 0.15 * SHIP_SCALE, 12]} />
        <meshStandardMaterial color="#505050" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Engine glow - main */}
      <pointLight position={[-0.95 * SHIP_SCALE, 0, 0]} intensity={0.04} distance={6 * SHIP_SCALE} color="#60a5fa" />

      {/* Engine glow - thrusters */}
      <pointLight position={[-0.85 * SHIP_SCALE, 0.15 * SHIP_SCALE, 0]} intensity={0.015} distance={3 * SHIP_SCALE} color="#60a5fa" />
      <pointLight position={[-0.85 * SHIP_SCALE, -0.15 * SHIP_SCALE, 0]} intensity={0.015} distance={3 * SHIP_SCALE} color="#60a5fa" />

      {/* Exhaust glow - main engine */}
      <mesh position={[-0.95 * SHIP_SCALE, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.12 * SHIP_SCALE, 0.2 * SHIP_SCALE, 16]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.7} />
      </mesh>

      {/* Exhaust glow - top thruster */}
      <mesh position={[-0.82 * SHIP_SCALE, 0.15 * SHIP_SCALE, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.06 * SHIP_SCALE, 0.12 * SHIP_SCALE, 12]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.6} />
      </mesh>

      {/* Exhaust glow - bottom thruster */}
      <mesh position={[-0.82 * SHIP_SCALE, -0.15 * SHIP_SCALE, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.06 * SHIP_SCALE, 0.12 * SHIP_SCALE, 12]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.6} />
      </mesh>

      {/* Communication antenna */}
      <mesh position={[0.2 * SHIP_SCALE, 0.3 * SHIP_SCALE, 0]}>
        <cylinderGeometry args={[0.01 * SHIP_SCALE, 0.01 * SHIP_SCALE, 0.15 * SHIP_SCALE, 8]} />
        <meshStandardMaterial color="#808080" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Engine trail particles */}
      <EngineTrail
        propulsion={selectedPropulsion}
        isActive={journeyStatus === 'traveling'}
        flightPhase={flightPhase}
      />
    </group>
  );
}
