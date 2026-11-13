'use client';

import { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/app/store/useStore';
import {
  PROPULSION_SYSTEMS,
  PropulsionType,
  calculateTravelTime,
  formatDuration,
  // CONSTANTS,
} from '@/app/data/propulsion';
import { calculateInterceptCourse } from '@/app/lib/orbital-mechanics';
import { SCALE_FACTORS, PLANETS, PlanetData } from '@/app/data/planets';
import Image from 'next/image';
import { useLayout } from '@/app/lib/useLayout';
import PlanetGlyph from './PlanetGlyph';
import { IconClose, IconArrowRight } from './icons';
import styles from './PropulsionSelector.module.scss';

export default function PropulsionSelector() {
  const {
    journeyStatus,
    destination,
    origin,
  // setSelectedPropulsion,
  // setJourneyStatus,
    cancelJourney,
    startJourney,
    simulationTime,
    scaleMode,
    setOrigin,
  } = useStore();

  const layout = useLayout();
  const [selected, setSelected] = useState<PropulsionType | null>(null);

  // Splash "Fly the Hail Mary" pre-selects a drive.
  const suggestedPropulsion = useStore((s) => s.suggestedPropulsion);
  const setSuggestedPropulsion = useStore((s) => s.setSuggestedPropulsion);
  useEffect(() => {
    if (journeyStatus === 'selecting-propulsion' && suggestedPropulsion) {
      // Syncing a one-shot hint from the global store into local selection state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelected(suggestedPropulsion);
      setSuggestedPropulsion(null);
      // Bring the pre-picked engine into view (it sits in the last group).
      requestAnimationFrame(() =>
        document.querySelector('[role="radio"][aria-checked="true"]')?.scrollIntoView({ block: 'center' })
      );
    }
  }, [journeyStatus, suggestedPropulsion, setSuggestedPropulsion]);
  const [expandedCards, setExpandedCards] = useState<Set<PropulsionType>>(new Set());
  const [selectedOrigin, setSelectedOrigin] = useState<PlanetData | null>(
    PLANETS.find(p => p.name === 'Earth') || origin
  );
  const [useFlipAndBurn, setUseFlipAndBurn] = useState<boolean>(true);

  // Calculate intercept courses for each propulsion system
  // This accounts for where the destination planet will be when the ship arrives
  const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;

  const interceptCourses = useMemo(() => {
  if (journeyStatus !== 'selecting-propulsion' || !destination || !origin) return new Map();
  if (!selectedOrigin) return new Map();

    const courses = new Map<PropulsionType, ReturnType<typeof calculateInterceptCourse>>();

    PROPULSION_SYSTEMS.forEach((propulsion) => {
      const course = calculateInterceptCourse(
        selectedOrigin,
        destination,
        simulationTime,
        scaleFactor.DISTANCE,
        (distanceKm) => calculateTravelTime(distanceKm, propulsion, useFlipAndBurn),
        PLANETS // Pass all planets/moons for Moon position calculation
      );
      courses.set(propulsion.id, course);
    });

    return courses;
  }, [selectedOrigin, destination, simulationTime, scaleFactor.DISTANCE, journeyStatus, origin, useFlipAndBurn]);

  // If not in propulsion selection mode or missing data, render nothing (hooks already executed above)
  if (journeyStatus !== 'selecting-propulsion' || !destination || !origin) {
    return null;
  }

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
        selectedCourse.destinationPositionAtArrival,
        useFlipAndBurn
      );
    }
  };

  const handleCancel = () => {
    cancelJourney();
  };

  // Group engines by category, keeping the data's order inside each group.
  const CATEGORIES = ['Current Technology', 'Advanced Technology', 'Theoretical'] as const;
  const rows = PROPULSION_SYSTEMS.map((propulsion) => {
    const course = interceptCourses.get(propulsion.id);
    if (!course) return null;
    return { propulsion, seconds: calculateTravelTime(course.distance, propulsion, useFlipAndBurn) };
  }).filter((r): r is { propulsion: (typeof PROPULSION_SYSTEMS)[number]; seconds: number } => !!r);

  // Log-scale "how long" bar: shortest trip ≈ 4%, longest = 100%.
  const logs = rows.map((r) => Math.log10(Math.max(r.seconds, 1)));
  const minLog = Math.min(...logs);
  const maxLog = Math.max(...logs);
  const barWidth = (sec: number) =>
    maxLog === minLog ? 100 : 4 + (96 * (Math.log10(Math.max(sec, 1)) - minLog)) / (maxLog - minLog);

  const fmtSpeed = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k km/s` : `${v} km/s`);
  const fmtAccel = (v: number) => (v >= 1 ? `${v} m/s²` : `${(v * 1000).toFixed(2)} mm/s²`);
  const selectedRow = rows.find((r) => r.propulsion.id === selected);
  const isSheet = layout === 'portrait';

  return (
    <>
      <div className={styles.overlay} onClick={handleCancel} aria-hidden />
      <div
        className={`${styles.selector} ${styles[layout]}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="propulsion-title"
        onKeyDown={(e) => e.key === 'Escape' && handleCancel()}
      >
        {isSheet && <div className={styles.dragHandle} aria-hidden><span /></div>}

        <header className={styles.header}>
          <div className={styles.headTop}>
            <div>
              <p className={styles.eyebrow}>Plan trip</p>
              <h2 id="propulsion-title">Choose an engine</h2>
            </div>
            <button type="button" className={styles.close} aria-label="Cancel trip" onClick={handleCancel}>
              <IconClose size={16} />
            </button>
          </div>

          <div className={styles.route}>
            <label className={styles.origin}>
              <span className={styles.srOnly}>Starting from</span>
              {selectedOrigin && <PlanetGlyph name={selectedOrigin.name} size={22} />}
              <select
                value={selectedOrigin?.name || ''}
                onChange={(e) => {
                  const planet = PLANETS.find((p) => p.name === e.target.value);
                  if (planet) setSelectedOrigin(planet);
                }}
              >
                {PLANETS.map((planet) => (
                  <option key={planet.name} value={planet.name}>
                    {planet.name}
                  </option>
                ))}
              </select>
            </label>
            <span className={styles.arrow} aria-hidden>
              <IconArrowRight size={18} />
            </span>
            <div className={styles.dest}>
              <PlanetGlyph name={destination.name} size={22} />
              <span>{destination.name}</span>
            </div>

            <label className={styles.flip} title="Flip halfway and burn backwards to stop at the destination. Light Speed and Warp Drive can't.">
              <input
                type="checkbox"
                role="switch"
                checked={useFlipAndBurn}
                onChange={(e) => setUseFlipAndBurn(e.target.checked)}
              />
              <span>
                Flip &amp; burn <em>{useFlipAndBurn ? 'stop at target' : 'fly past'}</em>
              </span>
            </label>
          </div>
        </header>

        <div className={styles.scrollContent}>
          {CATEGORIES.map((cat) => {
            const group = rows.filter((r) => r.propulsion.category === cat);
            if (!group.length) return null;
            return (
              <section key={cat} className={styles.group} aria-label={cat}>
                <h3 className={styles.groupTitle}>{cat}</h3>
                <ul className={styles.list} role="radiogroup" aria-label={cat}>
                  {group.map(({ propulsion, seconds }) => {
                    const isSelected = selected === propulsion.id;
                    const isExpanded = expandedCards.has(propulsion.id);
                    const featured = propulsion.id === 'astrophage-drive';
                    return (
                      <li key={propulsion.id} className={`${styles.row} ${isSelected ? styles.selected : ''}`}>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          className={styles.rowMain}
                          onClick={() => handleSelect(propulsion.id)}
                        >
                          <span className={styles.radio} aria-hidden />
                          {featured && (
                            <span className={styles.thumb} aria-hidden>
                              <Image src="/hail-mary-banner.jpg" alt="" fill sizes="56px" style={{ objectFit: 'cover' }} />
                            </span>
                          )}
                          <span className={styles.nameCol}>
                            <span className={styles.name}>
                              {propulsion.name}
                              {featured && <span className={styles.badge}>New</span>}
                            </span>
                            <span className={styles.desc}>{propulsion.description}</span>
                            <span className={styles.specs}>
                              <span>{fmtSpeed(propulsion.maxSpeed)}</span>
                              <span>{fmtAccel(propulsion.acceleration)}</span>
                            </span>
                          </span>
                          <span className={styles.timeCol}>
                            <span className={styles.time}>{formatDuration(seconds)}</span>
                            <span className={styles.bar} aria-hidden>
                              <span style={{ width: `${barWidth(seconds)}%` }} />
                            </span>
                          </span>
                        </button>
                        <button
                          type="button"
                          className={styles.more}
                          aria-expanded={isExpanded}
                          aria-label={`${isExpanded ? 'Hide' : 'Show'} details for ${propulsion.name}`}
                          onClick={() => handleToggleExpand(propulsion.id)}
                        >
                          {isExpanded ? 'Less' : 'Details'}
                        </button>

                        {isExpanded && (
                          <div className={styles.details}>
                            <p>{propulsion.technicalDetails}</p>
                            <div className={styles.detailCols}>
                              <div>
                                <h4>Real-world examples</h4>
                                <ul>{propulsion.realWorldExamples.map((x, i) => <li key={i}>{x}</li>)}</ul>
                              </div>
                              <div>
                                <h4>Advantages</h4>
                                <ul>{propulsion.advantages.slice(0, 2).map((x, i) => <li key={i}>{x}</li>)}</ul>
                              </div>
                              <div>
                                <h4>Limitations</h4>
                                <ul>{propulsion.limitations.slice(0, 2).map((x, i) => <li key={i}>{x}</li>)}</ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        <footer className={styles.footer}>
          <div className={styles.summary} aria-live="polite">
            {selectedRow ? (
              <>
                <span className={styles.summaryName}>{selectedRow.propulsion.name}</span>
                <span className={styles.summaryTime}>{formatDuration(selectedRow.seconds)}</span>
              </>
            ) : (
              <span className={styles.summaryHint}>Pick an engine to see the trip</span>
            )}
          </div>
          <button type="button" className={styles.cancelButton} onClick={handleCancel}>
            Cancel
          </button>
          <button type="button" className={styles.confirmButton} onClick={handleConfirm} disabled={!selected}>
            Launch <IconArrowRight />
          </button>
        </footer>
      </div>
    </>
  );
}
