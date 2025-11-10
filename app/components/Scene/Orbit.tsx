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

  // Generate elliptical orbit path points with adaptive segment count
  const points = useMemo(() => {
    // Base segments for distant view
    const baseSegments = 1024;

    // If camera is close to this planet, increase resolution
    // We'll compute an approximate distance from camera to planet's semi-major axis
    // and scale segments between baseSegments and a larger maxSegments
    const maxSegments = 2048; // clamp upper bound for performance

    // Estimate distance from camera to orbit (use planet's distance from sun scaled)
    const estimatedOrbitRadius = Math.abs(planetData.distanceFromSun * scaleFactor.DISTANCE);

    // Camera distance will be read inside useMemo by capturing camera position now
    // (three's camera position is reactive but using a snapshot is fine for memoization)
    const camPos = camera.position;
    const camDistance = Math.sqrt(camPos.x * camPos.x + camPos.y * camPos.y + camPos.z * camPos.z);

    // Closer camera distance -> more segments. We'll invert and scale.
    // Normalize camera distance relative to orbit radius to determine level of detail.
    const relative = Math.max(0.1, camDistance / (estimatedOrbitRadius + 1e-6));

    // Map relative to a multiplier: when relative < 1 (camera closer than orbit radius) increase segments
    let segments = baseSegments;
    if (relative < 1) {
      // camera is within orbit radius, increase segments proportionally
      const t = 1 - relative; // 0..1 (1 means very close)
      // Interpolate segments between base and max
      segments = Math.round(baseSegments + (maxSegments - baseSegments) * Math.pow(t, 1.5));
    }

    // Clamp segments
    segments = Math.max(baseSegments, Math.min(maxSegments, segments));

    const pathPoints = generateEllipticalOrbitPath(planetData, scaleFactor.DISTANCE, segments);
    return pathPoints.map(p => new Vector3(p.x, p.y, p.z));
  }, [planetData, scaleFactor.DISTANCE, camera.position]);

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
    const minOpacity = opacity * 0.05; // Minimum opacity for very distant orbits
    const maxOpacity = opacity * 0.5; // Maximum opacity for close orbits
    const fadeStart = 10; // Distance where fading starts
    const fadeEnd = 900; // Distance where minimum opacity is reached

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
