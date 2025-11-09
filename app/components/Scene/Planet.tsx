'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Mesh, TextureLoader } from 'three';
import { PlanetData, SCALE_FACTORS } from '@/app/data/planets';
import { useStore } from '@/app/store/useStore';
import { Html } from '@react-three/drei';
import PlanetRings from './PlanetRings';
import Atmosphere from './Atmosphere';
import { calculateEllipticalOrbitPosition } from '@/app/lib/orbital-mechanics';

interface PlanetProps {
  data: PlanetData;
}

export default function Planet({ data }: PlanetProps) {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  const { selectedPlanet, setSelectedPlanet, scaleMode, showLabels, simulationTime } = useStore();
  const isSelected = selectedPlanet?.name === data.name;

  // Load texture if available
  const texture = data.texture ? useLoader(TextureLoader, data.texture) : null;

  // Calculate scaled values based on scale mode
  const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
  const planetSize = (data.diameter / 12742) * scaleFactor.SIZE * 5; // Relative to Earth

  // Calculate position based on elliptical orbital mechanics
  const orbitalPosition = useMemo(() => {
    return calculateEllipticalOrbitPosition(
      simulationTime,
      data,
      scaleFactor.DISTANCE
    );
  }, [simulationTime, data, scaleFactor.DISTANCE]);

  // Rotate planet on its axis
  useFrame((state, delta) => {
    if (meshRef.current) {
      const rotationSpeed = data.rotationPeriod > 0 ? 1 / (data.rotationPeriod * 24 * 60) : 0;
      meshRef.current.rotation.y += delta * rotationSpeed * (data.rotationPeriod < 0 ? -1 : 1);
    }

    // Update group position for orbital motion
    if (groupRef.current) {
      groupRef.current.position.x = orbitalPosition.x;
      groupRef.current.position.z = orbitalPosition.z;
    }
  });

  const handleClick = () => {
    setSelectedPlanet(isSelected ? null : data);
  };

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[planetSize, 32, 32]} />
        {texture ? (
          <meshStandardMaterial map={texture} />
        ) : (
          <meshStandardMaterial color={data.color} />
        )}
      </mesh>

      {/* Planetary rings with scientifically accurate dimensions */}
      {data.hasRings && data.ringData && (
        <PlanetRings
          innerRadius={planetSize * data.ringData.innerRadiusRatio}
          outerRadius={planetSize * data.ringData.outerRadiusRatio}
          texture={data.ringData.texture}
          opacity={data.ringData.opacity}
        />
      )}

      {/* Atmospheric glow for planets with significant atmospheres */}
      {data.atmosphere.length > 0 && data.atmosphere[0] !== 'Trace' && (
        <Atmosphere
          radius={planetSize}
          color={data.color}
          opacity={0.15}
        />
      )}

      {/* Selection indicator */}
      {isSelected && (
        <mesh>
          <ringGeometry args={[planetSize * 1.5, planetSize * 1.7, 64]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Hover indicator */}
      {hovered && !isSelected && (
        <mesh>
          <ringGeometry args={[planetSize * 1.5, planetSize * 1.6, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
      )}

      {/* Label */}
      {showLabels && (
        <Html distanceFactor={50}>
          <div
            style={{
              color: isSelected ? '#60a5fa' : hovered ? '#fff' : '#aaa',
              fontSize: '12px',
              fontFamily: 'var(--font-geist-sans)',
              userSelect: 'none',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              transform: 'translate(-50%, 20px)',
            }}
          >
            {data.name}
          </div>
        </Html>
      )}
    </group>
  );
}
