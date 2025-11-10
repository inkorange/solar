'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/app/store/useStore';
import {
  PROPULSION_SYSTEMS,
  PropulsionType,
  calculateTravelTime,
  formatDuration,
  CONSTANTS,
} from '@/app/data/propulsion';
import { calculateInterceptCourse } from '@/app/lib/orbital-mechanics';
import { SCALE_FACTORS, PLANETS, PlanetData } from '@/app/data/planets';
import styles from './PropulsionSelector.module.scss';

export default function PropulsionSelector() {
  const {
    journeyStatus,
    destination,
    origin,
    setSelectedPropulsion,
    setJourneyStatus,
    cancelJourney,
    startJourney,
    simulationTime,
    scaleMode,
    setOrigin,
  } = useStore();

  const [selected, setSelected] = useState<PropulsionType | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<PropulsionType>>(new Set());
  const [selectedOrigin, setSelectedOrigin] = useState<PlanetData | null>(
    PLANETS.find(p => p.name === 'Earth') || origin
  );

  if (journeyStatus !== 'selecting-propulsion' || !destination || !origin) {
    return null;
  }

  // Calculate intercept courses for each propulsion system
  // This accounts for where the destination planet will be when the ship arrives
  const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;

  const interceptCourses = useMemo(() => {
    if (!selectedOrigin) return new Map();

    const courses = new Map<PropulsionType, ReturnType<typeof calculateInterceptCourse>>();

    PROPULSION_SYSTEMS.forEach((propulsion) => {
      const course = calculateInterceptCourse(
        selectedOrigin,
        destination,
        simulationTime,
        scaleFactor.DISTANCE,
        (distanceKm) => calculateTravelTime(distanceKm, propulsion)
      );
      courses.set(propulsion.id, course);
    });

    return courses;
  }, [selectedOrigin, destination, simulationTime, scaleFactor.DISTANCE]);

  // Get the intercept course for the selected propulsion (for confirmation)
  const selectedCourse = selected ? interceptCourses.get(selected) : null;

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
    if (selected && selectedOrigin && destination && selectedCourse) {
      // Update the origin in the store if it was changed
      setOrigin(selectedOrigin);

      // Start the journey with intercept course data
      startJourney(
        selectedOrigin,
        destination,
        selected,
        selectedCourse.distance,
        selectedCourse.arrivalTime,
        selectedCourse.destinationPositionAtArrival
      );
    }
  };

  const handleCancel = () => {
    cancelJourney();
  };

  return (
    <>
      <div className={styles.overlay} onClick={handleCancel} />
      <div className={styles.selector}>
        <div className={styles.scrollContent}>
          <div className={styles.header}>
            <h2>Choose Your Propulsion System</h2>
            <p className={styles.subtitle}>
              Select your starting point and propulsion method
            </p>
          </div>

          {/* Origin planet selector */}
          <div className={styles.originSelector}>
            <label className={styles.originLabel}>Starting from:</label>
            <select
              className={styles.originSelect}
              value={selectedOrigin?.name || ''}
              onChange={(e) => {
                const planet = PLANETS.find(p => p.name === e.target.value);
                if (planet) {
                  setSelectedOrigin(planet);
                }
              }}
            >
              {PLANETS.map((planet) => (
                <option key={planet.name} value={planet.name}>
                  {planet.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.routeInfo}>
            <div className={styles.routeText}>
              <span>{selectedOrigin?.name}</span> → <span>{destination.name}</span>
            </div>
            <div className={styles.distance}>
              Intercept course calculated
            </div>
          </div>

          <div className={styles.propulsionGrid}>
            {PROPULSION_SYSTEMS.map((propulsion) => {
              const course = interceptCourses.get(propulsion.id);
              if (!course) return null;

              const travelTime = calculateTravelTime(course.distance, propulsion);
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
        </div>

        <div className={styles.stickyFooter}>
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
