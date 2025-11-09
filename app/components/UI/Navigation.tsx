'use client';

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
  } = useStore();

  if (!showNavigation) return null;

  const terrestrialPlanets = PLANETS.filter(p => p.type === 'Terrestrial');
  const gasGiants = PLANETS.filter(p => p.type.includes('Giant'));

  const handlePlanetClick = (planet: typeof PLANETS[0]) => {
    setSelectedPlanet(planet);

    // Calculate planet's current position
    const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
    const position = calculateEllipticalOrbitPosition(
      simulationTime,
      planet,
      scaleFactor.DISTANCE
    );

    // Calculate camera distance to fill 50% of viewport
    // Planet size in scene units
    const planetRadius = (planet.diameter / 12742) * scaleFactor.SIZE * 5;
    const planetDiameter = planetRadius * 2;

    // Camera FOV is 60 degrees (from SolarSystem.tsx)
    const fov = 60;
    const fovRadians = (fov * Math.PI) / 180;

    // Distance needed for planet to fill 50% of viewport height
    // visible height at distance d = 2 * tan(fov/2) * d
    // For 50% fill: planetDiameter = 0.5 * visibleHeight
    // So: distance = planetDiameter / tan(fov/2)
    const cameraDistance = planetDiameter / Math.tan(fovRadians / 2);

    // Position camera at an angle for better viewing
    const angle = Math.PI / 4; // 45 degrees
    const cameraPos: [number, number, number] = [
      position.x + cameraDistance * Math.cos(angle),
      cameraDistance * 0.3,
      position.z + cameraDistance * Math.sin(angle),
    ];

    setCameraTarget(cameraPos, planet.name);
  };

  return (
    <div className={styles.navigation}>
      <h2>Solar System</h2>

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
    </div>
  );
}
