'use client';

import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Mesh, TextureLoader } from 'three';
import { SUN_DATA, SCALE_FACTORS } from '@/app/data/planets';
import { useStore } from '@/app/store/useStore';

export default function Sun() {
  const sunRef = useRef<Mesh>(null);
  const { scaleMode, timeSpeed, isPaused } = useStore();

  // Load Sun texture
  const texture = SUN_DATA.texture ? useLoader(TextureLoader, SUN_DATA.texture) : null;

  // Calculate Sun size using same formula as planets (relative to Earth)
  const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
  const sunSize = (SUN_DATA.diameter / 12742) * scaleFactor.SIZE * 5;

  // Scientific rotation based on Sun's rotation period
  useFrame((state, delta) => {
    if (sunRef.current && !isPaused) {
      const rotationSpeed = SUN_DATA.rotationPeriod > 0 ? 1 / (SUN_DATA.rotationPeriod * 24 * 60) : 0;
      sunRef.current.rotation.y += delta * rotationSpeed * timeSpeed;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Main Sun sphere with emissive material for bloom effect */}
      <mesh ref={sunRef} position={[0, 0, 0]}>
        <sphereGeometry args={[sunSize, 64, 64]} />
        {texture ? (
          <meshStandardMaterial
            map={texture}
            emissive="#ffaa00"
            emissiveMap={texture}
            emissiveIntensity={1.2}
            toneMapped={false}
          />
        ) : (
          <meshStandardMaterial
            color="#ffff00"
            emissive="#ffaa00"
            emissiveIntensity={1.5}
            toneMapped={false}
          />
        )}
      </mesh>

      {/* Point light source - strong lighting from the Sun */}
      <pointLight position={[0, 0, 0]} intensity={8} distance={10000} decay={0.3} color="#ffeecc" />

      {/* Reduced ambient light to create stronger shadows on dark side of planets */}
      <ambientLight intensity={0.15} />
    </group>
  );
}
