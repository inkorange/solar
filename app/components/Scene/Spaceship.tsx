'use client';

import { useRef, useMemo } from 'react';
import { Mesh, Vector3, Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { useStore } from '@/app/store/useStore';
import { SCALE_FACTORS, PLANETS } from '@/app/data/planets';
import { calculateTravelTime, getPropulsionById } from '@/app/data/propulsion';
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
    if (journeyStatus !== 'traveling' || !origin || !destination || !selectedPropulsion || !destinationPositionAtArrival) {
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

    const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;

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

    // Calculate progress (0 to 1)
    const propulsion = getPropulsionById(selectedPropulsion);
    if (!propulsion) return originPos;

    const totalTime = calculateTravelTime(totalDistance, propulsion);
    const progress = Math.min(1, journeyElapsedTime / totalTime);

    // Interpolate position from departure point to intercept point
    return new Vector3().lerpVectors(originPos, destPos, progress);
  }, [journeyStatus, origin, destination, selectedPropulsion, journeyElapsedTime, journeyStartTime, totalDistance, destinationPositionAtArrival, scaleMode, simulationTime]);

  // Update spaceship position and rotation
  useFrame(() => {
    if (groupRef.current) {
      // Calculate direction of travel
      if (previousPositionRef.current) {
        const direction = new Vector3()
          .subVectors(position, previousPositionRef.current)
          .normalize();

        // Only rotate if there's significant movement
        if (direction.length() > 0.001) {
          // Calculate angle in XZ plane (horizontal rotation)
          const angle = Math.atan2(direction.z, direction.x);

          // Rotate the entire group to face travel direction
          // Spaceship model points in +X direction by default (Math.PI / 2 rotation applied in mesh)
          groupRef.current.rotation.y = -angle;
        }
      }

      // Update position
      groupRef.current.position.copy(position);

      // Store current position for next frame
      previousPositionRef.current = position.clone();

      // Update the store so camera can follow
      setSpaceshipPosition([position.x, position.y, position.z]);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Realistic spacecraft design */}

      {/* Main fuselage - elongated body */}
      <mesh ref={bodyRef} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 1.2, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Nose cone - aerodynamic front */}
      <mesh position={[0.7, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.25, 0.5, 16]} />
        <meshStandardMaterial color="#d0d0d0" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Cockpit window - transparent */}
      <mesh position={[0.5, 0, 0.26]} rotation={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16, 0, Math.PI]} />
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
      <group position={[0, 0.25, 0]}>
        <mesh position={[0, 0.5, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.8, 0.02, 1.4]} />
          <meshStandardMaterial
            color="#1a3d5c"
            metalness={0.4}
            roughness={0.6}
            emissive="#0a1d3c"
            emissiveIntensity={0.1}
          />
        </mesh>
        {/* Solar panel frame */}
        <mesh position={[0, 0.51, 0]}>
          <boxGeometry args={[0.85, 0.01, 1.45]} />
          <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.5} />
        </mesh>
      </group>

      {/* Lower solar panel wing */}
      <group position={[0, -0.25, 0]}>
        <mesh position={[0, -0.5, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.8, 0.02, 1.4]} />
          <meshStandardMaterial
            color="#1a3d5c"
            metalness={0.4}
            roughness={0.6}
            emissive="#0a1d3c"
            emissiveIntensity={0.1}
          />
        </mesh>
        {/* Solar panel frame */}
        <mesh position={[0, -0.51, 0]}>
          <boxGeometry args={[0.85, 0.01, 1.45]} />
          <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.5} />
        </mesh>
      </group>

      {/* Engine section - rear block */}
      <mesh position={[-0.65, 0, 0]}>
        <boxGeometry args={[0.3, 0.35, 0.35]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Main engine nozzle - center */}
      <mesh position={[-0.85, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.15, 0.25, 16]} />
        <meshStandardMaterial color="#606060" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Top thruster */}
      <mesh position={[-0.75, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.08, 0.15, 12]} />
        <meshStandardMaterial color="#505050" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Bottom thruster */}
      <mesh position={[-0.75, -0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.08, 0.15, 12]} />
        <meshStandardMaterial color="#505050" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Engine glow - main */}
      <pointLight position={[-0.95, 0, 0]} intensity={0.8} distance={6} color="#60a5fa" />

      {/* Engine glow - thrusters */}
      <pointLight position={[-0.85, 0.15, 0]} intensity={0.3} distance={3} color="#60a5fa" />
      <pointLight position={[-0.85, -0.15, 0]} intensity={0.3} distance={3} color="#60a5fa" />

      {/* Exhaust glow - main engine */}
      <mesh position={[-0.95, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.12, 0.2, 16]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.7} />
      </mesh>

      {/* Exhaust glow - top thruster */}
      <mesh position={[-0.82, 0.15, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.06, 0.12, 12]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.6} />
      </mesh>

      {/* Exhaust glow - bottom thruster */}
      <mesh position={[-0.82, -0.15, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.06, 0.12, 12]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.6} />
      </mesh>

      {/* Communication antenna */}
      <mesh position={[0.2, 0.3, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.15, 8]} />
        <meshStandardMaterial color="#808080" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Engine trail particles */}
      <EngineTrail propulsion={selectedPropulsion} isActive={journeyStatus === 'traveling'} />
    </group>
  );
}
