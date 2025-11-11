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

  // Determine if this is a moon (has parentPlanet property)
  const isMoon = 'parentPlanet' in selectedPlanet;
  const isPlanetOrAsteroid = 'distanceFromSun' in selectedPlanet;

  return (
    <div className={styles.infoPanel}>
      <div className={styles.scrollContent}>
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

        <div className={styles.type}>
          {isMoon ? `Moon of ${(selectedPlanet as any).parentPlanet}` : selectedPlanet.type}
        </div>

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
            {selectedPlanet.moons !== undefined && (
              <div className={styles.dataItem}>
                <div className={styles.label}>Moons</div>
                <div className={styles.value}>{selectedPlanet.moons}</div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h3>Orbital Data</h3>
          <div className={styles.dataGrid}>
            {isPlanetOrAsteroid && (
              <div className={styles.dataItem}>
                <div className={styles.label}>Distance from Sun</div>
                <div className={styles.value}>{selectedPlanet.distanceFromSun} AU</div>
              </div>
            )}
            {isMoon && (
              <div className={styles.dataItem}>
                <div className={styles.label}>Distance from {(selectedPlanet as any).parentPlanet}</div>
                <div className={styles.value}>{((selectedPlanet as any).distanceFromPlanet).toLocaleString()} km</div>
              </div>
            )}
            <div className={styles.dataItem}>
              <div className={styles.label}>Orbital Period</div>
              <div className={styles.value}>
                {isMoon
                  ? `${selectedPlanet.orbitalPeriod.toFixed(2)} days`
                  : selectedPlanet.type?.includes('Asteroid') || selectedPlanet.type?.includes('Dwarf')
                  ? `${selectedPlanet.orbitalPeriod.toFixed(2)} years`
                  : `${selectedPlanet.orbitalPeriod.toLocaleString()} days`}
              </div>
            </div>
            <div className={styles.dataItem}>
              <div className={styles.label}>Orbital Speed</div>
              <div className={styles.value}>{selectedPlanet.orbitalSpeed} km/s</div>
            </div>
            {isPlanetOrAsteroid && (
              <div className={styles.dataItem}>
                <div className={styles.label}>Rotation Period</div>
                <div className={styles.value}>
                  {selectedPlanet.type?.includes('Asteroid') || selectedPlanet.type?.includes('Dwarf')
                    ? `${Math.abs(selectedPlanet.rotationPeriod).toFixed(2)} hours`
                  : `${Math.abs(selectedPlanet.rotationPeriod)} days`}
              </div>
            </div>
            )}
            {isMoon && (selectedPlanet as any).tidally_locked && (
              <div className={styles.dataItem}>
                <div className={styles.label}>Rotation</div>
                <div className={styles.value}>Tidally Locked</div>
              </div>
            )}
          </div>
        </div>

        {selectedPlanet.atmosphere && selectedPlanet.atmosphere.length > 0 && (
          <div className={styles.section}>
            <h3>Atmosphere</h3>
            <div className={styles.atmosphereList}>
              {selectedPlanet.atmosphere.join(', ')}
            </div>
          </div>
        )}

        <div className={styles.section}>
          <h3>Interesting Facts</h3>
          <ul className={styles.factsList}>
            {selectedPlanet.facts.map((fact, index) => (
              <li key={index}>{fact}</li>
            ))}
          </ul>
        </div>
      </div>

      {journeyStatus === 'idle' && !isMoon && (
        <div className={styles.stickyFooter}>
          <button className={styles.travelButton} onClick={handleTravelTo}>
            🚀 Travel to {selectedPlanet.name}
          </button>
        </div>
      )}
    </div>
  );
}
