import { create } from 'zustand';
import { PlanetData } from '../data/planets';
import { PropulsionType } from '../data/propulsion';

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
  journeyStartTime: number; // Simulation time when journey started
  journeyElapsedTime: number; // Elapsed time in the journey (seconds)
  totalDistance: number; // Total journey distance in km
  setJourneyStatus: (status: JourneyStatus) => void;
  setOrigin: (planet: PlanetData | null) => void;
  setSelectedPropulsion: (propulsion: PropulsionType | null) => void;
  startJourney: (origin: PlanetData, destination: PlanetData, propulsion: PropulsionType, distance: number) => void;
  updateJourneyProgress: (delta: number) => void;
  completeJourney: () => void;
  cancelJourney: () => void;

  // Time controls
  isPaused: boolean;
  timeSpeed: number; // Multiplier: 1x, 10x, 100x, etc.
  simulationTime: number; // Current simulation time in seconds
  setIsPaused: (paused: boolean) => void;
  setTimeSpeed: (speed: number) => void;
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
  setScaleMode: (mode: ScaleMode) => void;
  toggleOrbits: () => void;
  toggleLabels: () => void;
  toggleTrails: () => void;

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
  journeyStartTime: 0,
  journeyElapsedTime: 0,
  totalDistance: 0,
  setJourneyStatus: (status) => set({ journeyStatus: status }),
  setOrigin: (planet) => set({ origin: planet }),
  setSelectedPropulsion: (propulsion) => set({ selectedPropulsion: propulsion }),
  startJourney: (origin, destination, propulsion, distance) =>
    set((state) => ({
      journeyStatus: 'traveling',
      origin,
      destination,
      selectedPropulsion: propulsion,
      journeyStartTime: state.simulationTime,
      journeyElapsedTime: 0,
      totalDistance: distance,
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
    set({
      journeyStatus: 'arrived',
      journeyElapsedTime: 0,
    }),
  cancelJourney: () =>
    set({
      journeyStatus: 'idle',
      origin: null,
      destination: null,
      selectedPropulsion: null,
      journeyStartTime: 0,
      journeyElapsedTime: 0,
      totalDistance: 0,
    }),

  // Time controls
  isPaused: false,
  timeSpeed: 1,
  simulationTime: 0,
  setIsPaused: (paused) => set({ isPaused: paused }),
  setTimeSpeed: (speed) => set({ timeSpeed: speed }),
  updateSimulationTime: (delta) =>
    set((state) => ({
      simulationTime: state.isPaused ? state.simulationTime : state.simulationTime + delta * state.timeSpeed
    })),

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
  setScaleMode: (mode) => set({ scaleMode: mode }),
  toggleOrbits: () => set((state) => ({ showOrbits: !state.showOrbits })),
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
  toggleTrails: () => set((state) => ({ showTrails: !state.showTrails })),

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
