'use client';

import { BackSide } from 'three';

interface AtmosphereProps {
  radius: number;
  color?: string;
  opacity?: number;
}

export default function Atmosphere({ radius, color = '#4169e1', opacity = 0.2 }: AtmosphereProps) {
  return (
    <>
      {/* Outer glow layer - positioned away from planet surface */}
      <mesh>
        <sphereGeometry args={[radius * 1.2, 64, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity * 1.5}
          side={BackSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Middle glow layer */}
      <mesh>
        <sphereGeometry args={[radius * 1.15, 64, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity * 2.5}
          side={BackSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Inner bright layer - closest to planet but not overlapping */}
      <mesh>
        <sphereGeometry args={[radius * 1.1, 64, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity * 4}
          side={BackSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}
