'use client';

import { BackSide } from 'three';

interface AtmosphereProps {
  radius: number;
  color?: string;
  opacity?: number;
}

export default function Atmosphere({ radius, color = '#4169e1', opacity = 0.2 }: AtmosphereProps) {
  return (
    <mesh>
      <sphereGeometry args={[radius * 1.1, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={BackSide}
      />
    </mesh>
  );
}
