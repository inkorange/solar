'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, BufferGeometry, Color } from 'three';
import { PropulsionType } from '@/app/data/propulsion';
import { useStore } from '@/app/store/useStore';

interface EngineTrailProps {
  propulsion: PropulsionType | null;
  isActive: boolean;
  flightPhase: 'accelerating' | 'cruising' | 'decelerating';
}

const PARTICLE_COUNT = 350;
const PARTICLE_LIFETIME = 1.0; // seconds
const SHIP_SCALE = 0.003125; // Match spaceship scale (25% of previous size)

export default function EngineTrail({ propulsion, isActive, flightPhase }: EngineTrailProps) {
  // Only show engine effects when accelerating or decelerating
  const shouldShowEngines = flightPhase === 'accelerating' || flightPhase === 'decelerating';
  const pointsRef = useRef<Points>(null);
  const particleDataRef = useRef<{
    velocities: Float32Array;
    ages: Float32Array;
  } | null>(null);

  const { timeSpeed } = useStore();

  // Configure particle system based on propulsion type
  // Sizes are 50% smaller than before (additional reduction beyond SHIP_SCALE change)
  const particleConfig = useMemo(() => {
    if (!propulsion) {
      return { size: 0.075 * SHIP_SCALE, speed: 1.5 * SHIP_SCALE };
    }

    switch (propulsion) {
      case 'chemical-rocket':
        return { size: 0.1 * SHIP_SCALE, speed: 4.0 * SHIP_SCALE };
      case 'ion-thruster':
        return { size: 0.06 * SHIP_SCALE, speed: 3.0 * SHIP_SCALE };
      case 'solar-sail':
        return { size: 0, speed: 0 }; // No visible exhaust
      case 'nuclear-thermal':
        return { size: 0.09 * SHIP_SCALE, speed: 4.0 * SHIP_SCALE };
      case 'antimatter':
        return { size: 0.125 * SHIP_SCALE, speed: 4.0 * SHIP_SCALE };
      case 'warp-drive':
        return { size: 0.075 * SHIP_SCALE, speed: 4.0 * SHIP_SCALE };
      default:
        return { size: 0.075 * SHIP_SCALE, speed: 3.0 * SHIP_SCALE };
    }
  }, [propulsion]);

  // Generate initial particles
  const { positions, colors, velocities, ages } = useMemo(() => {
    if (!isActive || !shouldShowEngines || propulsion === 'solar-sail') {
      return { positions: null, colors: null };
    }

    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const ages = new Float32Array(PARTICLE_COUNT);

    // Deterministic pseudo-random generator based on index
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 9301 + 49297) * 233280.0;
      return x - Math.floor(x);
    };

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r1 = seededRandom(i * 4 + 1);
      const r2 = seededRandom(i * 4 + 2);
      const r3 = seededRandom(i * 4 + 3);
      const r4 = seededRandom(i * 4 + 4);

      // Start at engine position with tighter spread (scaled to match ship size)
      positions[i * 3] = (-0.85 + r1 * 0.1) * SHIP_SCALE; // x (at engine)
      positions[i * 3 + 1] = (r2 - 0.5) * 0.15 * SHIP_SCALE; // y (tighter)
      positions[i * 3 + 2] = (r3 - 0.5) * 0.15 * SHIP_SCALE; // z (tighter)

      // Random age for staggered start
      ages[i] = r4 * PARTICLE_LIFETIME;

      // Initial white color
      colors[i * 3] = 1.0;     // r
      colors[i * 3 + 1] = 1.0; // g
      colors[i * 3 + 2] = 1.0; // b

      // Move backwards (exhaust direction) with minimal spread
      const spreadAngle = (r2 - 0.5) * 0.2; // Minimal spread angle
      const baseSpeed = particleConfig.speed * (0.8 + r3 * 0.4);
      velocities[i * 3] = -baseSpeed;
      velocities[i * 3 + 1] = Math.sin(spreadAngle) * baseSpeed * 0.03;
      velocities[i * 3 + 2] = Math.cos(spreadAngle) * baseSpeed * 0.03;
    }

    return { positions, colors, velocities, ages };
  }, [isActive, shouldShowEngines, propulsion, particleConfig.speed]);

  // Store particle arrays in ref after initial creation (outside render)
  useEffect(() => {
    if (positions && colors && velocities && ages) {
      particleDataRef.current = { velocities, ages };
    }
  }, [positions, colors, velocities, ages]);

  // Animate particles
  useFrame((state, delta) => {
    if (!pointsRef.current || !positions || !colors || !particleDataRef.current) return;

    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const colorArray = pointsRef.current.geometry.attributes.color.array as Float32Array;
    const { velocities, ages } = particleDataRef.current;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Update age, scaled by timeSpeed for consistent animation
      ages[i] += delta * 1;

      // Reset particle if it's too old
      if (ages[i] > PARTICLE_LIFETIME) {
        ages[i] = 0;
        posArray[i * 3] = (-0.85 + Math.random() * 0.1) * SHIP_SCALE;
        posArray[i * 3 + 1] = (Math.random() - 0.5) * 0.15 * SHIP_SCALE;
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 0.15 * SHIP_SCALE;
      } else {
        // Update position based on velocity, scaled by timeSpeed
        posArray[i * 3] += velocities[i * 3] * delta * 1;
        posArray[i * 3 + 1] += velocities[i * 3 + 1] * delta * 1;
        posArray[i * 3 + 2] += velocities[i * 3 + 2] * delta * 1;
      }

      // Update color based on age (white → blue → orange → red → fade)
      const lifeProgress = ages[i] / PARTICLE_LIFETIME;

      if (lifeProgress < 0.1) {
        // Stage 1: White (1,1,1) → Blue (0.2,0.4,1.0) - quick transition
        const t = lifeProgress / 0.1;
        colorArray[i * 3] = 1.0 - (0.8 * t);      // r: 1 → 0.2
        colorArray[i * 3 + 1] = 1.0 - (0.6 * t);  // g: 1 → 0.4
        colorArray[i * 3 + 2] = 1.0;              // b: stays 1
      } else if (lifeProgress < 0.3) {
        // Stage 2: Blue (0.2,0.4,1.0) → Orange (1.0,0.5,0.0)
        const t = (lifeProgress - 0.1) / 0.2;
        colorArray[i * 3] = 0.2 + (0.8 * t);      // r: 0.2 → 1.0
        colorArray[i * 3 + 1] = 0.4 + (0.1 * t);  // g: 0.4 → 0.5
        colorArray[i * 3 + 2] = 1.0 - t;          // b: 1.0 → 0
      } else if (lifeProgress < 0.6) {
        // Stage 3: Orange (1.0,0.5,0.0) → Red (1.0,0,0)
        const t = (lifeProgress - 0.3) / 0.3;
        colorArray[i * 3] = 1.0;                  // r: stays 1
        colorArray[i * 3 + 1] = 0.5 - (0.5 * t);  // g: 0.5 → 0
        colorArray[i * 3 + 2] = 0;                // b: stays 0
      } else {
        // Stage 4: Red fades to transparent
        const t = (lifeProgress - 0.6) / 0.4;
        const fade = 1.0 - t;
        colorArray[i * 3] = fade;                 // r fades
        colorArray[i * 3 + 1] = 0;                // g stays 0
        colorArray[i * 3 + 2] = 0;                // b stays 0
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.color.needsUpdate = true;
  });

  if (!isActive || !shouldShowEngines || !positions || !colors || propulsion === 'solar-sail') return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={PARTICLE_COUNT}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={particleConfig.size}
        vertexColors
        transparent
        opacity={1.0}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
