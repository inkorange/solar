'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, BufferGeometry, Float32BufferAttribute, PointsMaterial, Color, CanvasTexture } from 'three';
import { ASTEROID_BELT_CONFIG } from '@/app/data/asteroids';
import { SCALE_FACTORS } from '@/app/data/planets';
import { useStore } from '@/app/store/useStore';

const ASTEROID_COUNT = 10000; // Increased from 2000 for better visualization

export default function AsteroidBelt() {
  const pointsRef = useRef<Points>(null);
  const { scaleMode, simulationTime, isPaused } = useStore();

  const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;

  // Create circular texture for points
  const circleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }

    return new CanvasTexture(canvas);
  }, []);

  // Generate asteroid data (static properties)
  const asteroidData = useMemo(() => {
    const data = [];

    // Deterministic pseudo-random generator based on index to avoid impure Math.random in render
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 9301 + 49297) * 233280.0;
      return x - Math.floor(x);
    };

    for (let i = 0; i < ASTEROID_COUNT; i++) {
      // Deterministic 'random' values based on index
      const r1 = seededRandom(i * 3 + 1);
      const r2 = seededRandom(i * 3 + 2);
      const r3 = seededRandom(i * 3 + 3);

      // Angle for initial position
      const angle = r1 * Math.PI * 2;

      // Distance from sun (between Mars ~1.5 AU and Jupiter ~5.2 AU)
      const distance =
        (ASTEROID_BELT_CONFIG.innerRadius + r2 * (ASTEROID_BELT_CONFIG.outerRadius - ASTEROID_BELT_CONFIG.innerRadius)) *
        scaleFactor.DISTANCE;

      // Add vertical variation (belt has some thickness)
      const y = (r3 - 0.5) * 0.8 * scaleFactor.DISTANCE;

      // Calculate orbital period using Kepler's 3rd law
      const distanceInAU = distance / scaleFactor.DISTANCE;
      const orbitalPeriod = Math.sqrt(Math.pow(distanceInAU, 3)) * 365.25; // days

      data.push({
        initialAngle: angle,
        distance,
        y,
        orbitalPeriod,
      });
    }

    return data;
  }, [scaleFactor.DISTANCE]);

  // Create geometry with initial positions
  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const positions = new Float32Array(ASTEROID_COUNT * 3);

    asteroidData.forEach((asteroid, i) => {
      const idx = i * 3;
      positions[idx] = Math.cos(asteroid.initialAngle) * asteroid.distance;
      positions[idx + 1] = asteroid.y;
      positions[idx + 2] = Math.sin(asteroid.initialAngle) * asteroid.distance;
    });

    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    return geo;
  }, [asteroidData]);

  // Animate asteroid positions based on orbital mechanics
  useFrame(() => {
    if (!pointsRef.current || isPaused) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

    asteroidData.forEach((asteroid, i) => {
      // Calculate current angle based on orbital period
      const angularVelocity = (2 * Math.PI) / (asteroid.orbitalPeriod * 24 * 60 * 60);
      const currentAngle = asteroid.initialAngle + (simulationTime * angularVelocity);

      const idx = i * 3;
      positions[idx] = Math.cos(currentAngle) * asteroid.distance;
      positions[idx + 1] = asteroid.y;
      positions[idx + 2] = Math.sin(currentAngle) * asteroid.distance;
    });

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.15}
        color={new Color(ASTEROID_BELT_CONFIG.color)}
        map={circleTexture}
        transparent
        opacity={ASTEROID_BELT_CONFIG.opacity}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
}
