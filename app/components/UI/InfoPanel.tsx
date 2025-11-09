'use client';

import { useStore } from '@/app/store/useStore';
import { PLANETS } from '@/app/data/planets';
import styles from './InfoPanel.module.scss';

export default function InfoPanel() {
  const {
    selectedPlanet,
    setSelectedPlanet,
    showInfoPanel,
    journeyStatus,
    setDestination,
    setOrigin,
    setJourneyStatus,
    spaceshipPosition,
  } = useStore();

  // Find the planet closest to spaceship as origin
  const findNearestPlanet = () => {
    // For simplicity, assume Earth as starting point for Phase 2
    return PLANETS.find(p => p.name === 'Earth') || PLANETS[2];
  };

  const handleTravelTo = () => {
    if (!selectedPlanet) return;

    const origin = findNearestPlanet();
    setOrigin(origin);
    setDestination(selectedPlanet);
    setJourneyStatus('selecting-propulsion');
    setSelectedPlanet(null); // Close info panel
  };

  if (!showInfoPanel || !selectedPlanet) return null;

  return (
    <div className={styles.infoPanel}>
      <div className={styles.header}>
        <h2>{selectedPlanet.name}</h2>
        <button
          className={styles.closeButton}
          onClick={() => setSelectedPlanet(null)}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className={styles.type}>{selectedPlanet.type}</div>

      <div className={styles.section}>
        <h3>Physical Characteristics</h3>
        <div className={styles.dataGrid}>
          <div className={styles.dataItem}>
            <div className={styles.label}>Diameter</div>
            <div className={styles.value}>{selectedPlanet.diameter.toLocaleString()} km</div>
          </div>
          <div className={styles.dataItem}>
            <div className={styles.label}>Mass (Earth = 1)</div>
            <div className={styles.value}>{selectedPlanet.mass}</div>
          </div>
          <div className={styles.dataItem}>
            <div className={styles.label}>Gravity</div>
            <div className={styles.value}>{selectedPlanet.gravity} m/s²</div>
          </div>
          <div className={styles.dataItem}>
            <div className={styles.label}>Moons</div>
            <div className={styles.value}>{selectedPlanet.moons}</div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Orbital Data</h3>
        <div className={styles.dataGrid}>
          <div className={styles.dataItem}>
            <div className={styles.label}>Distance from Sun</div>
            <div className={styles.value}>{selectedPlanet.distanceFromSun} AU</div>
          </div>
          <div className={styles.dataItem}>
            <div className={styles.label}>Orbital Period</div>
            <div className={styles.value}>{selectedPlanet.orbitalPeriod.toLocaleString()} days</div>
          </div>
          <div className={styles.dataItem}>
            <div className={styles.label}>Orbital Speed</div>
            <div className={styles.value}>{selectedPlanet.orbitalSpeed} km/s</div>
          </div>
          <div className={styles.dataItem}>
            <div className={styles.label}>Rotation Period</div>
            <div className={styles.value}>{Math.abs(selectedPlanet.rotationPeriod)} days</div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Atmosphere</h3>
        <div className={styles.atmosphereList}>
          {selectedPlanet.atmosphere.join(', ')}
        </div>
      </div>

      <div className={styles.section}>
        <h3>Interesting Facts</h3>
        <ul className={styles.factsList}>
          {selectedPlanet.facts.map((fact, index) => (
            <li key={index}>{fact}</li>
          ))}
        </ul>
      </div>

      {journeyStatus === 'idle' && (
        <div className={styles.travelSection}>
          <button className={styles.travelButton} onClick={handleTravelTo}>
            🚀 Travel to {selectedPlanet.name}
          </button>
        </div>
      )}
    </div>
  );
}
