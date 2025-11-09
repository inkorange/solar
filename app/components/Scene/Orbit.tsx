'use client';

import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { Vector3 } from 'three';
import { SCALE_FACTORS, PlanetData } from '@/app/data/planets';
import { useStore } from '@/app/store/useStore';
import { generateEllipticalOrbitPath } from '@/app/lib/orbital-mechanics';

interface OrbitProps {
  planetData: PlanetData;
  color?: string;
  opacity?: number;
}

export default function Orbit({ planetData, color = '#ffffff', opacity = 0.2 }: OrbitProps) {
  const { scaleMode, showOrbits } = useStore();

  const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;

  // Generate elliptical orbit path points
  const points = useMemo(() => {
    const pathPoints = generateEllipticalOrbitPath(planetData, scaleFactor.DISTANCE, 128);
    return pathPoints.map(p => new Vector3(p.x, p.y, p.z));
  }, [planetData, scaleFactor.DISTANCE]);

  if (!showOrbits) return null;

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1}
      transparent
      opacity={opacity}
    />
  );
}
