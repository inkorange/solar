'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Mesh, TextureLoader, Vector3 } from 'three';
import { SCALE_FACTORS } from '@/app/data/planets';
import { useStore } from '@/app/store/useStore';

interface MoonProps {
  planetPosition: Vector3; // Position of the parent planet
}

export default function Moon({ planetPosition }: MoonProps) {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<any>(null);

  const { scaleMode, simulationTime, timeSpeed, isPaused } = useStore();

  // Load moon texture
  const texture = useLoader(TextureLoader, '/textures/moon.jpg');

  // Moon data
  const moonData = {
    name: 'Moon',
    diameter: 3474, // km
    distanceFromEarth: 0.00257, // AU (384,400 km)
    orbitalPeriod: 27.3, // days
    color: '#c0c0c0',
  };

  // Calculate scaled values
  const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
  const moonSize = (moonData.diameter / 12742) * scaleFactor.SIZE * 5; // Relative to Earth
  const orbitRadius = moonData.distanceFromEarth * scaleFactor.DISTANCE;

  // Calculate moon's position in orbit around Earth
  const orbitalPosition = useMemo(() => {
    const orbitalPeriodSeconds = moonData.orbitalPeriod * 24 * 60 * 60;
    const angle = (simulationTime / orbitalPeriodSeconds) * Math.PI * 2;

    return {
      x: Math.cos(angle) * orbitRadius,
      z: Math.sin(angle) * orbitRadius,
    };
  }, [simulationTime, orbitRadius]);

  // Rotate moon on its axis and update orbital position
  useFrame((state, delta) => {
    if (meshRef.current && !isPaused) {
      // Moon's rotation (tidally locked, so it rotates once per orbit)
      const rotationSpeed = 1 / (moonData.orbitalPeriod * 24 * 60);
      meshRef.current.rotation.y += delta * rotationSpeed * timeSpeed;
    }

    // Update moon position relative to Earth
    if (groupRef.current) {
      groupRef.current.position.x = planetPosition.x + orbitalPosition.x;
      groupRef.current.position.z = planetPosition.z + orbitalPosition.z;
      groupRef.current.position.y = planetPosition.y;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[moonSize, 32, 32]} />
        {texture ? (
          <meshStandardMaterial
            map={texture}
            roughness={0.9}
            metalness={0}
          />
        ) : (
          <meshStandardMaterial
            color={moonData.color}
            roughness={0.9}
            metalness={0}
          />
        )}
      </mesh>
    </group>
  );
}
