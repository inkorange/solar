'use client';

import SolarSystem from './components/Scene/SolarSystem';
import Navigation from './components/UI/Navigation';
import Controls from './components/UI/Controls';
import InfoPanel from './components/UI/InfoPanel';
import WelcomeOverlay from './components/UI/WelcomeOverlay';
import PropulsionSelector from './components/UI/PropulsionSelector';
import TravelInfoPanel from './components/UI/TravelInfoPanel';
import { useStore } from './store/useStore';

export default function Home() {
  const { journeyStatus } = useStore();
  const isJourneyActive = journeyStatus === 'traveling' || journeyStatus === 'arrived';

  return (
    <>
      {/* 3D Scene */}
      <SolarSystem />

      {/* UI Overlays */}
      <Navigation />
      <Controls />

      {/* Show either InfoPanel or TravelInfoPanel based on journey status */}
      {isJourneyActive ? <TravelInfoPanel /> : <InfoPanel />}

      {/* Propulsion Selection Modal */}
      <PropulsionSelector />

      {/* Welcome Overlay */}
      <WelcomeOverlay />
    </>
  );
}
