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

      const state = useStore.getState();
      // The splash screen handles its own keys (Enter / Esc).
      if (state.showWelcome || state.aboutOpen) return;
      // Let a focused button handle Space/Enter natively (avoids double toggles).
      if (target.tagName === 'BUTTON' && (event.key === ' ' || event.key === 'Enter')) return;
      if (event.metaKey || event.ctrlKey || event.altKey) {
        // ⌘K / Ctrl+K opens the destination picker
        if (event.key.toLowerCase() === 'k') {
          event.preventDefault();
          state.setPickerOpen(!state.pickerOpen);
        }
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

        // /: open destination search
        case '/':
          event.preventDefault();
          useStore.getState().setPickerOpen(true);
          break;

        // H: hide / show the interface
        case 'h':
          useStore.getState().toggleAllUI();
          break;

        // Esc: close picker / layers first, then the info panel
        case 'escape': {
          const st = useStore.getState();
          if (st.pickerOpen) st.setPickerOpen(false);
          else if (st.layersOpen) st.setLayersOpen(false);
          break;
        }
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
