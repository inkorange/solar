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

  const { selectedPlanet, setSelectedPlanet, scaleMode, showLabels, simulationTime, timeSpeed, isPaused } = useStore();
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
    if (meshRef.current && !isPaused) {
      const rotationSpeed = data.rotationPeriod > 0 ? 1 / (data.rotationPeriod * 24 * 60) : 0;
      meshRef.current.rotation.y += delta * rotationSpeed * timeSpeed * (data.rotationPeriod < 0 ? -1 : 1);
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
        castShadow
      >
        <sphereGeometry args={[planetSize, 32, 32]} />
        {texture ? (
          <meshStandardMaterial
            map={texture}
            roughness={0.9}
            metalness={0}
          />
        ) : (
          <meshStandardMaterial
            color={data.color}
            roughness={0.9}
            metalness={0}
          />
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
          opacity={data.type === 'Gas Giant' ? 0.25 : 
                  data.type === 'Ice Giant' ? 0.2 :
                  data.name === 'Venus' ? 0.3 : 0.15}
        />
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
        <Html
          position={[0, planetSize * 1.8, 0]}
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
              fontSize: '12px',
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
