'use client';

import { useStore } from '@/app/store/useStore';
import {
  getPropulsionById,
  calculateTravelTime,
  calculateCurrentSpeed,
  getFlightPhase,
  calculateDistanceTraveled,
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
    useFlipAndBurn,
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

  const totalTime = calculateTravelTime(totalDistance, propulsion, useFlipAndBurn);
  const currentSpeed = calculateCurrentSpeed(journeyElapsedTime, totalDistance, propulsion, useFlipAndBurn);
  const flightPhase = getFlightPhase(journeyElapsedTime, totalDistance, propulsion, useFlipAndBurn);
  const remainingTime = Math.max(0, totalTime - journeyElapsedTime);

  // Calculate actual distance traveled using physics
  const distanceTraveled = calculateDistanceTraveled(journeyElapsedTime, totalDistance, propulsion, useFlipAndBurn);
  const progress = Math.min(100, (distanceTraveled / totalDistance) * 100);
  const distanceRemaining = Math.max(0, totalDistance - distanceTraveled);

  // Debug logging - only log occasionally to avoid console spam
  if (typeof window !== 'undefined' && journeyElapsedTime > 0 && Math.floor(journeyElapsedTime) % 2 === 0) {
    const timeToMaxSpeed = propulsion.maxSpeed / (propulsion.acceleration / 1000);
    const decelStartTime = totalTime - timeToMaxSpeed;

    console.log('Journey Debug:', {
      phase: flightPhase,
      speed: currentSpeed.toFixed(2) + ' km/s',
      maxSpeed: propulsion.maxSpeed + ' km/s',
      acceleration: propulsion.acceleration + ' m/s²',
      progress: progress.toFixed(1) + '%',
      elapsed: journeyElapsedTime.toFixed(1) + 's',
      total: totalTime.toFixed(1) + 's',
      decelStartTime: decelStartTime.toFixed(1) + 's',
      distanceTraveled: (distanceTraveled / 1000000).toFixed(2) + ' M km',
      distanceRemaining: (distanceRemaining / 1000000).toFixed(2) + ' M km',
      useFlipAndBurn,
      propulsion: propulsion.name
    });
  }

  // Get phase display info
  const getPhaseInfo = () => {
    switch (flightPhase) {
      case 'accelerating':
        return { text: 'Accelerating', icon: '🚀', color: '#4ade80' };
      case 'cruising':
        return { text: 'Cruising', icon: '✈️', color: '#60a5fa' };
      case 'decelerating':
        return { text: 'Decelerating', icon: '🔄', color: '#f59e0b' };
    }
  };

  const phaseInfo = getPhaseInfo();

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

      <div className={styles.flightPhase} style={{ borderColor: phaseInfo.color }}>
        <span className={styles.phaseIcon}>{phaseInfo.icon}</span>
        <span className={styles.phaseText} style={{ color: phaseInfo.color }}>
          {phaseInfo.text}
        </span>
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
