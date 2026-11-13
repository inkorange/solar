'use client';

// Import texture preloader to start downloads immediately
import './lib/texture-preloader';

import { useEffect } from 'react';
import SolarSystem from './components/Scene/SolarSystem';
import Navigation from './components/UI/Navigation';
import Controls from './components/UI/Controls';
import InfoPanel from './components/UI/InfoPanel';
import WelcomeOverlay from './components/UI/WelcomeOverlay';
import PropulsionSelector from './components/UI/PropulsionSelector';
import TravelInfoPanel from './components/UI/TravelInfoPanel';
import FPSMonitor from './components/UI/FPSMonitor';
import AboutPanel from './components/UI/AboutPanel';
import KeyboardHandler from './components/KeyboardHandler';
import { IconEye } from './components/UI/icons';
import { useStore } from './store/useStore';

export default function Home() {
  const journeyStatus = useStore((s) => s.journeyStatus);
  const setIsMobileView = useStore((s) => s.setIsMobileView);
  const showAllUI = useStore((s) => s.showAllUI);
  const showWelcome = useStore((s) => s.showWelcome);
  const toggleAllUI = useStore((s) => s.toggleAllUI);
  const isJourneyActive = journeyStatus === 'traveling' || journeyStatus === 'arrived';

  // TravelInfoPanel / PropulsionSelector still read isMobileView.
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 768 || window.innerHeight <= 500);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobileView]);

  return (
    <>
      <KeyboardHandler />
      <SolarSystem />

      {showAllUI && !showWelcome && (
        <>
          <Navigation />
          <Controls />
          <FPSMonitor />
          {isJourneyActive ? <TravelInfoPanel /> : <InfoPanel />}
        </>
      )}

      {!showAllUI && !showWelcome && (
        <button
          type="button"
          onClick={toggleAllUI}
          aria-label="Show interface (H)"
          style={{
            position: 'fixed',
            right: 20,
            bottom: 'max(20px, env(safe-area-inset-bottom))',
            zIndex: 150,
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(10px)',
            color: 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconEye />
        </button>
      )}

      {/* Modals manage their own visibility */}
      <PropulsionSelector />
      <WelcomeOverlay />
      <AboutPanel />
    </>
  );
}
