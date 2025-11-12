import { create } from 'zustand';
import { PlanetData, SCALE_FACTORS } from '../data/planets';
import { PropulsionType } from '../data/propulsion';
import { calculateEllipticalOrbitPosition } from '../lib/orbital-mechanics';

export type CameraMode = 'free' | 'follow-spaceship' | 'planet-focus' | 'destination-preview';
export type ScaleMode = 'visual' | 'realistic';
export type JourneyStatus = 'idle' | 'selecting-destination' | 'selecting-propulsion' | 'traveling' | 'arrived';

interface AppState {
  // Selected celestial body
  selectedPlanet: PlanetData | null;
  setSelectedPlanet: (planet: PlanetData | null) => void;

  // Destination for travel
  destination: PlanetData | null;
  setDestination: (planet: PlanetData | null) => void;

  // Journey state
  journeyStatus: JourneyStatus;
  origin: PlanetData | null;
  selectedPropulsion: PropulsionType | null;
  useFlipAndBurn: boolean; // Whether to use flip-and-burn deceleration
  journeyStartTime: number; // Simulation time when journey started
  journeyElapsedTime: number; // Elapsed time in the journey (seconds)
  totalDistance: number; // Total journey distance in km
  arrivalTime: number; // Simulation time when journey will complete
  destinationPositionAtArrival: { x: number; y: number; z: number } | null; // Where destination will be when ship arrives
  pausedBeforeSelection: boolean; // Pause state before entering propulsion selection
  setJourneyStatus: (status: JourneyStatus) => void;
  setOrigin: (planet: PlanetData | null) => void;
  setSelectedPropulsion: (propulsion: PropulsionType | null) => void;
  setUseFlipAndBurn: (use: boolean) => void;
  startJourney: (origin: PlanetData, destination: PlanetData, propulsion: PropulsionType, distance: number, arrivalTime: number, destinationPosAtArrival: { x: number; y: number; z: number }, useFlipAndBurn: boolean) => void;
  updateJourneyProgress: (delta: number) => void;
  completeJourney: () => void;
  resetJourney: () => void;
  cancelJourney: () => void;

  // Time controls
  isPaused: boolean;
  timeSpeed: number; // Multiplier: 1x, 10x, 100x, etc.
  simulationTime: number; // Current simulation time in seconds
  setIsPaused: (paused: boolean) => void;
  setTimeSpeed: (speed: number) => void;
  setSimulationTime: (time: number) => void;
  updateSimulationTime: (delta: number) => void;

  // Camera controls
  cameraMode: CameraMode;
  cameraTarget: [number, number, number] | null;
  focusedPlanetName: string | null;
  setCameraMode: (mode: CameraMode) => void;
  setCameraTarget: (target: [number, number, number] | null, planetName: string | null) => void;

  // Display settings
  scaleMode: ScaleMode;
  showOrbits: boolean;
  showLabels: boolean;
  showTrails: boolean;
  showFPS: boolean;
  unitSystem: 'metric' | 'imperial';
  setScaleMode: (mode: ScaleMode) => void;
  toggleOrbits: () => void;
  toggleLabels: () => void;
  toggleTrails: () => void;
  toggleFPS: () => void;
  setUnitSystem: (system: 'metric' | 'imperial') => void;

  // UI state
  showWelcome: boolean;
  showInfoPanel: boolean;
  showNavigation: boolean;
  setShowWelcome: (show: boolean) => void;
  setShowInfoPanel: (show: boolean) => void;
  setShowNavigation: (show: boolean) => void;

  // Spaceship position (for Phase 2)
  spaceshipPosition: [number, number, number];
  setSpaceshipPosition: (position: [number, number, number]) => void;
}

export const useStore = create<AppState>((set) => ({
  // Selected planet
  selectedPlanet: null,
  setSelectedPlanet: (planet) => set({ selectedPlanet: planet, showInfoPanel: !!planet }),

  // Destination
  destination: null,
  setDestination: (planet) => set({ destination: planet }),

  // Journey state
  journeyStatus: 'idle',
  origin: null,
  selectedPropulsion: null,
  useFlipAndBurn: true, // Default to true for realistic arrivals
  journeyStartTime: 0,
  journeyElapsedTime: 0,
  totalDistance: 0,
  arrivalTime: 0,
  destinationPositionAtArrival: null,
  pausedBeforeSelection: false,
  setJourneyStatus: (status) => set((state) => {
    // When entering propulsion selection, pause the simulation
    if (status === 'selecting-propulsion') {
      return {
        journeyStatus: status,
        pausedBeforeSelection: state.isPaused,
        isPaused: true,
      };
    }
    return { journeyStatus: status };
  }),
  setOrigin: (planet) => set({ origin: planet }),
  setSelectedPropulsion: (propulsion) => set({ selectedPropulsion: propulsion }),
  setUseFlipAndBurn: (use) => set({ useFlipAndBurn: use }),
  startJourney: (origin, destination, propulsion, distance, arrivalTime, destinationPosAtArrival, useFlipAndBurn) =>
    set((state) => ({
      journeyStatus: 'traveling',
      origin,
      destination,
      selectedPropulsion: propulsion,
      useFlipAndBurn,
      journeyStartTime: state.simulationTime,
      journeyElapsedTime: 0,
      totalDistance: distance,
      arrivalTime,
      destinationPositionAtArrival: destinationPosAtArrival,
      isPaused: false,
    })),
  updateJourneyProgress: (delta) =>
    set((state) => {
      if (state.journeyStatus !== 'traveling') return state;
      return {
        journeyElapsedTime: state.journeyElapsedTime + delta * state.timeSpeed,
      };
    }),
  completeJourney: () =>
    set((state) => {
      if (!state.destination) {
        return {
          journeyStatus: 'arrived',
          journeyElapsedTime: 0,
        };
      }

      // Calculate camera position for the destination planet (same logic as Controls.tsx)
      const scaleFactor = state.scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
      const position = calculateEllipticalOrbitPosition(
        state.simulationTime,
        state.destination,
        scaleFactor.DISTANCE
      );

      // Calculate camera distance based on planet size
      const planetRadius = (state.destination.diameter / 12742) * scaleFactor.SIZE * 5;
      const planetDiameter = planetRadius * 2;

      const fov = 60;
      const fovRadians = (fov * Math.PI) / 180;

      const jupiterDiameter = (142984 / 12742) * scaleFactor.SIZE * 5 * 2;
      const sizeRatio = Math.min(planetDiameter / jupiterDiameter, 1);
      const distanceMultiplier = 1 + (39 * Math.pow(1 - sizeRatio, 1.5));
      const baseDistance = planetDiameter / (0.3 * 2 * Math.tan(fovRadians / 2));
      let cameraDistance = baseDistance / distanceMultiplier;

      const visualRadius = state.destination.hasRings && state.destination.ringData
        ? planetRadius * state.destination.ringData.outerRadiusRatio
        : planetRadius;
      const minSafeDistance = visualRadius * 2;
      cameraDistance = Math.max(cameraDistance, minSafeDistance);

      const angle = Math.PI / 4;
      const cameraPos: [number, number, number] = [
        position.x + cameraDistance * Math.cos(angle),
        cameraDistance * 0.3,
        position.z + cameraDistance * Math.sin(angle),
      ];

      // Switch to planet-focus mode and target the destination planet
      return {
        journeyStatus: 'arrived',
        journeyElapsedTime: 0,
        cameraMode: 'planet-focus',
        focusedPlanetName: state.destination.name,
        selectedPlanet: state.destination,
        showInfoPanel: true,
        cameraTarget: cameraPos,
      };
    }),
  resetJourney: () =>
    set({
      journeyStatus: 'idle',
      origin: null,
      destination: null,
      selectedPropulsion: null,
      useFlipAndBurn: true,
      journeyStartTime: 0,
      journeyElapsedTime: 0,
      totalDistance: 0,
      arrivalTime: 0,
      destinationPositionAtArrival: null,
    }),
  cancelJourney: () =>
    set((state) => ({
      journeyStatus: 'idle',
      origin: null,
      destination: null,
      selectedPropulsion: null,
      useFlipAndBurn: true,
      journeyStartTime: 0,
      journeyElapsedTime: 0,
      totalDistance: 0,
      arrivalTime: 0,
      destinationPositionAtArrival: null,
      isPaused: state.pausedBeforeSelection, // Restore previous pause state
    })),

  // Time controls
  isPaused: false,
  timeSpeed: 1,
  simulationTime: 0,
  setIsPaused: (paused) => set({ isPaused: paused }),
  setTimeSpeed: (speed) => set({ timeSpeed: speed }),
  setSimulationTime: (time) => set({ simulationTime: time }),
  updateSimulationTime: (delta) =>
    set((state) => {
      // Cap delta to prevent large jumps (e.g., when tab is inactive)
      const cappedDelta = Math.min(delta, 0.1);
      const increment = cappedDelta * state.timeSpeed;

      return {
        simulationTime: state.isPaused ? state.simulationTime : state.simulationTime + increment
      };
    }),

  // Camera controls
  cameraMode: 'free',
  cameraTarget: null,
  focusedPlanetName: null,
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setCameraTarget: (target, planetName) => set({ cameraTarget: target, focusedPlanetName: planetName }),

  // Display settings
  scaleMode: 'visual',
  showOrbits: true,
  showLabels: true,
  showTrails: false,
  showFPS: false,
  unitSystem: 'metric',
  setScaleMode: (mode) => set({ scaleMode: mode }),
  toggleOrbits: () => set((state) => ({ showOrbits: !state.showOrbits })),
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
  toggleTrails: () => set((state) => ({ showTrails: !state.showTrails })),
  toggleFPS: () => set((state) => ({ showFPS: !state.showFPS })),
  setUnitSystem: (system) => set({ unitSystem: system }),

  // UI state
  showWelcome: true,
  showInfoPanel: false,
  showNavigation: true,
  setShowWelcome: (show) => set({ showWelcome: show }),
  setShowInfoPanel: (show) => set({ showInfoPanel: show }),
  setShowNavigation: (show) => set({ showNavigation: show }),

  // Spaceship
  spaceshipPosition: [0, 0, 10], // Start near Earth
  setSpaceshipPosition: (position) => set({ spaceshipPosition: position }),
}));
