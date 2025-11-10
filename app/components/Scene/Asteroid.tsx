'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { AsteroidData } from '@/app/data/asteroids';
import { Group } from 'three';
import { SCALE_FACTORS } from '@/app/data/planets';
import { useStore } from '@/app/store/useStore';
import { Html } from '@react-three/drei';
import { calculateEllipticalOrbitPosition } from '@/app/lib/orbital-mechanics';

interface AsteroidProps {
  data: AsteroidData;
}

export default function Asteroid({ data }: AsteroidProps) {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group | null>(null);
  const [hovered, setHovered] = useState(false);

  const { selectedPlanet, setSelectedPlanet, scaleMode, showLabels, simulationTime, timeSpeed, isPaused } = useStore();
  const isSelected = selectedPlanet?.name === data.name;

  // Calculate scaled values based on scale mode
  const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;

  // Scale asteroid size (relative to Earth, but ensure minimum visibility)
  const asteroidSize = Math.max(
    (data.diameter / 12742) * scaleFactor.SIZE * 5,
    0.05 // Minimum size for visibility
  );

  // Calculate position based on elliptical orbital mechanics
  const orbitalPosition = useMemo(() => {
    // Build a minimal PlanetData object to reuse orbital calculation
    // Only supply the fields required by the orbit calculation
    const asteroidAsPlanet: { distanceFromSun: number; orbitalPeriod: number; orbitalEccentricity: number; orbitalInclination: number } = {
      distanceFromSun: data.distanceFromSun,
      orbitalPeriod: data.orbitalPeriod * 365.25,
      orbitalEccentricity: data.orbitalEccentricity || 0,
      orbitalInclination: data.orbitalInclination || 0,
    };

    return calculateEllipticalOrbitPosition(simulationTime, asteroidAsPlanet as any, scaleFactor.DISTANCE);
  }, [simulationTime, data, scaleFactor.DISTANCE]);

  // Rotate asteroid on its axis
  useFrame((state, delta) => {
    if (meshRef.current && !isPaused) {
      // Convert rotation period from hours to a rotation speed
      const rotationSpeed = data.rotationPeriod > 0 ? 1 / (data.rotationPeriod * 60) : 0;
      meshRef.current.rotation.y += delta * rotationSpeed * timeSpeed;
      meshRef.current.rotation.x += delta * rotationSpeed * 0.3 * timeSpeed; // Tumbling effect
    }

    // Update group position for orbital motion
    if (groupRef.current) {
      groupRef.current.position.x = orbitalPosition.x;
      groupRef.current.position.z = orbitalPosition.z;
    }
  });

  const handleClick = () => {
    // Selecting an asteroid is optional; we only set selected planet when clicking a planet.
    // For now, toggle selection to null to avoid type mismatches.
    setSelectedPlanet(isSelected ? null : null);
  };

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Use icosahedron for irregular asteroid shape */}
        <icosahedronGeometry args={[asteroidSize, 1]} />
        <meshStandardMaterial
          color={data.color}
          roughness={1.0}
          metalness={0.1}
        />
      </mesh>

      {/* Hover indicator */}
      {hovered && !isSelected && (
        <mesh>
          <ringGeometry args={[asteroidSize * 1.5, asteroidSize * 1.6, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
      )}

      {/* Label */}
      {showLabels && (
        <Html
          position={[0, asteroidSize * 1.8, 0]}
          center
          sprite
          style={{
            transition: 'all 0.2s',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              color: isSelected ? '#60a5fa' : hovered ? '#fff' : '#aaa',
              fontSize: '11px',
              fontFamily: 'var(--font-geist-sans)',
              userSelect: 'none',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {data.name}
          </div>
        </Html>
      )}
    </group>
  );
}
