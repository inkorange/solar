'use client';

import { useStore, CameraMode } from '@/app/store/useStore';
import styles from './Controls.module.scss';

const SPEED_OPTIONS = [1, 10, 1000, 10000, 100000];

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
  } = useStore();

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
          {SPEED_OPTIONS.map((speed) => (
            <button
              key={speed}
              className={timeSpeed === speed ? styles.active : ''}
              onClick={() => setTimeSpeed(speed)}
            >
              {speed}x
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
              onClick={() => setCameraMode(mode)}
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
