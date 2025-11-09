'use client';

import { useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { Vector3 } from 'three';
import { SCALE_FACTORS, PlanetData } from '@/app/data/planets';
import { useStore } from '@/app/store/useStore';
import { generateEllipticalOrbitPath } from '@/app/lib/orbital-mechanics';
import { calculateEllipticalOrbitPosition } from '@/app/lib/orbital-mechanics';

interface OrbitProps {
  planetData: PlanetData;
  color?: string;
  opacity?: number;
}

export default function Orbit({ planetData, color = '#ffffff', opacity = 0.2 }: OrbitProps) {
  const { scaleMode, showOrbits, simulationTime } = useStore();
  const { camera } = useThree();
  const [distanceOpacity, setDistanceOpacity] = useState(opacity);

  const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;

  // Generate elliptical orbit path points
  const points = useMemo(() => {
    const pathPoints = generateEllipticalOrbitPath(planetData, scaleFactor.DISTANCE, 128);
    return pathPoints.map(p => new Vector3(p.x, p.y, p.z));
  }, [planetData, scaleFactor.DISTANCE]);

  // Calculate atmospheric perspective based on camera distance
  useFrame(() => {
    // Get planet's current position
    const planetPos = calculateEllipticalOrbitPosition(
      simulationTime,
      planetData,
      scaleFactor.DISTANCE
    );

    // Calculate distance from camera to planet
  // calculateEllipticalOrbitPosition returns { x, z } (y is omitted/assumed 0)
  const distance = camera.position.distanceTo(new Vector3(planetPos.x, 0, planetPos.z));

    // Apply atmospheric perspective: closer = more opaque, farther = more transparent
    // Using a formula that gradually reduces opacity based on distance
    const minOpacity = opacity * 0.2; // Minimum opacity for very distant orbits
    const maxOpacity = opacity * 1.5; // Maximum opacity for close orbits
    const fadeStart = 50; // Distance where fading starts
    const fadeEnd = 500; // Distance where minimum opacity is reached

    let calculatedOpacity;
    if (distance < fadeStart) {
      calculatedOpacity = maxOpacity;
    } else if (distance > fadeEnd) {
      calculatedOpacity = minOpacity;
    } else {
      // Linear interpolation between fadeStart and fadeEnd
      const t = (distance - fadeStart) / (fadeEnd - fadeStart);
      calculatedOpacity = maxOpacity - (maxOpacity - minOpacity) * t;
    }

    setDistanceOpacity(calculatedOpacity);
  });

  if (!showOrbits) return null;

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1}
      transparent
      opacity={distanceOpacity}
    />
  );
}
