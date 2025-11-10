'use client';

import { useRef, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader, DoubleSide, Mesh, BufferGeometry, BufferAttribute, Texture } from 'three';

interface PlanetRingsProps {
  innerRadius: number;
  outerRadius: number;
  texture?: string;
  opacity?: number;
}

export default function PlanetRings({
  innerRadius,
  outerRadius,
  texture,
  opacity,
}: PlanetRingsProps) {
  const ringRef = useRef<Mesh | null>(null);

  // Always call useLoader; use placeholder when no texture
  const placeholderDataUrl = useMemo(() => 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', []);
  const loadedTexture = useLoader(TextureLoader, texture ?? placeholderDataUrl);
  const ringTexture = texture ? (loadedTexture as Texture) : null;

  // Load ring texture if provided

  // Create custom ring geometry with proper UV mapping for circumferential texture
  const ringGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
    const thetaSegments = 128; // Number of segments around the ring
    const phiSegments = 8; // Number of segments from inner to outer radius

    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    // Create vertices and UVs
    for (let j = 0; j <= phiSegments; j++) {
      const radius = innerRadius + (outerRadius - innerRadius) * (j / phiSegments);

      for (let i = 0; i <= thetaSegments; i++) {
        const theta = (i / thetaSegments) * Math.PI * 2;

        // Vertex position
        const x = radius * Math.cos(theta);
        const y = radius * Math.sin(theta);
        vertices.push(x, y, 0);

        // UV coordinates: U goes from inner to outer (radially), V wraps around the ring
        const u = j / phiSegments;
        const v = i / thetaSegments;
        uvs.push(u, v);
      }
    }

    // Create indices for triangles
    for (let j = 0; j < phiSegments; j++) {
      for (let i = 0; i < thetaSegments; i++) {
        const a = (thetaSegments + 1) * j + i;
        const b = (thetaSegments + 1) * (j + 1) + i;
        const c = (thetaSegments + 1) * (j + 1) + i + 1;
        const d = (thetaSegments + 1) * j + i + 1;

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
    geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }, [innerRadius, outerRadius]);

  return (
    <mesh 
      ref={ringRef} 
      rotation={[Math.PI / 2, 0, 0]} 
      geometry={ringGeometry}
      receiveShadow
    >
      {ringTexture ? (
        <meshStandardMaterial
          map={ringTexture}
          side={DoubleSide}
          transparent
          opacity={opacity ?? 0.8}
          depthWrite={false}
          alphaTest={0.01}
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.1}
          metalness={0.3}
          roughness={0.4}
        />
      ) : (
        <meshStandardMaterial
          color="#c9a97a"
          side={DoubleSide}
          transparent
          opacity={opacity ?? 0.8}
          depthWrite={false}
          alphaTest={0.01}
          emissive="#c9a97a"
          emissiveIntensity={0.1}
          metalness={0.3}
          roughness={0.4}
        />
      )}
    </mesh>
  );
}
