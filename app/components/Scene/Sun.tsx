'use client';

import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Mesh, TextureLoader } from 'three';
import { SUN_DATA, SCALE_FACTORS } from '@/app/data/planets';
import { useStore } from '@/app/store/useStore';

export default function Sun() {
  const sunRef = useRef<Mesh>(null);
  const { scaleMode } = useStore();

  // Load Sun texture
  const texture = SUN_DATA.texture ? useLoader(TextureLoader, SUN_DATA.texture) : null;

  // Calculate Sun size using same formula as planets (relative to Earth)
  const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
  const sunSize = (SUN_DATA.diameter / 12742) * scaleFactor.SIZE * 5;

  // Gentle rotation
  useFrame((state, delta) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Main Sun sphere */}
      <mesh ref={sunRef} position={[0, 0, 0]}>
        <sphereGeometry args={[sunSize, 64, 64]} />
        {texture ? (
          <meshBasicMaterial map={texture} />
        ) : (
          <meshBasicMaterial color={SUN_DATA.color} />
        )}
      </mesh>

      {/* Glow effect - multi-layer corona */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[sunSize * 1.06, 32, 32]} />
        <meshBasicMaterial
          color={SUN_DATA.color}
          transparent
          opacity={0.4}
        />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[sunSize * 1.16, 32, 32]} />
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={0.2}
        />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[sunSize * 1.3, 32, 32]} />
        <meshBasicMaterial
          color="#ff8800"
          transparent
          opacity={0.1}
        />
      </mesh>

      {/* Point light source - strong lighting from the Sun */}
      <pointLight position={[0, 0, 0]} intensity={5} distance={2000} decay={0.3} color="#ffffff" />

      {/* Additional ambient light for visibility */}
      <ambientLight intensity={0.8} />
    </group>
  );
}
