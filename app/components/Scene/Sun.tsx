'use client';

import { useRef, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Mesh, TextureLoader } from 'three';
import { SUN_DATA, SCALE_FACTORS } from '@/app/data/planets';
import { useStore } from '@/app/store/useStore';

export default function Sun() {
  const sunRef = useRef<Mesh>(null);
  const { scaleMode, timeSpeed, isPaused } = useStore();

  // Load Sun texture
  const texture = useLoader(TextureLoader, SUN_DATA.texture || '/textures/sun.jpg');
  const hasTexture = Boolean(SUN_DATA.texture);

  // Dispatch event when texture is loaded (for loading tracker)
  const [hasDispatchedLoad, setHasDispatchedLoad] = useState(false);
  if (texture && SUN_DATA.texture && !hasDispatchedLoad) {
    setHasDispatchedLoad(true);
    window.dispatchEvent(new CustomEvent('planet-texture-loaded'));
  }

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
      {/* Main visible Sun sphere with emissive material for bloom effect */}
      <mesh ref={sunRef} position={[0, 0, 0]}>
        <sphereGeometry args={[sunSize, 64, 64]} />
        {hasTexture ? (
          <meshStandardMaterial
            map={texture}
            emissive="#ffaa00"
            emissiveMap={texture}
            emissiveIntensity={2.2}
            toneMapped={false}
          />
        ) : (
          <meshStandardMaterial
            color="#ffff00"
            emissive="#ffaa00"
            emissiveIntensity={5.0}
            toneMapped={false}
          />
        )}
      </mesh>

      {/* Single point light source representing the Sun */}
      <group>
        {/* Main sun light */}
        <pointLight 
          position={[0, 0, 0]} 
          intensity={1.5} 
          distance={0} 
          decay={0} 
          color="#ffffff"
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-bias={-0.00001}
          shadow-radius={1}
        />
      </group>
      
      {/* Very subtle ambient light to show dark sides of planets */}
      <ambientLight intensity={0.05} color="#ffffff" />
    </group>
  );
}
