'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, BufferGeometry, PointsMaterial, BufferAttribute } from 'three';
import { PropulsionType } from '@/app/data/propulsion';

interface EngineTrailProps {
  propulsion: PropulsionType | null;
  isActive: boolean;
}

export default function EngineTrail({ propulsion, isActive }: EngineTrailProps) {
  const pointsRef = useRef<Points>(null);
  const particlesRef = useRef<Float32Array | null>(null);

  // Configure particle system based on propulsion type
  const particleConfig = useMemo(() => {
    if (!propulsion) {
      return { count: 0, color: '#ffffff', size: 0.1, speed: 0 };
    }

    switch (propulsion) {
      case 'chemical-rocket':
        return { count: 200, color: '#ff6b35', size: 0.3, speed: 2 };
      case 'ion-thruster':
        return { count: 100, color: '#4ecdc4', size: 0.15, speed: 0.5 };
      case 'solar-sail':
        return { count: 0, color: '#f4d03f', size: 0.1, speed: 0 }; // No visible exhaust
      case 'nuclear-thermal':
        return { count: 150, color: '#9b59b6', size: 0.25, speed: 1.5 };
      case 'antimatter':
        return { count: 300, color: '#e74c3c', size: 0.4, speed: 3 };
      case 'warp-drive':
        return { count: 400, color: '#3498db', size: 0.2, speed: 5 };
      default:
        return { count: 100, color: '#ffffff', size: 0.2, speed: 1 };
    }
  }, [propulsion]);

  // Generate initial particles
  const particles = useMemo(() => {
    if (!isActive || particleConfig.count === 0) return null;

    const positions = new Float32Array(particleConfig.count * 3);
    const velocities = new Float32Array(particleConfig.count * 3);

    for (let i = 0; i < particleConfig.count; i++) {
      // Start at engine position
      positions[i * 3] = -0.6 + Math.random() * 0.2; // x (behind engine)
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.3; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3; // z

      // Move backwards (exhaust direction)
      velocities[i * 3] = -particleConfig.speed * (0.5 + Math.random() * 0.5);
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }

    particlesRef.current = velocities;
    return positions;
  }, [isActive, particleConfig]);

  // Animate particles
  useFrame((state, delta) => {
    if (!pointsRef.current || !particles || !particlesRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const velocities = particlesRef.current;

    for (let i = 0; i < particleConfig.count; i++) {
      // Update positions based on velocity
      positions[i * 3] += velocities[i * 3] * delta;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * delta;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * delta;

      // Reset particles that go too far behind
      if (positions[i * 3] < -5) {
        positions[i * 3] = -0.6 + Math.random() * 0.2;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!isActive || !particles || particleConfig.count === 0) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={particleConfig.size}
        color={particleConfig.color}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}
