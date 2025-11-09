'use client';

import { useRef, useMemo } from 'react';
import { Points } from 'three';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Stars() {
  const pointsRef = useRef<Points>(null);

  // Generate random star positions
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(5000 * 3);
    const colors = new Float32Array(5000 * 3);

    for (let i = 0; i < 5000; i++) {
      // Random position in a sphere
      const radius = 500 + Math.random() * 500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Slight color variation for stars
      const colorVariation = 0.8 + Math.random() * 0.2;
      colors[i * 3] = colorVariation;
      colors[i * 3 + 1] = colorVariation;
      colors[i * 3 + 2] = colorVariation;
    }

    return [positions, colors];
  }, []);

  // Gentle rotation for depth effect
  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.8}
      />
    </points>
  );
}
