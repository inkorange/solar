'use client';

import { useRef } from 'react';
import { Mesh, BackSide } from 'three';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

export default function Stars() {
  const meshRef = useRef<Mesh>(null);

  // Load stars texture
  const starsTexture = useLoader(TextureLoader, '/textures/stars.jpg');

  return (
    <mesh ref={meshRef}>
      {/* Large inverted sphere to act as skybox */}
      <sphereGeometry args={[5000, 64, 64]} />
      <meshBasicMaterial
        map={starsTexture}
        side={BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
