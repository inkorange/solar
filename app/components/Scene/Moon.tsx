'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Mesh, TextureLoader, Vector3, Group, Texture } from 'three';
import { SCALE_FACTORS } from '@/app/data/planets';
import { MoonData } from '@/app/data/moons';
import { useStore } from '@/app/store/useStore';

interface MoonProps {
  planetPosition: Vector3; // Position of the parent planet
  moonData: MoonData; // Moon data to render
}

// Component for moons with textures
function MoonWithTexture({ planetPosition, moonData }: MoonProps) {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group | null>(null);
  const { scaleMode, simulationTime, timeSpeed, isPaused } = useStore();

  // Load texture - this hook is always called in this component
  const texture = useLoader(TextureLoader, moonData.texture!);

  return <MoonMesh
    meshRef={meshRef}
    groupRef={groupRef}
    planetPosition={planetPosition}
    moonData={moonData}
    texture={texture}
    scaleMode={scaleMode}
    simulationTime={simulationTime}
    timeSpeed={timeSpeed}
    isPaused={isPaused}
  />;
}

// Component for moons without textures
function MoonWithoutTexture({ planetPosition, moonData }: MoonProps) {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group | null>(null);
  const { scaleMode, simulationTime, timeSpeed, isPaused } = useStore();

  return <MoonMesh
    meshRef={meshRef}
    groupRef={groupRef}
    planetPosition={planetPosition}
    moonData={moonData}
    texture={null}
    scaleMode={scaleMode}
    simulationTime={simulationTime}
    timeSpeed={timeSpeed}
    isPaused={isPaused}
  />;
}

// Shared rendering logic
function MoonMesh({
  meshRef,
  groupRef,
  planetPosition,
  moonData,
  texture,
  scaleMode,
  simulationTime,
  timeSpeed,
  isPaused
}: {
  meshRef: React.RefObject<Mesh | null>;
  groupRef: React.RefObject<Group | null>;
  planetPosition: Vector3;
  moonData: MoonData;
  texture: Texture | null;
  scaleMode: string;
  simulationTime: number;
  timeSpeed: number;
  isPaused: boolean;
}) {

  // Calculate scaled values
  const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
  const moonSize = (moonData.diameter / 12742) * scaleFactor.SIZE * 5; // Relative to Earth

  // Convert distance from km to scene units
  // Moon distances need separate scaling from planetary orbits
  const distanceInAU = moonData.distanceFromPlanet / 149597870.7; // km to AU
  const orbitRadius = distanceInAU * scaleFactor.MOON_DISTANCE;

  // Calculate moon's position in orbit around parent planet
  const orbitalPosition = useMemo(() => {
    // Only animate Earth's moon for now, keep others static
    if (moonData.name !== 'Moon') {
      // Static position for other moons (initial position)
      return {
        x: orbitRadius,
        z: 0,
      };
    }

    // Earth's moon - full orbital animation
    const orbitalPeriodSeconds = moonData.orbitalPeriod * 24 * 60 * 60;
    // Handle retrograde orbits (inclination > 90°) by reversing direction
    const isRetrograde = moonData.orbitalInclination > 90;
    const direction = isRetrograde ? -1 : 1;
    const angle = direction * (simulationTime / orbitalPeriodSeconds) * Math.PI * 2;

    return {
      x: Math.cos(angle) * orbitRadius,
      z: Math.sin(angle) * orbitRadius,
    };
  }, [simulationTime, orbitRadius, moonData.orbitalPeriod, moonData.orbitalInclination, moonData.name]);

  // Rotate moon on its axis and update orbital position
  useFrame((state, delta) => {
    if (meshRef.current && !isPaused && moonData.tidally_locked) {
      // Tidally locked rotation (rotates once per orbit)
      const rotationSpeed = 1 / (moonData.orbitalPeriod * 24 * 60);
      meshRef.current.rotation.y += delta * rotationSpeed * timeSpeed;
    }

    // Update moon position relative to parent planet
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

// Default export: choose the appropriate component based on whether texture exists
export default function Moon({ planetPosition, moonData }: MoonProps) {
  if (moonData.texture) {
    return <MoonWithTexture planetPosition={planetPosition} moonData={moonData} />;
  }
  return <MoonWithoutTexture planetPosition={planetPosition} moonData={moonData} />;
}
