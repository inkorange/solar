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
import DateTracker from './components/UI/DateTracker';
import KeyboardHandler from './components/KeyboardHandler';
import { useStore } from './store/useStore';

export default function Home() {
  const { journeyStatus, setIsMobileView, setShowNavigation, isMobileView, showAllUI, toggleAllUI } = useStore();
  const isJourneyActive = journeyStatus === 'traveling' || journeyStatus === 'arrived';

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      setIsMobileView(isMobile);
    };
    handleResize();
    // Hide navigation on mobile by default
    if (window.innerWidth <= 768) {
      setShowNavigation(false);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobileView, setShowNavigation]);

  return (
    <>
      {/* Keyboard Navigation */}
      <KeyboardHandler />

      {/* 3D Scene */}
      <SolarSystem />

      {/* UI Overlays - hidden when immersive mode is active */}
      {showAllUI && (
        <>
          <DateTracker />
          <Navigation />
          <Controls />
          <FPSMonitor />
          {isJourneyActive ? <TravelInfoPanel /> : <InfoPanel />}
        </>
      )}

      {/* Modals always render (they manage their own visibility) */}
      <PropulsionSelector />
      <WelcomeOverlay />

      {/* Immersive mode toggle - mobile only */}
      {isMobileView && (
        <button
          onClick={toggleAllUI}
          aria-label={showAllUI ? 'Hide all panels' : 'Show all panels'}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 150,
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(10px)',
            color: showAllUI ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            transition: 'all 0.2s ease',
          }}
        >
          {showAllUI ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          )}
        </button>
      )}
    </>
  );
}
