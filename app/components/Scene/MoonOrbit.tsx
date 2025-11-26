'use client';

import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { Vector3 } from 'three';
import { SCALE_FACTORS, PlanetData, PLANETS, DWARF_PLANETS } from '@/app/data/planets';
import { useStore } from '@/app/store/useStore';
import { generateMoonOrbitPath } from '@/app/lib/orbital-mechanics';

interface MoonOrbitProps {
  moonData: PlanetData;
  parentPlanet: PlanetData;
  color?: string;
  opacity?: number;
}

export default function MoonOrbit({ moonData, parentPlanet, color = '#888888', opacity = 0.3 }: MoonOrbitProps) {
  const { scaleMode, showOrbits, simulationTime } = useStore();

  const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
  const planetScaleFactor = scaleFactor.DISTANCE;
  const moonScaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL.MOON_DISTANCE : SCALE_FACTORS.REALISTIC.MOON_DISTANCE;

  // Generate moon orbit path around parent planet
  // Note: We pass simulationTime to get Earth's position, but the orbit itself is geometric
  const points = useMemo(() => {
    const allBodies = [...PLANETS, ...DWARF_PLANETS];
    const pathPoints = generateMoonOrbitPath(
      moonData,
      parentPlanet,
      simulationTime,
      planetScaleFactor,
      moonScaleFactor,
      allBodies,
      256  // Higher resolution for smooth circle
    );

    return pathPoints.map(p => new Vector3(p.x, p.y, p.z));
  }, [moonData, parentPlanet, simulationTime, planetScaleFactor, moonScaleFactor]);

  if (!showOrbits) return null;
  if (points.length === 0) return null;

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
