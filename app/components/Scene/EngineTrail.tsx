'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, BufferGeometry, Color, CanvasTexture, AdditiveBlending } from 'three';
import { PropulsionType } from '@/app/data/propulsion';
import { useStore } from '@/app/store/useStore';

// Generate a soft circular particle sprite texture
function createParticleTexture(): CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Radial gradient: bright center fading to transparent edge
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new CanvasTexture(canvas);
  return texture;
}

interface EngineTrailProps {
  propulsion: PropulsionType | null;
  isActive: boolean;
  flightPhase: 'accelerating' | 'cruising' | 'decelerating';
  /** Optional offset for the engine origin (in scene units, pre-scaled) */
  engineOffset?: { x: number; y: number; z: number };
}

const PARTICLE_COUNT = 350;
const PARTICLE_LIFETIME = 0.6; // seconds (40% shorter than original 1.0)
const SHIP_SCALE = 0.003125; // Match spaceship scale (25% of previous size)

export default function EngineTrail({ propulsion, isActive, flightPhase, engineOffset }: EngineTrailProps) {
  // Only show engine effects when accelerating or decelerating
  const shouldShowEngines = flightPhase === 'accelerating' || flightPhase === 'decelerating';
  const pointsRef = useRef<Points>(null);
  const particleDataRef = useRef<{
    velocities: Float32Array;
    ages: Float32Array;
  } | null>(null);

  const { timeSpeed } = useStore();

  // Create soft circular particle texture (once)
  const particleTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    return createParticleTexture();
  }, []);

  // Configure particle system based on propulsion type
  // Sizes are 50% smaller than before (additional reduction beyond SHIP_SCALE change)
  const particleConfig = useMemo(() => {
    if (!propulsion) {
      return { size: 0.075 * SHIP_SCALE, speed: 1.5 * SHIP_SCALE, lifetime: PARTICLE_LIFETIME };
    }

    switch (propulsion) {
      case 'chemical-rocket':
        return { size: 0.1 * SHIP_SCALE, speed: 4.0 * SHIP_SCALE, lifetime: PARTICLE_LIFETIME };
      case 'ion-thruster':
        return { size: 0.06 * SHIP_SCALE, speed: 3.0 * SHIP_SCALE, lifetime: PARTICLE_LIFETIME };
      case 'solar-sail':
        return { size: 0, speed: 0, lifetime: PARTICLE_LIFETIME }; // No visible exhaust
      case 'nuclear-thermal':
        return { size: 0.09 * SHIP_SCALE, speed: 4.0 * SHIP_SCALE, lifetime: PARTICLE_LIFETIME };
      case 'antimatter':
        return { size: 0.125 * SHIP_SCALE, speed: 4.0 * SHIP_SCALE, lifetime: PARTICLE_LIFETIME };
      case 'epstein-drive':
        return { size: 0.11 * SHIP_SCALE, speed: 7.0 * SHIP_SCALE, lifetime: 0.3 }; // Faster, 40% shorter plume
      case 'astrophage-drive':
        return { size: 0.11 * SHIP_SCALE, speed: 6.0 * SHIP_SCALE, lifetime: 0.35 }; // IR emission plume
      case 'light-speed':
        return { size: 0.075 * SHIP_SCALE, speed: 4.0 * SHIP_SCALE, lifetime: PARTICLE_LIFETIME };
      case 'warp-drive':
        return { size: 0.075 * SHIP_SCALE, speed: 4.0 * SHIP_SCALE, lifetime: PARTICLE_LIFETIME };
      default:
        return { size: 0.075 * SHIP_SCALE, speed: 3.0 * SHIP_SCALE, lifetime: PARTICLE_LIFETIME };
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

    // Engine origin position
    const engineX = engineOffset ? engineOffset.x : (-0.85 * SHIP_SCALE);
    const engineY = engineOffset ? engineOffset.y : 0;
    const engineZ = engineOffset ? engineOffset.z : 0;
    const spread = engineOffset ? 0.08 * SHIP_SCALE : 0.15 * SHIP_SCALE;
    const xSpread = engineOffset ? 0.05 * SHIP_SCALE : 0.1 * SHIP_SCALE;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r1 = seededRandom(i * 4 + 1);
      const r2 = seededRandom(i * 4 + 2);
      const r3 = seededRandom(i * 4 + 3);
      const r4 = seededRandom(i * 4 + 4);

      // Start at engine position with tighter spread (scaled to match ship size)
      positions[i * 3] = engineX + (r1 - 0.5) * xSpread; // x (at engine)
      positions[i * 3 + 1] = engineY + (r2 - 0.5) * spread; // y
      positions[i * 3 + 2] = engineZ + (r3 - 0.5) * spread; // z

      // Random age for staggered start
      ages[i] = r4 * particleConfig.lifetime;

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
  }, [isActive, shouldShowEngines, propulsion, particleConfig.speed, particleConfig.lifetime]);

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
      if (ages[i] > particleConfig.lifetime) {
        // Carry over excess age to maintain even distribution and prevent clumping
        ages[i] = ages[i] % particleConfig.lifetime;
        const eX = engineOffset ? engineOffset.x : (-0.85 * SHIP_SCALE);
        const eY = engineOffset ? engineOffset.y : 0;
        const eZ = engineOffset ? engineOffset.z : 0;
        const spr = engineOffset ? 0.08 * SHIP_SCALE : 0.15 * SHIP_SCALE;
        const xSpr = engineOffset ? 0.05 * SHIP_SCALE : 0.1 * SHIP_SCALE;
        posArray[i * 3] = eX + (Math.random() - 0.5) * xSpr;
        posArray[i * 3 + 1] = eY + (Math.random() - 0.5) * spr;
        posArray[i * 3 + 2] = eZ + (Math.random() - 0.5) * spr;

        // Re-randomize velocity for natural variation
        const spreadAngle = (Math.random() - 0.5) * 0.2;
        const baseSpeed = particleConfig.speed * (0.8 + Math.random() * 0.4);
        velocities[i * 3] = -baseSpeed;
        velocities[i * 3 + 1] = Math.sin(spreadAngle) * baseSpeed * 0.03;
        velocities[i * 3 + 2] = Math.cos(spreadAngle) * baseSpeed * 0.03;

        // Advance position by carried-over age so particle isn't stuck at origin
        posArray[i * 3] += velocities[i * 3] * ages[i];
        posArray[i * 3 + 1] += velocities[i * 3 + 1] * ages[i];
        posArray[i * 3 + 2] += velocities[i * 3 + 2] * ages[i];
      } else {
        // Update position based on velocity
        posArray[i * 3] += velocities[i * 3] * delta;
        posArray[i * 3 + 1] += velocities[i * 3 + 1] * delta;
        posArray[i * 3 + 2] += velocities[i * 3 + 2] * delta;
      }

      // Update color based on age and propulsion type
      const lifeProgress = ages[i] / particleConfig.lifetime;

      // Astrophage Drive: white → amber → deep orange → fade (IR emission effect)
      if (propulsion === 'astrophage-drive') {
        if (lifeProgress < 0.2) {
          // Stage 1: White (1,1,1) → Bright Amber (1.0,0.7,0.2)
          const t = lifeProgress / 0.2;
          colorArray[i * 3] = 1.0;                        // r: stays 1
          colorArray[i * 3 + 1] = 1.0 - (0.3 * t);       // g: 1 → 0.7
          colorArray[i * 3 + 2] = 1.0 - (0.8 * t);       // b: 1 → 0.2
        } else if (lifeProgress < 0.5) {
          // Stage 2: Bright Amber (1.0,0.7,0.2) → Deep Orange (0.9,0.3,0.0)
          const t = (lifeProgress - 0.2) / 0.3;
          colorArray[i * 3] = 1.0 - (0.1 * t);            // r: 1.0 → 0.9
          colorArray[i * 3 + 1] = 0.7 - (0.4 * t);        // g: 0.7 → 0.3
          colorArray[i * 3 + 2] = 0.2 - (0.2 * t);        // b: 0.2 → 0.0
        } else {
          // Stage 3: Deep Orange fades to transparent
          const t = (lifeProgress - 0.5) / 0.5;
          const fade = 1.0 - t;
          colorArray[i * 3] = 0.9 * fade;                 // r fades
          colorArray[i * 3 + 1] = 0.3 * fade;             // g fades
          colorArray[i * 3 + 2] = 0;                      // b stays 0
        }
      } else
      // Epstein Drive: white → blue → fade (fusion plasma effect)
      if (propulsion === 'epstein-drive') {
        if (lifeProgress < 0.2) {
          // Stage 1: White (1,1,1) → Bright Blue (0.3,0.6,1.0)
          const t = lifeProgress / 0.2;
          colorArray[i * 3] = 1.0 - (0.7 * t);      // r: 1 → 0.3
          colorArray[i * 3 + 1] = 1.0 - (0.4 * t);  // g: 1 → 0.6
          colorArray[i * 3 + 2] = 1.0;              // b: stays 1
        } else if (lifeProgress < 0.5) {
          // Stage 2: Bright Blue (0.3,0.6,1.0) → Deep Blue (0.1,0.3,0.9)
          const t = (lifeProgress - 0.2) / 0.3;
          colorArray[i * 3] = 0.3 - (0.2 * t);      // r: 0.3 → 0.1
          colorArray[i * 3 + 1] = 0.6 - (0.3 * t);  // g: 0.6 → 0.3
          colorArray[i * 3 + 2] = 1.0 - (0.1 * t);  // b: 1.0 → 0.9
        } else {
          // Stage 3: Deep Blue fades to transparent
          const t = (lifeProgress - 0.5) / 0.5;
          const fade = 1.0 - t;
          colorArray[i * 3] = 0.1 * fade;           // r fades
          colorArray[i * 3 + 1] = 0.3 * fade;       // g fades
          colorArray[i * 3 + 2] = 0.9 * fade;       // b fades
        }
      } else {
        // Other propulsion: white → blue → orange → red → fade (chemical rocket effect)
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
        blending={AdditiveBlending}
        {...(particleTexture ? { map: particleTexture, alphaMap: particleTexture } : {})}
      />
    </points>
  );
}
