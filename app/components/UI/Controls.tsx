'use client';

import { useState, useEffect } from 'react';
import { useStore, CameraMode } from '@/app/store/useStore';
import { SCALE_FACTORS } from '@/app/data/planets';
import { calculateEllipticalOrbitPosition } from '@/app/lib/orbital-mechanics';
import styles from './Controls.module.scss';

// Numeric values used for timeSpeed; labels below are the shortened display strings
const SPEED_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: '1x' },
  { value: 100, label: '100x' },
  { value: 10000, label: '10kx' },
  { value: 100000, label: '100kx' },
  { value: 500000, label: '500kx' },
];

const CAMERA_MODES: { mode: CameraMode; label: string }[] = [
  { mode: 'free', label: 'Free' },
  { mode: 'follow-spaceship', label: 'Follow Ship' },
  { mode: 'planet-focus', label: 'Planet' },
];

export default function Controls() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const {
    isPaused,
    setIsPaused,
    timeSpeed,
    setTimeSpeed,
    showOrbits,
    toggleOrbits,
    showLabels,
    toggleLabels,
    showFPS,
    toggleFPS,
    unitSystem,
    setUnitSystem,
    cameraMode,
    setCameraMode,
    selectedPlanet,
    setCameraTarget,
    simulationTime,
    scaleMode,
  } = useStore();

  // Detect if mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // On desktop, start visible; on mobile, start hidden
      if (!mobile) {
        setIsVisible(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCameraModeChange = (mode: CameraMode) => {
    // If clicking the same mode (e.g., re-clicking "Follow Ship"), force a reset
    // by briefly switching to 'free' mode and then back
    if (mode === cameraMode) {
      setCameraMode('free');
      // Use setTimeout to ensure the mode change is processed
      setTimeout(() => {
        setCameraMode(mode);
      }, 0);
      return;
    }

    // If switching to planet-focus mode and there's a selected planet,
    // recalculate and set the camera position (same logic as Navigation.tsx)
    if (mode === 'planet-focus' && selectedPlanet) {
      const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
      const position = calculateEllipticalOrbitPosition(
        simulationTime,
        selectedPlanet,
        scaleFactor.DISTANCE
      );

      // Calculate camera distance based on planet size
      const planetRadius = (selectedPlanet.diameter / 12742) * scaleFactor.SIZE * 5;
      const planetDiameter = planetRadius * 2;

      const fov = 60;
      const fovRadians = (fov * Math.PI) / 180;

      const jupiterDiameter = (142984 / 12742) * scaleFactor.SIZE * 5 * 2;
      const sizeRatio = Math.min(planetDiameter / jupiterDiameter, 1);
      const distanceMultiplier = 1 + (39 * Math.pow(1 - sizeRatio, 1.5));
      const baseDistance = planetDiameter / (0.3 * 2 * Math.tan(fovRadians / 2));
      let cameraDistance = baseDistance / distanceMultiplier;

      const visualRadius = selectedPlanet.hasRings && selectedPlanet.ringData
        ? planetRadius * selectedPlanet.ringData.outerRadiusRatio
        : planetRadius;
      const minSafeDistance = visualRadius * 2;
      cameraDistance = Math.max(cameraDistance, minSafeDistance);

      const angle = Math.PI / 4;
      const cameraPos: [number, number, number] = [
        position.x + cameraDistance * Math.cos(angle),
        cameraDistance * 0.3,
        position.z + cameraDistance * Math.sin(angle),
      ];

      setCameraTarget(cameraPos, selectedPlanet.name);
    }

    setCameraMode(mode);
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsVisible(false);
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div
      className={`${styles.controlsWrapper} ${isVisible ? styles.visible : styles.hidden}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Toggle button (visible when hidden, especially on mobile) */}
      {!isVisible && (
        <button
          className={styles.toggleButton}
          onClick={toggleVisibility}
          aria-label="Show controls"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}

      {/* Main controls panel */}
      <div className={styles.controls}>
      {/* Play/Pause */}
      <div className={styles.controlGroup}>
        <button
          className={`${styles.playPauseButton} ${isPaused ? styles.paused : ''}`}
          onClick={() => setIsPaused(!isPaused)}
          title={isPaused ? 'Play' : 'Pause'}
        >
          {isPaused ? '▶' : '⏸'}
        </button>
      </div>

      <div className={styles.divider} />

      {/* Time speed */}
      <div className={styles.controlGroup}>
        <label>Speed</label>
        <div className={styles.speedButtons}>
          {SPEED_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              className={timeSpeed === value ? styles.active : ''}
              onClick={() => setTimeSpeed(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.divider} />

      {/* Camera modes */}
      <div className={styles.controlGroup}>
        <label>Camera</label>
        <div className={styles.toggleGroup}>
          {CAMERA_MODES.map(({ mode, label }) => (
            <button
              key={mode}
              className={cameraMode === mode ? styles.active : ''}
              onClick={() => handleCameraModeChange(mode)}
              title={`${label} camera mode`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.divider} />

      {/* Display toggles */}
      <div className={styles.controlGroup}>
        <label>Display</label>
        <div className={styles.toggleGroup}>
          <button
            className={showOrbits ? styles.active : ''}
            onClick={toggleOrbits}
          >
            Orbits
          </button>
          <button
            className={showLabels ? styles.active : ''}
            onClick={toggleLabels}
          >
            Labels
          </button>
          <button
            className={showFPS ? styles.active : ''}
            onClick={toggleFPS}
          >
            FPS
          </button>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Unit system */}
      <div className={styles.controlGroup}>
        <label>Units</label>
        <div className={styles.toggleGroup}>
          <button
            className={unitSystem === 'metric' ? styles.active : ''}
            onClick={() => setUnitSystem('metric')}
          >
            Metric
          </button>
          <button
            className={unitSystem === 'imperial' ? styles.active : ''}
            onClick={() => setUnitSystem('imperial')}
          >
            Imperial
          </button>
        </div>
      </div>
      </div>

      {/* Close button for mobile when visible */}
      {isMobile && isVisible && (
        <button
          className={styles.closeButton}
          onClick={toggleVisibility}
          aria-label="Hide controls"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}
    </div>
  );
}
