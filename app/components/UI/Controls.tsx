'use client';

import { useStore } from '@/app/store/useStore';
import styles from './Controls.module.scss';

const SPEED_OPTIONS = [1, 10, 100, 1000, 10000];

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
