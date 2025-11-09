'use client';

import { BackSide, AdditiveBlending } from 'three';

interface AtmosphereProps {
  radius: number;
  color?: string;
  opacity?: number;
}

export default function Atmosphere({ radius, color = '#4169e1', opacity = 0.08 }: AtmosphereProps) {
  return (
    <>
      {/* Main atmosphere layer */}
      <mesh>
        <sphereGeometry args={[radius * 1.02, 64, 64]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          side={BackSide}
          toneMapped={false}
          depthWrite={false}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Outer diffused glow */}
      <mesh>
        <sphereGeometry args={[radius * 1.07, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity * 0.2}
          side={BackSide}
          toneMapped={false}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
    </>
  );
}
