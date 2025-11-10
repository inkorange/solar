'use client';

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
  const {
    isPaused,
    setIsPaused,
    timeSpeed,
    setTimeSpeed,
    showOrbits,
    toggleOrbits,
    showLabels,
    toggleLabels,
    cameraMode,
    setCameraMode,
    selectedPlanet,
    setCameraTarget,
    simulationTime,
    scaleMode,
  } = useStore();

  const handleCameraModeChange = (mode: CameraMode) => {
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

  return (
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
        </div>
      </div>
    </div>
  );
}
