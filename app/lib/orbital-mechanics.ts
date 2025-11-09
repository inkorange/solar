/**
 * Orbital Mechanics Utilities
 * Implements realistic elliptical orbit calculations based on Kepler's laws
 */

import { PlanetData } from '../data/planets';

/**
 * Calculate position in an elliptical orbit
 * @param time Current simulation time in seconds
 * @param planet Planet data with orbital parameters
 * @param scaleFactor Scale multiplier for visualization
 * @returns {x, z} position coordinates
 */
export function calculateEllipticalOrbitPosition(
  time: number,
  planet: PlanetData,
  scaleFactor: number
): { x: number; z: number } {
  const { distanceFromSun, orbitalPeriod, orbitalEccentricity, orbitalInclination } = planet;

  // Convert orbital period from days to seconds
  const periodSeconds = orbitalPeriod * 24 * 60 * 60;

  // Mean anomaly (angle traveled as if in circular orbit)
  const meanAnomaly = (2 * Math.PI * time) / periodSeconds;

  // Solve Kepler's equation for eccentric anomaly (E)
  // M = E - e * sin(E)
  // Using iterative Newton's method
  let eccentricAnomaly = meanAnomaly;
  for (let i = 0; i < 5; i++) {
    eccentricAnomaly =
      meanAnomaly +
      orbitalEccentricity * Math.sin(eccentricAnomaly);
  }

  // True anomaly (actual angle from perihelion)
  const trueAnomaly = 2 * Math.atan2(
    Math.sqrt(1 + orbitalEccentricity) * Math.sin(eccentricAnomaly / 2),
    Math.sqrt(1 - orbitalEccentricity) * Math.cos(eccentricAnomaly / 2)
  );

  // Distance from sun (varies with position in ellipse)
  const semiMajorAxis = distanceFromSun; // AU
  const distance =
    (semiMajorAxis * (1 - orbitalEccentricity * orbitalEccentricity)) /
    (1 + orbitalEccentricity * Math.cos(trueAnomaly));

  // Position in orbital plane
  const scaledDistance = distance * scaleFactor;

  // Convert to 3D coordinates (in the ecliptic plane)
  // For visual clarity, we're keeping orbits in the same plane
  // (inclination effects are subtle and can make visualization confusing)
  const x = scaledDistance * Math.cos(trueAnomaly);
  const z = scaledDistance * Math.sin(trueAnomaly);

  return { x, z };
}

/**
 * Generate elliptical orbit path points
 * @param planet Planet data
 * @param scaleFactor Scale multiplier
 * @param segments Number of points in the orbit path
 * @returns Array of {x, y, z} positions
 */
export function generateEllipticalOrbitPath(
  planet: PlanetData,
  scaleFactor: number,
  segments: number = 128
): Array<{ x: number; y: number; z: number }> {
  const points: Array<{ x: number; y: number; z: number }> = [];
  const periodSeconds = planet.orbitalPeriod * 24 * 60 * 60;

  for (let i = 0; i <= segments; i++) {
    const time = (i / segments) * periodSeconds;
    const pos = calculateEllipticalOrbitPosition(time, planet, scaleFactor);
    points.push({ x: pos.x, y: 0, z: pos.z });
  }

  return points;
}

/**
 * Calculate distance between two planets at current time
 * @param planet1 First planet
 * @param planet2 Second planet
 * @param time Current simulation time
 * @param scaleFactor Scale multiplier
 * @returns Distance in kilometers
 */
export function calculateDistanceBetweenPlanets(
  planet1: PlanetData,
  planet2: PlanetData,
  time: number,
  scaleFactor: number
): number {
  const pos1 = calculateEllipticalOrbitPosition(time, planet1, scaleFactor);
  const pos2 = calculateEllipticalOrbitPosition(time, planet2, scaleFactor);

  const dx = pos2.x - pos1.x;
  const dz = pos2.z - pos1.z;

  const distanceInScaledUnits = Math.sqrt(dx * dx + dz * dz);

  // Convert back to AU, then to km
  const distanceInAU = distanceInScaledUnits / scaleFactor;
  const AU_TO_KM = 149597870.7;

  return distanceInAU * AU_TO_KM;
}
