'use client';

import { useStore } from '@/app/store/useStore';
import {
  getPropulsionById,
  calculateTravelTime,
  calculateCurrentSpeed,
  formatDuration,
  CONSTANTS,
} from '@/app/data/propulsion';
import styles from './TravelInfoPanel.module.scss';

export default function TravelInfoPanel() {
  const {
    journeyStatus,
    destination,
    origin,
    selectedPropulsion,
    journeyElapsedTime,
    totalDistance,
    cancelJourney,
    resetJourney,
  } = useStore();

  if (!destination || !origin || !selectedPropulsion) {
    return null;
  }

  const propulsion = getPropulsionById(selectedPropulsion);
  if (!propulsion) return null;

  const totalTime = calculateTravelTime(totalDistance, propulsion);
  const currentSpeed = calculateCurrentSpeed(journeyElapsedTime, totalDistance, propulsion);
  const remainingTime = Math.max(0, totalTime - journeyElapsedTime);
  const progress = Math.min(100, (journeyElapsedTime / totalTime) * 100);
  const distanceRemaining = totalDistance * (1 - journeyElapsedTime / totalTime);

  // Show arrived state
  if (journeyStatus === 'arrived') {
    return (
      <div className={`${styles.panel} ${styles.arrivedPanel}`}>
        <div className={styles.celebrationIcon}>🎉</div>

        <div className={styles.arrivedMessage}>
          <h3>Arrival at {destination.name}</h3>
          <p>Journey complete! Welcome to your destination.</p>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Route</span>
            <span className={styles.summaryValue}>
              {origin.name} → {destination.name}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Distance</span>
            <span className={styles.summaryValue}>
              {(totalDistance / 1000000).toFixed(1)} M km
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Propulsion</span>
            <span className={styles.summaryValue}>{propulsion.name}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Travel Time</span>
            <span className={styles.summaryValue}>{formatDuration(totalTime)}</span>
          </div>
        </div>

        <button
          className={styles.continueButton}
          onClick={() => resetJourney()}
        >
          Continue Exploring
        </button>
      </div>
    );
  }

  // Show traveling state
  if (journeyStatus !== 'traveling') {
    return null;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.title}>
          <h2>Journey in Progress</h2>
          <div className={styles.status}>Active Travel</div>
        </div>
      </div>

      <div className={styles.route}>
        <div className={styles.routeText}>
          <span>{origin.name}</span> → <span>{destination.name}</span>
        </div>
        <div className={styles.propulsion}>
          <span className={styles.icon}>{propulsion.icon}</span>
          <span>{propulsion.displayName}</span>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progress} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.label}>Current Speed</div>
          <div className={styles.value}>
            {currentSpeed >= 1000
              ? `${(currentSpeed / 1000).toFixed(1)}k`
              : currentSpeed.toFixed(1)}
            <span className={styles.unit}> km/s</span>
          </div>
        </div>

        <div className={styles.stat}>
          <div className={styles.label}>Distance Left</div>
          <div className={styles.value}>
            {distanceRemaining >= 1000000
              ? `${(distanceRemaining / 1000000).toFixed(1)}`
              : `${(distanceRemaining / 1000).toFixed(0)}`}
            <span className={styles.unit}>
              {distanceRemaining >= 1000000 ? ' M km' : ' k km'}
            </span>
          </div>
        </div>

        <div className={`${styles.stat} ${styles.statFull}`}>
          <div className={styles.label}>Progress</div>
          <div className={styles.value}>
            {progress.toFixed(1)}
            <span className={styles.unit}>%</span>
          </div>
        </div>
      </div>

      <div className={styles.eta}>
        <div className={styles.etaLabel}>Estimated Time Remaining</div>
        <div className={styles.etaValue}>{formatDuration(remainingTime)}</div>
      </div>

      <div className={styles.actions}>
        <button className={styles.cancelButton} onClick={cancelJourney}>
          Abort Journey
        </button>
      </div>
    </div>
  );
}
