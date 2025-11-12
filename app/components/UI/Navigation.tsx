'use client';

import { useState } from 'react';
import { useStore } from '@/app/store/useStore';
import { PLANETS, DWARF_PLANETS, SCALE_FACTORS } from '@/app/data/planets';
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

  // Combine all celestial bodies for filtering
  const allBodies = [...PLANETS, ...DWARF_PLANETS];

  // Filter celestial bodies based on search term
  const filteredBodies = searchTerm
    ? allBodies.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : allBodies;

  const terrestrialPlanets = filteredBodies.filter(p => p.type === 'Terrestrial');
  const gasGiants = filteredBodies.filter(p => p.type.includes('Giant'));
  const dwarfPlanets = filteredBodies.filter(p => p.type === 'Dwarf Planet');

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
    // Calculate camera distance with better balance for large and small planets
    // Larger planets closer, smaller planets much farther away
    const distanceMultiplier = 1 + (20 * Math.pow(1 - sizeRatio, 1.2));

    // Base distance - larger planets fill more of viewport, smaller planets fill less
    // Use adaptive viewport fill based on size
    const viewportFill = 0.15 + (0.1 * sizeRatio); // 0.15 for small, 0.25 for Jupiter
    const baseDistance = planetDiameter / (viewportFill * 2 * Math.tan(fovRadians / 2));

    // Apply inverse multiplier (higher multiplier = closer camera)
    let cameraDistance = baseDistance / distanceMultiplier;

    // Safety constraint: adaptive minimum distance based on planet size
    // Account for rings if present (especially Saturn)
    const visualRadius = planet.hasRings && planet.ringData
      ? planetRadius * planet.ringData.outerRadiusRatio
      : planetRadius;
    // Smaller multiplier for larger planets, larger for small planets
    const safetyMultiplier = 3 + (3 * (1 - sizeRatio)); // 3x for large, 6x for small
    const minSafeDistance = visualRadius * safetyMultiplier;
    cameraDistance = Math.max(cameraDistance, minSafeDistance);

    // Position camera at an angle for better viewing
    // Camera should be offset from the planet's actual 3D position
    const angle = Math.PI / 4; // 45 degrees horizontal
    const cameraPos: [number, number, number] = [
      position.x + cameraDistance * Math.cos(angle),
      position.y + cameraDistance * 0.3, // Slightly above the planet's orbital plane
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

      {dwarfPlanets.length > 0 && (
        <>
          <div className={styles.groupTitle}>Dwarf Planets</div>
          <ul className={styles.planetList}>
            {dwarfPlanets.map((planet) => (
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
                    {planet.name === 'Pluto' && '♇'}
                    {planet.name === 'Eris' && '⯰'}
                    {planet.name === 'Haumea' && '🥚'}
                    {planet.name === 'Makemake' && '🗿'}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {filteredBodies.length === 0 && (
        <div className={styles.noResults}>No celestial bodies found</div>
      )}
    </div>
  );
}
