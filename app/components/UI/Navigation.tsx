'use client';

import { useState } from 'react';
import { useStore } from '@/app/store/useStore';
import { PLANETS, SCALE_FACTORS } from '@/app/data/planets';
import { calculateEllipticalOrbitPosition } from '@/app/lib/orbital-mechanics';
import styles from './Navigation.module.scss';

export default function Navigation() {
  const {
    selectedPlanet,
    setSelectedPlanet,
    showNavigation,
    setCameraTarget,
    simulationTime,
    scaleMode,
    setCameraMode,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');

  if (!showNavigation) return null;

  // Filter planets based on search term
  const filteredPlanets = searchTerm
    ? PLANETS.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : PLANETS;

  const terrestrialPlanets = filteredPlanets.filter(p => p.type === 'Terrestrial');
  const gasGiants = filteredPlanets.filter(p => p.type.includes('Giant'));

  const handlePlanetClick = (planet: typeof PLANETS[0]) => {
    setSelectedPlanet(planet);

    // Calculate planet's current position
    const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
    const position = calculateEllipticalOrbitPosition(
      simulationTime,
      planet,
      scaleFactor.DISTANCE
    );

    // Calculate camera distance based on planet size
    // Planet size in scene units
    const planetRadius = (planet.diameter / 12742) * scaleFactor.SIZE * 5;
    const planetDiameter = planetRadius * 2;

    // Camera FOV is 60 degrees (from SolarSystem.tsx)
    const fov = 60;
    const fovRadians = (fov * Math.PI) / 180;

    // Adjust camera distance based on planet size
    // Keep larger planets (Jupiter, Saturn) at comfortable distance (~30% fill)
    // Zoom MUCH closer for smaller planets (Earth, Mars, Mercury)
    const jupiterDiameter = (142984 / 12742) * scaleFactor.SIZE * 5 * 2; // Jupiter reference
    const sizeRatio = Math.min(planetDiameter / jupiterDiameter, 1);

    // Very aggressive exponential scaling for small planets
    // Jupiter: multiplier = 1.0 (30% fill)
    // Small planets: multiplier = 30-40 (much closer!)
    const distanceMultiplier = 1 + (39 * Math.pow(1 - sizeRatio, 1.5));

    // Base distance for Jupiter at 30% viewport fill (comfortable viewing)
    const baseDistance = planetDiameter / (0.3 * 2 * Math.tan(fovRadians / 2));

    // Apply inverse multiplier (higher multiplier = closer camera)
    let cameraDistance = baseDistance / distanceMultiplier;

    // Safety constraint: ensure camera is always at least 2x the visual size away
    // Account for rings if present (especially Saturn)
    const visualRadius = planet.hasRings && planet.ringData
      ? planetRadius * planet.ringData.outerRadiusRatio
      : planetRadius;
    const minSafeDistance = visualRadius * 2;
    cameraDistance = Math.max(cameraDistance, minSafeDistance);

    // Position camera at an angle for better viewing
    const angle = Math.PI / 4; // 45 degrees
    const cameraPos: [number, number, number] = [
      position.x + cameraDistance * Math.cos(angle),
      cameraDistance * 0.3,
      position.z + cameraDistance * Math.sin(angle),
    ];

    setCameraTarget(cameraPos, planet.name);
    setCameraMode('planet-focus'); // Switch to planet focus mode
  };

  return (
    <div className={styles.navigation}>
      <h2>Solar System</h2>

      {/* Search/Filter */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search planets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        {searchTerm && (
          <button
            className={styles.clearButton}
            onClick={() => setSearchTerm('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {terrestrialPlanets.length > 0 && (
        <>
          <div className={styles.groupTitle}>Terrestrial Planets</div>
      <ul className={styles.planetList}>
        {terrestrialPlanets.map((planet) => (
          <li key={planet.name}>
            <button
              className={`${styles.planetButton} ${selectedPlanet?.name === planet.name ? styles.selected : ''}`}
              onClick={() => handlePlanetClick(planet)}
            >
              <div>
                <div className={styles.planetName}>{planet.name}</div>
                <div className={styles.planetType}>{planet.type}</div>
              </div>
              <div style={{ fontSize: '18px' }}>
                {planet.name === 'Mercury' && '☿'}
                {planet.name === 'Venus' && '♀'}
                {planet.name === 'Earth' && '🌍'}
                {planet.name === 'Mars' && '♂'}
              </div>
            </button>
          </li>
        ))}
      </ul>
        </>
      )}

      {gasGiants.length > 0 && (
        <>
          <div className={styles.groupTitle}>Gas & Ice Giants</div>
      <ul className={styles.planetList}>
        {gasGiants.map((planet) => (
          <li key={planet.name}>
            <button
              className={`${styles.planetButton} ${selectedPlanet?.name === planet.name ? styles.selected : ''}`}
              onClick={() => handlePlanetClick(planet)}
            >
              <div>
                <div className={styles.planetName}>{planet.name}</div>
                <div className={styles.planetType}>{planet.type}</div>
              </div>
              <div style={{ fontSize: '18px' }}>
                {planet.name === 'Jupiter' && '♃'}
                {planet.name === 'Saturn' && '♄'}
                {planet.name === 'Uranus' && '♅'}
                {planet.name === 'Neptune' && '♆'}
              </div>
            </button>
          </li>
        ))}
      </ul>
        </>
      )}

      {filteredPlanets.length === 0 && (
        <div className={styles.noResults}>No planets found</div>
      )}
    </div>
  );
}
