'use client';

import { useRef, useMemo } from 'react';
import { Mesh, Vector3, Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useStore } from '@/app/store/useStore';
import { SCALE_FACTORS, PLANETS } from '@/app/data/planets';
import { getPropulsionById, getFlightPhase, calculateDistanceTraveled } from '@/app/data/propulsion';
import { calculateEllipticalOrbitPosition } from '@/app/lib/orbital-mechanics';
import EngineTrail from './EngineTrail';

// Create a shared ref that can be accessed by the camera
export const spaceshipGroupRef = { current: null as Group | null };

// Camera update callback - will be set by CameraController
export const updateCameraCallback = { current: null as ((shipPosition: Vector3) => void) | null };

export default function Spaceship() {
  const bodyRef = useRef<Mesh | null>(null);
  const groupRef = useRef<Group | null>(null);

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
      // Get current flight phase
      const isDecelerating = flightPhase === 'decelerating';

      // Calculate direction to destination (the trajectory)
      const destPos = new Vector3(
        destinationPositionAtArrival.x,
        destinationPositionAtArrival.y,
        destinationPositionAtArrival.z
      );
      const directionToDestination = new Vector3()
        .subVectors(destPos, position)
        .normalize();

      // Calculate angle in XZ plane (horizontal rotation)
      const angle = Math.atan2(directionToDestination.z, directionToDestination.x);

      // Rotate the entire group to face travel direction
      // During acceleration/cruise: face forward (engines behind)
      // During deceleration: flip 180 degrees (engines in front, pointing toward destination)
      // Spaceship model points in +X direction by default (Math.PI / 2 rotation applied in mesh)
      groupRef.current.rotation.y = -angle + (isDecelerating ? Math.PI : 0);

      // Update position directly - no smoothing
      groupRef.current.position.copy(position);

      // Share the group ref so camera can access it directly
      spaceshipGroupRef.current = groupRef.current;

      // Update camera immediately in the same frame for zero-lag tracking
      if (updateCameraCallback.current) {
        updateCameraCallback.current(position);
      }

      // Update the store so other components can access ship position
      setSpaceshipPosition([
        position.x,
        position.y,
        position.z
      ]);
    }
  });

  // Load the 3D spaceship model
  const { scene } = useGLTF('/textures/spaceship.glb');

  // Only render spaceship when traveling or arrived at destination
  if (journeyStatus !== 'traveling' && journeyStatus !== 'arrived') {
    return null;
  }

  // Scale factor to make spaceship appropriately sized
  // Adjust this value based on how the model looks in the scene
  const SHIP_SCALE = 0.003125;

  return (
    <group ref={groupRef}>
      {/* 3D Spaceship Model */}
      <primitive
        object={scene.clone()}
        scale={SHIP_SCALE}
        rotation={[0, Math.PI / 2, 0]}
        ref={bodyRef}
      />

      {/* Engine trail particles */}
      <EngineTrail
        propulsion={selectedPropulsion}
        isActive={journeyStatus === 'traveling'}
        flightPhase={flightPhase}
      />
    </group>
  );
}

// Preload the model
useGLTF.preload('/textures/spaceship.glb');
