'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Mesh, TextureLoader, Vector3, Group, Texture } from 'three';
import { Html } from '@react-three/drei';
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
  const [hovered, setHovered] = useState(false);
  const { scaleMode, simulationTime, timeSpeed, isPaused, selectedPlanet, setSelectedPlanet, showLabels, journeyStatus, showWelcome } = useStore();

  // Load texture - this hook is always called in this component
  const texture = useLoader(TextureLoader, moonData.texture!);

  // Check if this moon is selected (by comparing names since moons don't have same type as planets)
  const isSelected = selectedPlanet?.name === moonData.name;

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
    hovered={hovered}
    setHovered={setHovered}
    isSelected={isSelected}
    setSelectedPlanet={setSelectedPlanet}
    showLabels={showLabels}
    journeyStatus={journeyStatus}
    showWelcome={showWelcome}
  />;
}

// Component for moons without textures
function MoonWithoutTexture({ planetPosition, moonData }: MoonProps) {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group | null>(null);
  const [hovered, setHovered] = useState(false);
  const { scaleMode, simulationTime, timeSpeed, isPaused, selectedPlanet, setSelectedPlanet, showLabels, journeyStatus, showWelcome } = useStore();

  const isSelected = selectedPlanet?.name === moonData.name;

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
    hovered={hovered}
    setHovered={setHovered}
    isSelected={isSelected}
    setSelectedPlanet={setSelectedPlanet}
    showLabels={showLabels}
    journeyStatus={journeyStatus}
    showWelcome={showWelcome}
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
  isPaused,
  hovered,
  setHovered,
  isSelected,
  setSelectedPlanet,
  showLabels,
  journeyStatus,
  showWelcome
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
  hovered: boolean;
  setHovered: (hovered: boolean) => void;
  isSelected: boolean;
  setSelectedPlanet: (planet: any) => void;
  showLabels: boolean;
  journeyStatus: string;
  showWelcome: boolean;
}) {
  const { camera } = useThree();
  const [cameraDistance, setCameraDistance] = useState(Infinity);

  // Calculate scaled values
  const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
  const moonSize = (moonData.diameter / 12742) * scaleFactor.SIZE * 5; // Relative to Earth

  // Distance threshold for showing labels (in scene units)
  // Adjust this value to control when labels appear
  const LABEL_DISTANCE_THRESHOLD = 100;

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

      // Calculate distance from camera to moon
      const moonPos = new Vector3(
        groupRef.current.position.x,
        groupRef.current.position.y,
        groupRef.current.position.z
      );
      const distance = camera.position.distanceTo(moonPos);
      setCameraDistance(distance);
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    // Convert moon data to a format compatible with planet data for the store
    setSelectedPlanet(moonData as any);
  };

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
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

      {/* Selection indicator ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <ringGeometry args={[moonSize * 1.5, moonSize * 1.6, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
      )}

      {/* Label - only show when camera is close and if showLabel is not explicitly false */}
      {showLabels && moonData.showLabel !== false && !showWelcome && journeyStatus !== 'selecting-propulsion' && cameraDistance < LABEL_DISTANCE_THRESHOLD && (
        <Html
          position={[0, moonSize * 2, 0]}
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
              fontSize: '10px',
              fontFamily: 'var(--font-geist-sans)',
              userSelect: 'none',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {moonData.name}
          </div>
        </Html>
      )}
    </group>
  );
}

// Sprite-based moon component for small moons (performance optimization)
function MoonSprite({ planetPosition, moonData }: MoonProps) {
  const groupRef = useRef<Group | null>(null);
  const { scaleMode, showLabels, journeyStatus, showWelcome } = useStore();

  // Calculate scaled values
  const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
  const moonSize = (moonData.diameter / 12742) * scaleFactor.SIZE * 5; // Relative to Earth

  // Convert distance from km to scene units
  const distanceInAU = moonData.distanceFromPlanet / 149597870.7; // km to AU
  const orbitRadius = distanceInAU * scaleFactor.MOON_DISTANCE;

  // Calculate moon's position in orbit around parent planet (static position)
  const orbitalPosition = useMemo(() => {
    return {
      x: orbitRadius,
      z: 0,
    };
  }, [orbitRadius]);

  // Update moon position
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x = planetPosition.x + orbitalPosition.x;
      groupRef.current.position.z = planetPosition.z + orbitalPosition.z;
      groupRef.current.position.y = planetPosition.y;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Simple sprite for performance */}
      <sprite>
        <spriteMaterial
          attach="material"
          color={moonData.color}
          opacity={1.0}
          depthWrite={false}
        />
        <circleGeometry args={[moonSize, 16]} />
      </sprite>

      {/* Optional label for larger sprite moons */}
      {showLabels && moonData.showLabel && !showWelcome && journeyStatus !== 'selecting-propulsion' && (
        <Html
          position={[0, moonSize * 2, 0]}
          center
          sprite
          style={{
            transition: 'all 0.2s',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              color: '#aaa',
              fontSize: '10px',
              fontFamily: 'var(--font-geist-sans)',
              userSelect: 'none',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {moonData.name}
          </div>
        </Html>
      )}
    </group>
  );
}

// Default export: choose the appropriate component based on rendering mode
export default function Moon({ planetPosition, moonData }: MoonProps) {
  // Use sprite for small moons (performance optimization)
  if (moonData.useSprite) {
    return <MoonSprite planetPosition={planetPosition} moonData={moonData} />;
  }

  // Use 3D sphere with/without texture for larger moons
  if (moonData.texture) {
    return <MoonWithTexture planetPosition={planetPosition} moonData={moonData} />;
  }
  return <MoonWithoutTexture planetPosition={planetPosition} moonData={moonData} />;
}
