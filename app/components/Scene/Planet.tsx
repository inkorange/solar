'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Mesh, TextureLoader, Group } from 'three';
import { PlanetData, SCALE_FACTORS } from '@/app/data/planets';
import { useStore } from '@/app/store/useStore';
import { Html } from '@react-three/drei';
import PlanetRings from './PlanetRings';
import Atmosphere from './Atmosphere';
import { calculateEllipticalOrbitPosition } from '@/app/lib/orbital-mechanics';

interface PlanetProps {
  data: PlanetData;
}

export default function Planet({ data }: PlanetProps) {
  const meshRef = useRef<Mesh | null>(null);
  const groupRef = useRef<Group | null>(null);
  const [hovered, setHovered] = useState(false);

  const { selectedPlanet, setSelectedPlanet, scaleMode, showLabels, simulationTime, timeSpeed, isPaused, journeyStatus, showWelcome } = useStore();
  const isSelected = selectedPlanet?.name === data.name;

  // Always call useLoader to satisfy hooks rules. Use a tiny transparent placeholder when no texture.
  const placeholderDataUrl = useMemo(() => 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', []);
  const loadedTexture = useLoader(TextureLoader, data.texture ?? placeholderDataUrl);
  const texture = data.texture ? loadedTexture : null;

  // Dispatch event when texture is loaded (for loading tracker)
  const [hasDispatchedLoad, setHasDispatchedLoad] = useState(false);
  if (texture && data.texture && !hasDispatchedLoad) {
    setHasDispatchedLoad(true);
    window.dispatchEvent(new CustomEvent('planet-texture-loaded'));
  }

  // Calculate scaled values based on scale mode
  const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
  const planetSize = (data.diameter / 12742) * scaleFactor.SIZE * 5; // Relative to Earth

  // Calculate position based on elliptical orbital mechanics
  const orbitalPosition = useMemo(() => {
    return calculateEllipticalOrbitPosition(
      simulationTime,
      data,
      scaleFactor.DISTANCE
    );
  }, [simulationTime, data, scaleFactor.DISTANCE]);

  // Rotate planet on its axis
  useFrame((state, delta) => {
    if (meshRef.current && !isPaused) {
      const rotationSpeed = data.rotationPeriod > 0 ? 1 / (data.rotationPeriod * 24 * 60) : 0;
      meshRef.current.rotation.y += delta * rotationSpeed * timeSpeed * (data.rotationPeriod < 0 ? -1 : 1);
    }

    // Update group position for orbital motion (including y for inclined orbits)
    if (groupRef.current) {
      groupRef.current.position.x = orbitalPosition.x;
      groupRef.current.position.y = orbitalPosition.y;
      groupRef.current.position.z = orbitalPosition.z;
    }
  });

  const handleClick = () => {
    setSelectedPlanet(isSelected ? null : data);
  };

  return (
    <group ref={groupRef}>
      {/* Apply axial tilt to this group so rotation happens around tilted axis */}
      <group rotation={[0, 0, (data.axialTilt * Math.PI) / 180]}>
        <mesh
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          castShadow
        >
          <sphereGeometry args={[planetSize, 32, 32]} />
        {texture ? (
          <meshStandardMaterial
            map={texture}
            roughness={0.9}
            metalness={0}
          />
        ) : (
          <meshStandardMaterial
            color={data.color}
            roughness={0.9}
            metalness={0}
          />
        )}
      </mesh>

      {/* Planetary rings with scientifically accurate dimensions */}
      {data.hasRings && data.ringData && (
        <PlanetRings
          innerRadius={planetSize * data.ringData.innerRadiusRatio}
          outerRadius={planetSize * data.ringData.outerRadiusRatio}
          texture={data.ringData.texture}
          opacity={data.ringData.opacity}
        />
      )}

      {/* Atmospheric glow for planets with significant atmospheres */}
      {data.atmosphere.length > 0 && data.atmosphere[0] !== 'Trace' && (
        <Atmosphere
          radius={planetSize}
          color={data.color}
          opacity={data.type === 'Gas Giant' ? 0.25 :
                  data.type === 'Ice Giant' ? 0.2 :
                  data.name === 'Venus' ? 0.3 : 0.15}
        />
      )}
      </group>{/* Close tilted group - planet, rings, and atmosphere are tilted */}

      {/* Hover indicator - NOT tilted, stays upright */}
      {hovered && !isSelected && (
        <mesh>
          <ringGeometry args={[planetSize * 1.5, planetSize * 1.6, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
      )}

      {/* Label - always show for planets when labels are enabled */}
      {showLabels && !showWelcome && journeyStatus !== 'selecting-propulsion' && (
        <Html
          position={[0, planetSize * 1.8, 0]}
          center
          sprite
          style={{
            transition: 'all 0.2s',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              color: isSelected ? '#60a5fa' : hovered ? '#fff' : '#aaa',
              fontSize: '12px',
              fontFamily: 'var(--font-geist-sans)',
              userSelect: 'none',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {data.name}
          </div>
        </Html>
      )}
    </group>
  );
}
