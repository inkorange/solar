'use client';

import { useEffect } from 'react';
import { useStore } from '@/app/store/useStore';

/**
 * Keyboard shortcuts handler
 * Provides keyboard navigation for common actions
 */
export default function KeyboardHandler() {
  const {
    isPaused,
    setIsPaused,
    timeSpeed,
    setTimeSpeed,
    toggleOrbits,
    toggleLabels,
    toggleFPS,
    setCameraMode,
    cameraMode,
    journeyStatus,
  } = useStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't intercept if user is typing in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Don't allow controls when propulsion selector is open
      if (journeyStatus === 'selecting-propulsion') {
        return;
      }

      switch (event.key.toLowerCase()) {
        // Space: Pause/Play
        case ' ':
          event.preventDefault();
          setIsPaused(!isPaused);
          break;

        // Number keys 1-5: Set time speed
        case '1':
          setTimeSpeed(1);
          break;
        case '2':
          setTimeSpeed(100);
          break;
        case '3':
          setTimeSpeed(10000);
          break;
        case '4':
          setTimeSpeed(100000);
          break;
        case '5':
          setTimeSpeed(500000);
          break;

        // C: Cycle camera modes
        case 'c':
          const modes = ['free', 'follow-spaceship', 'planet-focus'] as const;
          const currentIndex = modes.indexOf(cameraMode as any);
          // If current mode is not in the cycleable modes (e.g., destination-preview), start from free
          if (currentIndex === -1) {
            setCameraMode('free');
          } else {
            const nextIndex = (currentIndex + 1) % modes.length;
            setCameraMode(modes[nextIndex]);
          }
          break;

        // O: Toggle orbits
        case 'o':
          toggleOrbits();
          break;

        // L: Toggle labels
        case 'l':
          toggleLabels();
          break;

        // F: Toggle FPS monitor
        case 'f':
          toggleFPS();
          break;

        // Esc: Close info panel (if needed in the future)
        case 'escape':
          // Can be used for closing panels
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isPaused,
    setIsPaused,
    timeSpeed,
    setTimeSpeed,
    toggleOrbits,
    toggleLabels,
    toggleFPS,
    setCameraMode,
    cameraMode,
    journeyStatus,
  ]);

  return null;
}
