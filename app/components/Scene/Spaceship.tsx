'use client';

import { useRef, useMemo } from 'react';
import { Mesh, Vector3, Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { useStore } from '@/app/store/useStore';
import { SCALE_FACTORS, PLANETS } from '@/app/data/planets';
import { getPropulsionById, getFlightPhase, calculateDistanceTraveled } from '@/app/data/propulsion';
import { calculateEllipticalOrbitPosition } from '@/app/lib/orbital-mechanics';
import EngineTrail from './EngineTrail';

export default function Spaceship() {
  const bodyRef = useRef<Mesh | null>(null);
  const groupRef = useRef<Group | null>(null);
  const previousPositionRef = useRef<Vector3 | null>(null);

  // Smoothing refs for high-speed camera stability
  const smoothedPositionRef = useRef<Vector3>(new Vector3());
  const isSmoothedInitializedRef = useRef(false);

  const {
    journeyStatus,
    origin,
    destination,
    selectedPropulsion,
    useFlipAndBurn,
    journeyElapsedTime,
    journeyStartTime,
    totalDistance,
    arrivalTime,
    destinationPositionAtArrival,
    scaleMode,
    simulationTime,
    setSpaceshipPosition,
    timeSpeed,
  } = useStore();

  // Calculate current position during journey
  const position = useMemo(() => {
    const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;

    // If we've arrived at a destination, stay on the planet's surface as it orbits
    if (journeyStatus === 'arrived' && destination && origin) {
      // Get destination's current orbital position
      const destPosData = calculateEllipticalOrbitPosition(
        simulationTime,
        destination,
        scaleFactor.DISTANCE
      );
      const destCenter = new Vector3(destPosData.x, destPosData.y, destPosData.z);

      // Get origin's position at journey start to calculate approach direction
      const originPosData = calculateEllipticalOrbitPosition(
        journeyStartTime,
        origin,
        scaleFactor.DISTANCE
      );
      const originCenter = new Vector3(originPosData.x, originPosData.y, originPosData.z);

      // Calculate approach direction (from origin to destination)
      const approachDirection = new Vector3().subVectors(destCenter, originCenter).normalize();

      // Calculate visual radius
      const destRadiusSceneUnits = (destination.diameter / 12742) * scaleFactor.SIZE * 5;

      // Position on surface (offset opposite to approach direction)
      return new Vector3().addVectors(
        destCenter,
        approachDirection.clone().multiplyScalar(-destRadiusSceneUnits)
      );
    }

    // If not traveling and no arrival state, default to Earth orbit
    if (journeyStatus !== 'traveling' || !origin || !destination || !selectedPropulsion || !destinationPositionAtArrival) {
      const earthData = PLANETS.find(p => p.name === 'Earth') || PLANETS[2];
      const orbitRadius = earthData.distanceFromSun * scaleFactor.DISTANCE;
      const orbitalPeriodSeconds = earthData.orbitalPeriod * 24 * 60 * 60;
      const angle = (simulationTime / orbitalPeriodSeconds) * Math.PI * 2;

      return new Vector3(
        Math.cos(angle) * orbitRadius + 5,
        0,
        Math.sin(angle) * orbitRadius + 5
      );
    }

    // Origin position at journey start time (departure point - planet center)
    const originPosData = calculateEllipticalOrbitPosition(
      journeyStartTime,
      origin,
      scaleFactor.DISTANCE
    );
    const originCenterPos = new Vector3(originPosData.x, originPosData.y, originPosData.z);

    // Destination position at PREDICTED arrival time (from intercept calculation - planet center)
    // This is a FIXED point calculated at journey start - the intercept point where ship meets planet
    const destInterceptPos = new Vector3(
      destinationPositionAtArrival.x,
      destinationPositionAtArrival.y,
      destinationPositionAtArrival.z
    );

    // Calculate direction vector from origin to intercept point (this is the trajectory)
    const direction = new Vector3().subVectors(destInterceptPos, originCenterPos).normalize();

    // Calculate planet radii using the SAME scaling as the visual planet rendering
    // This is from Planet.tsx line 42: (data.diameter / 12742) * scaleFactor.SIZE * 5
    const originRadiusSceneUnits = (origin.diameter / 12742) * scaleFactor.SIZE * 5;
    const destRadiusSceneUnits = (destination.diameter / 12742) * scaleFactor.SIZE * 5;

    // Calculate actual distance traveled using physics-based calculations
    const propulsion = getPropulsionById(selectedPropulsion);
    if (!propulsion) {
      // Default to origin surface if no propulsion
      return new Vector3().addVectors(
        originCenterPos,
        direction.clone().multiplyScalar(originRadiusSceneUnits)
      );
    }

    const distanceTraveled = calculateDistanceTraveled(
      journeyElapsedTime,
      totalDistance,
      propulsion,
      useFlipAndBurn
    );

    // Calculate progress based on actual distance traveled (0 to 1)
    // totalDistance is the physical surface-to-surface distance (using real planet radii)
    const physicsProgress = Math.min(1, distanceTraveled / totalDistance);


    // Calculate what time the ship should be targeting based on progress
    const targetTime = journeyStartTime + (arrivalTime - journeyStartTime) * physicsProgress;

    // Get destination's position at the TARGET time (interpolated between start and predicted arrival)
    const destTargetPosData = calculateEllipticalOrbitPosition(
      targetTime,
      destination,
      scaleFactor.DISTANCE
    );
    const destTargetCenterPos = new Vector3(destTargetPosData.x, destTargetPosData.y, destTargetPosData.z);

    // Calculate the center-to-center vector and distance
    const centerToCenterVec = new Vector3().subVectors(destTargetCenterPos, originCenterPos);
    const centerToCenterDistance = centerToCenterVec.length();
    const centerDirection = centerToCenterVec.normalize();

    // The visual radii in scene units
    // The PHYSICAL radii in scene units (for accurate distance calculation)
    const AU_TO_KM = 149597870.7;
    const originPhysicalRadiusSceneUnits = (origin.diameter / 2 / AU_TO_KM) * scaleFactor.DISTANCE;
    const destPhysicalRadiusSceneUnits = (destination.diameter / 2 / AU_TO_KM) * scaleFactor.DISTANCE;

    // The actual surface-to-surface distance in scene units (using physical radii)
    const surfaceToSurfaceDistance = centerToCenterDistance - originPhysicalRadiusSceneUnits - destPhysicalRadiusSceneUnits;

    // Start and end positions using VISUAL radii (what you see on screen)
    const originSurfacePos = new Vector3().addVectors(
      originCenterPos,
      centerDirection.clone().multiplyScalar(originRadiusSceneUnits)
    );

    const destSurfacePos = new Vector3().addVectors(
      destTargetCenterPos,
      centerDirection.clone().multiplyScalar(-destRadiusSceneUnits)
    );

    // Adjust progress to account for visual vs physical radius difference
    // We need to scale progress so that when physics says 100%, we're visually at the surface
    const radiusDifference = (originRadiusSceneUnits + destRadiusSceneUnits) - (originPhysicalRadiusSceneUnits + destPhysicalRadiusSceneUnits);
    const progressAdjustment = radiusDifference / (surfaceToSurfaceDistance + radiusDifference);
    const adjustedProgress = Math.min(1, (physicsProgress - progressAdjustment) / (1 - progressAdjustment));

    // Use adjusted progress for visual interpolation
    return new Vector3().lerpVectors(originSurfacePos, destSurfacePos, Math.max(0, adjustedProgress));
  }, [journeyStatus, origin, destination, selectedPropulsion, useFlipAndBurn, journeyElapsedTime, journeyStartTime, totalDistance, arrivalTime, destinationPositionAtArrival, scaleMode, simulationTime]);

  // Calculate current flight phase for rendering
  const flightPhase = useMemo(() => {
    if (journeyStatus !== 'traveling' || !selectedPropulsion) return 'cruising';
    const propulsion = getPropulsionById(selectedPropulsion);
    return propulsion ? getFlightPhase(journeyElapsedTime, totalDistance, propulsion, useFlipAndBurn) : 'cruising';
  }, [journeyStatus, selectedPropulsion, journeyElapsedTime, totalDistance, useFlipAndBurn]);

  // Update spaceship position and rotation
  useFrame((_, delta) => {
    if (groupRef.current && journeyStatus === 'traveling' && selectedPropulsion && destinationPositionAtArrival) {
      // Initialize smoothed position on first frame
      if (!isSmoothedInitializedRef.current) {
        smoothedPositionRef.current.copy(position);
        isSmoothedInitializedRef.current = true;
      }

      // Adaptive smoothing: heavier at high speeds, lighter at low speeds
      // At low speeds (1x-100x): Light smoothing for responsive tracking
      // At high speeds (10kx+): Heavy smoothing to eliminate jitter

      let smoothFactor: number;

      if (timeSpeed <= 100) {
        // Low speed: minimal smoothing (0.2 = light, responsive)
        smoothFactor = 0.2;
      } else if (timeSpeed <= 1000) {
        // Medium speed: moderate smoothing
        smoothFactor = 0.1;
      } else if (timeSpeed <= 10000) {
        // High speed: heavy smoothing
        smoothFactor = 0.05;
      } else {
        // Very high speed (>10kx): maximum smoothing to eliminate all jitter
        smoothFactor = 0.02;
      }

      // Frame-rate independent smoothing
      // This ensures consistent behavior at 30fps, 60fps, or 144fps
      const frameIndependentSmooth = 1 - Math.pow(1 - smoothFactor, delta * 60);

      // Smooth the position - lerp from current smoothed position toward calculated position
      smoothedPositionRef.current.lerp(position, frameIndependentSmooth);

      // Get current flight phase
      const isDecelerating = flightPhase === 'decelerating';

      // Calculate direction to destination (the trajectory)
      const destPos = new Vector3(
        destinationPositionAtArrival.x,
        destinationPositionAtArrival.y,
        destinationPositionAtArrival.z
      );
      const directionToDestination = new Vector3()
        .subVectors(destPos, smoothedPositionRef.current)
        .normalize();

      // Calculate angle in XZ plane (horizontal rotation)
      const angle = Math.atan2(directionToDestination.z, directionToDestination.x);

      // Rotate the entire group to face travel direction
      // During acceleration/cruise: face forward (engines behind)
      // During deceleration: flip 180 degrees (engines in front, pointing toward destination)
      // Spaceship model points in +X direction by default (Math.PI / 2 rotation applied in mesh)
      groupRef.current.rotation.y = -angle + (isDecelerating ? Math.PI : 0);

      // Update position with smoothed value
      groupRef.current.position.copy(smoothedPositionRef.current);

      // Store current position for next frame
      previousPositionRef.current = smoothedPositionRef.current.clone();

      // Update the store so camera can follow (using smoothed position)
      setSpaceshipPosition([
        smoothedPositionRef.current.x,
        smoothedPositionRef.current.y,
        smoothedPositionRef.current.z
      ]);
    }
  });

  // Only render spaceship when traveling or arrived at destination
  if (journeyStatus !== 'traveling' && journeyStatus !== 'arrived') {
    return null;
  }

  // Scale factor to make spaceship smaller (25% of the 1.25% size = 0.3125% of original)
  const SHIP_SCALE = 0.003125;

  return (
    <group ref={groupRef}>
      {/* Realistic spacecraft design */}

      {/* Main fuselage - elongated body */}
      <mesh ref={bodyRef} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25 * SHIP_SCALE, 0.25 * SHIP_SCALE, 1.2 * SHIP_SCALE, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Nose cone - aerodynamic front */}
      <mesh position={[0.7 * SHIP_SCALE, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.25 * SHIP_SCALE, 0.5 * SHIP_SCALE, 16]} />
        <meshStandardMaterial color="#d0d0d0" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Cockpit window - transparent */}
      <mesh position={[0.5 * SHIP_SCALE, 0, 0.26 * SHIP_SCALE]} rotation={[0, 0, 0]}>
        <sphereGeometry args={[0.15 * SHIP_SCALE, 16, 16, 0, Math.PI]} />
        <meshStandardMaterial
          color="#1a4d7a"
          metalness={0.5}
          roughness={0.3}
          transparent
          opacity={0.7}
          emissive="#1a4d7a"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Upper solar panel wing */}
      <group position={[0, 0.25 * SHIP_SCALE, 0]}>
        <mesh position={[0, 0.5 * SHIP_SCALE, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.8 * SHIP_SCALE, 0.02 * SHIP_SCALE, 1.4 * SHIP_SCALE]} />
          <meshStandardMaterial
            color="#1a3d5c"
            metalness={0.4}
            roughness={0.6}
            emissive="#0a1d3c"
            emissiveIntensity={0.1}
          />
        </mesh>
        {/* Solar panel frame */}
        <mesh position={[0, 0.51 * SHIP_SCALE, 0]}>
          <boxGeometry args={[0.85 * SHIP_SCALE, 0.01 * SHIP_SCALE, 1.45 * SHIP_SCALE]} />
          <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.5} />
        </mesh>
      </group>

      {/* Lower solar panel wing */}
      <group position={[0, -0.25 * SHIP_SCALE, 0]}>
        <mesh position={[0, -0.5 * SHIP_SCALE, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.8 * SHIP_SCALE, 0.02 * SHIP_SCALE, 1.4 * SHIP_SCALE]} />
          <meshStandardMaterial
            color="#1a3d5c"
            metalness={0.4}
            roughness={0.6}
            emissive="#0a1d3c"
            emissiveIntensity={0.1}
          />
        </mesh>
        {/* Solar panel frame */}
        <mesh position={[0, -0.51 * SHIP_SCALE, 0]}>
          <boxGeometry args={[0.85 * SHIP_SCALE, 0.01 * SHIP_SCALE, 1.45 * SHIP_SCALE]} />
          <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.5} />
        </mesh>
      </group>

      {/* Engine section - rear block */}
      <mesh position={[-0.65 * SHIP_SCALE, 0, 0]}>
        <boxGeometry args={[0.3 * SHIP_SCALE, 0.35 * SHIP_SCALE, 0.35 * SHIP_SCALE]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Main engine nozzle - center */}
      <mesh position={[-0.85 * SHIP_SCALE, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12 * SHIP_SCALE, 0.15 * SHIP_SCALE, 0.25 * SHIP_SCALE, 16]} />
        <meshStandardMaterial color="#606060" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Top thruster */}
      <mesh position={[-0.75 * SHIP_SCALE, 0.15 * SHIP_SCALE, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06 * SHIP_SCALE, 0.08 * SHIP_SCALE, 0.15 * SHIP_SCALE, 12]} />
        <meshStandardMaterial color="#505050" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Bottom thruster */}
      <mesh position={[-0.75 * SHIP_SCALE, -0.15 * SHIP_SCALE, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06 * SHIP_SCALE, 0.08 * SHIP_SCALE, 0.15 * SHIP_SCALE, 12]} />
        <meshStandardMaterial color="#505050" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Engine glow - main */}
      <pointLight position={[-0.95 * SHIP_SCALE, 0, 0]} intensity={0.04} distance={6 * SHIP_SCALE} color="#60a5fa" />

      {/* Engine glow - thrusters */}
      <pointLight position={[-0.85 * SHIP_SCALE, 0.15 * SHIP_SCALE, 0]} intensity={0.015} distance={3 * SHIP_SCALE} color="#60a5fa" />
      <pointLight position={[-0.85 * SHIP_SCALE, -0.15 * SHIP_SCALE, 0]} intensity={0.015} distance={3 * SHIP_SCALE} color="#60a5fa" />

      {/* Exhaust glow - main engine */}
      <mesh position={[-0.95 * SHIP_SCALE, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.12 * SHIP_SCALE, 0.2 * SHIP_SCALE, 16]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.7} />
      </mesh>

      {/* Exhaust glow - top thruster */}
      <mesh position={[-0.82 * SHIP_SCALE, 0.15 * SHIP_SCALE, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.06 * SHIP_SCALE, 0.12 * SHIP_SCALE, 12]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.6} />
      </mesh>

      {/* Exhaust glow - bottom thruster */}
      <mesh position={[-0.82 * SHIP_SCALE, -0.15 * SHIP_SCALE, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.06 * SHIP_SCALE, 0.12 * SHIP_SCALE, 12]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.6} />
      </mesh>

      {/* Communication antenna */}
      <mesh position={[0.2 * SHIP_SCALE, 0.3 * SHIP_SCALE, 0]}>
        <cylinderGeometry args={[0.01 * SHIP_SCALE, 0.01 * SHIP_SCALE, 0.15 * SHIP_SCALE, 8]} />
        <meshStandardMaterial color="#808080" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Engine trail particles */}
      <EngineTrail
        propulsion={selectedPropulsion}
        isActive={journeyStatus === 'traveling'}
        flightPhase={flightPhase}
      />
    </group>
  );
}
