'use client';

import { useRef, useMemo } from 'react';
import { Mesh, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { useStore } from '@/app/store/useStore';
import { SCALE_FACTORS, PLANETS } from '@/app/data/planets';
import { calculateTravelTime, getPropulsionById } from '@/app/data/propulsion';
import EngineTrail from './EngineTrail';

export default function Spaceship() {
  const bodyRef = useRef<Mesh>(null);
  const groupRef = useRef<any>(null);

  const {
    journeyStatus,
    origin,
    destination,
    selectedPropulsion,
    journeyElapsedTime,
    totalDistance,
    scaleMode,
    simulationTime,
  } = useStore();

  // Calculate current position during journey
  const position = useMemo(() => {
    if (journeyStatus !== 'traveling' || !origin || !destination || !selectedPropulsion) {
      // Default position near Earth
      const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
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

    // Calculate origin and destination positions
    const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;

    // Origin position
    const originRadius = origin.distanceFromSun * scaleFactor.DISTANCE;
    const originPeriodSeconds = origin.orbitalPeriod * 24 * 60 * 60;
    const originAngle = (simulationTime / originPeriodSeconds) * Math.PI * 2;
    const originPos = new Vector3(
      Math.cos(originAngle) * originRadius,
      0,
      Math.sin(originAngle) * originRadius
    );

    // Destination position
    const destRadius = destination.distanceFromSun * scaleFactor.DISTANCE;
    const destPeriodSeconds = destination.orbitalPeriod * 24 * 60 * 60;
    const destAngle = (simulationTime / destPeriodSeconds) * Math.PI * 2;
    const destPos = new Vector3(
      Math.cos(destAngle) * destRadius,
      0,
      Math.sin(destAngle) * destRadius
    );

    // Calculate progress (0 to 1)
    const propulsion = getPropulsionById(selectedPropulsion);
    if (!propulsion) return originPos;

    const totalTime = calculateTravelTime(totalDistance, propulsion);
    const progress = Math.min(1, journeyElapsedTime / totalTime);

    // Interpolate position
    return new Vector3().lerpVectors(originPos, destPos, progress);
  }, [journeyStatus, origin, destination, selectedPropulsion, journeyElapsedTime, totalDistance, scaleMode, simulationTime]);

  // Update spaceship position
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(position);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Simple placeholder spaceship using primitives */}

      {/* Main body - cone pointing forward */}
      <mesh ref={bodyRef} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.3, 1, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Wings */}
      <mesh position={[-0.3, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.1, 0.4, 0.05]} />
        <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh position={[-0.3, -0.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.1, 0.4, 0.05]} />
        <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Engine glow */}
      <pointLight position={[-0.6, 0, 0]} intensity={0.5} distance={5} color="#60a5fa" />

      {/* Small exhaust cone */}
      <mesh position={[-0.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.6} />
      </mesh>

      {/* Engine trail particles */}
      <EngineTrail propulsion={selectedPropulsion} isActive={journeyStatus === 'traveling'} />
    </group>
  );
}
