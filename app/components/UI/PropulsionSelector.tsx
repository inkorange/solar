'use client';

import { useState } from 'react';
import { useStore } from '@/app/store/useStore';
import {
  PROPULSION_SYSTEMS,
  PropulsionType,
  calculateTravelTime,
  formatDuration,
  CONSTANTS,
} from '@/app/data/propulsion';
import styles from './PropulsionSelector.module.scss';

export default function PropulsionSelector() {
  const {
    journeyStatus,
    destination,
    origin,
    setSelectedPropulsion,
    setJourneyStatus,
    cancelJourney,
  } = useStore();

  const [selected, setSelected] = useState<PropulsionType | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<PropulsionType>>(new Set());

  if (journeyStatus !== 'selecting-propulsion' || !destination || !origin) {
    return null;
  }

  // Calculate distance between origin and destination
  // For simplicity, using straight-line distance (in reality, would need to account for orbits)
  const distance = Math.abs(destination.distanceFromSun - origin.distanceFromSun) * CONSTANTS.AU_TO_KM;

  const handleSelect = (propulsionId: PropulsionType) => {
    setSelected(propulsionId);
  };

  const handleToggleExpand = (propulsionId: PropulsionType) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(propulsionId)) {
      newExpanded.delete(propulsionId);
    } else {
      newExpanded.add(propulsionId);
    }
    setExpandedCards(newExpanded);
  };

  const handleConfirm = () => {
    if (selected) {
      setSelectedPropulsion(selected);
      setJourneyStatus('traveling');
    }
  };

  const handleCancel = () => {
    cancelJourney();
  };

  return (
    <>
      <div className={styles.overlay} onClick={handleCancel} />
      <div className={styles.selector}>
        <div className={styles.header}>
          <h2>Choose Your Propulsion System</h2>
          <p className={styles.subtitle}>
            Select how you'd like to travel through the solar system
          </p>
        </div>

        <div className={styles.routeInfo}>
          <div className={styles.routeText}>
            <span>{origin.name}</span> → <span>{destination.name}</span>
          </div>
          <div className={styles.distance}>
            {(distance / 1000000).toFixed(1)} million km
          </div>
        </div>

        <div className={styles.propulsionGrid}>
          {PROPULSION_SYSTEMS.map((propulsion) => {
            const travelTime = calculateTravelTime(distance, propulsion);
            const isSelected = selected === propulsion.id;
            const isExpanded = expandedCards.has(propulsion.id);

            return (
              <div
                key={propulsion.id}
                className={`${styles.propulsionCard} ${isSelected ? styles.selected : ''}`}
                onClick={() => handleSelect(propulsion.id)}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.left}>
                    <div className={styles.icon}>{propulsion.icon}</div>
                    <div className={styles.info}>
                      <h3>{propulsion.displayName}</h3>
                      <div className={styles.category}>{propulsion.category}</div>
                    </div>
                  </div>
                  <div className={styles.travelTime}>
                    <div className={styles.label}>Travel Time</div>
                    <div className={styles.time}>{formatDuration(travelTime)}</div>
                  </div>
                </div>

                <div className={styles.description}>{propulsion.description}</div>

                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <div className={styles.statLabel}>Max Speed</div>
                    <div className={styles.statValue}>
                      {propulsion.maxSpeed >= 1000
                        ? `${(propulsion.maxSpeed / 1000).toFixed(0)}k km/s`
                        : `${propulsion.maxSpeed} km/s`}
                    </div>
                  </div>
                  <div className={styles.stat}>
                    <div className={styles.statLabel}>Acceleration</div>
                    <div className={styles.statValue}>
                      {propulsion.acceleration >= 1
                        ? `${propulsion.acceleration} m/s²`
                        : `${(propulsion.acceleration * 1000).toFixed(2)} mm/s²`}
                    </div>
                  </div>
                </div>

                <button
                  className={styles.expandButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleExpand(propulsion.id);
                  }}
                >
                  {isExpanded ? '▼ Show Less' : '▶ Learn More'}
                </button>

                {isExpanded && (
                  <div className={styles.expandedContent}>
                    <h4>Technical Details</h4>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginBottom: '12px' }}>
                      {propulsion.technicalDetails}
                    </p>

                    <h4>Real-World Examples</h4>
                    <ul>
                      {propulsion.realWorldExamples.map((example, i) => (
                        <li key={i}>{example}</li>
                      ))}
                    </ul>

                    <h4>Advantages</h4>
                    <ul>
                      {propulsion.advantages.slice(0, 2).map((adv, i) => (
                        <li key={i}>{adv}</li>
                      ))}
                    </ul>

                    <h4>Limitations</h4>
                    <ul>
                      {propulsion.limitations.slice(0, 2).map((lim, i) => (
                        <li key={i}>{lim}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={handleCancel}>
            Cancel Journey
          </button>
          <button
            className={styles.confirmButton}
            onClick={handleConfirm}
            disabled={!selected}
          >
            {selected ? 'Begin Journey' : 'Select a Propulsion System'}
          </button>
        </div>
      </div>
    </>
  );
}
