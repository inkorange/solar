'use client';

import { useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader, DoubleSide, Mesh } from 'three';

interface PlanetRingsProps {
  innerRadius: number;
  outerRadius: number;
  texture?: string;
  opacity?: number;
}

export default function PlanetRings({
  innerRadius,
  outerRadius,
  texture,
  opacity = 0.8,
}: PlanetRingsProps) {
  const ringRef = useRef<Mesh>(null);

  // Load ring texture if provided
  const ringTexture = texture ? useLoader(TextureLoader, texture) : null;

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[innerRadius, outerRadius, 64]} />
      {ringTexture ? (
        <meshBasicMaterial
          map={ringTexture}
          side={DoubleSide}
          transparent
          opacity={opacity}
        />
      ) : (
        <meshBasicMaterial
          color="#c9a97a"
          side={DoubleSide}
          transparent
          opacity={opacity}
        />
      )}
    </mesh>
  );
}
