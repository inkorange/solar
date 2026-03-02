/**
 * Orbital Mechanics Utilities
 * Implements realistic elliptical orbit calculations based on Kepler's laws
 */

import { PlanetData, SCALE_FACTORS } from '../data/planets';
import { MoonData, MOONS } from '../data/moons';

/**
 * J2000.0 epoch Julian Date (January 1, 2000, noon TT)
 */
const J2000_EPOCH = 2451545.0;

/**
 * Reference date for planetary positions (updated daily)
 * This ensures planetary positions remain consistent throughout the simulation
 * but updates to reflect real-world positions each day
 */
let REFERENCE_DATE = new Date();
let LAST_UPDATE_DAY = Math.floor(REFERENCE_DATE.getTime() / (1000 * 60 * 60 * 24));

/**
 * Update reference date if a new day has started
 * This allows positions to update daily without recalculating every frame
 */
function updateReferenceDateIfNeeded(): void {
  const now = new Date();
  const currentDay = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));

  if (currentDay > LAST_UPDATE_DAY) {
    REFERENCE_DATE = now;
    LAST_UPDATE_DAY = currentDay;
  }
}

/**
 * Convert a JavaScript Date to Julian Date
 * @param date JavaScript Date object
 * @returns Julian Date
 */
function dateToJulianDate(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // JavaScript months are 0-indexed
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds();

  // Calculate fractional day
  const fractionalDay = day + (hour + minute / 60 + second / 3600) / 24;

  // Adjust month and year for January/February
  let a = year;
  let m = month;
  if (month <= 2) {
    a = year - 1;
    m = month + 12;
  }

  // Calculate Julian Date
  const A = Math.floor(a / 100);
  const B = 2 - A + Math.floor(A / 4);

  const JD = Math.floor(365.25 * (a + 4716)) +
             Math.floor(30.6001 * (m + 1)) +
             fractionalDay + B - 1524.5;

  return JD;
}

/**
 * Calculate current mean longitude for a planet
 * Based on NASA JPL Keplerian elements
 * @param planet Planet data with J2000.0 orbital elements
 * @param date Optional date (defaults to current date)
 * @returns Mean longitude in degrees
 */
export function calculateCurrentMeanLongitude(
  planet: PlanetData,
  date: Date = new Date()
): number {
  // Calculate Julian Date for the given date
  const JD = dateToJulianDate(date);

  // Calculate centuries past J2000.0 epoch
  const T = (JD - J2000_EPOCH) / 36525;

  // Calculate mean longitude: L = L₀ + L' * T
  let meanLongitude = planet.meanLongitudeJ2000 + (planet.meanLongitudeRate * T);

  // Normalize to 0-360 degrees
  meanLongitude = meanLongitude % 360;
  if (meanLongitude < 0) {
    meanLongitude += 360;
  }

  return meanLongitude;
}

/**
 * Calculate position in an elliptical orbit
 * @param time Current simulation time in seconds
 * @param planet Planet data with orbital parameters
 * @param scaleFactor Scale multiplier for visualization
 * @returns {x, y, z} position coordinates
 */
export function calculateEllipticalOrbitPosition(
  time: number,
  planet: PlanetData,
  scaleFactor: number
): { x: number; y: number; z: number } {
  const { distanceFromSun, orbitalPeriod, orbitalEccentricity, orbitalInclination } = planet;

  // Convert orbital period from days to seconds
  const periodSeconds = orbitalPeriod * 24 * 60 * 60;

  // Update reference date if a new day has started
  updateReferenceDateIfNeeded();

  // Calculate real-world position (mean longitude) based on reference date
  // This ensures planets start at their actual positions when simulation time = 0
  const currentMeanLongitude = calculateCurrentMeanLongitude(planet, REFERENCE_DATE);
  const initialPhaseRadians = (currentMeanLongitude * Math.PI) / 180;

  // Mean anomaly (angle traveled as if in circular orbit)
  // Start from current real-world position, then add simulation time advancement
  const meanAnomaly = (2 * Math.PI * time) / periodSeconds + initialPhaseRadians;

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

  // Calculate position in the orbital plane (2D)
  const xOrbital = scaledDistance * Math.cos(trueAnomaly);
  const yOrbital = scaledDistance * Math.sin(trueAnomaly);

  // Apply orbital inclination to create 3D position
  // Convert inclination from degrees to radians
  const inclinationRadians = (orbitalInclination * Math.PI) / 180;

  // Rotate around the x-axis by the inclination angle
  // This tilts the orbital plane relative to the ecliptic
  const x = xOrbital;
  const y = yOrbital * Math.sin(inclinationRadians);
  const z = yOrbital * Math.cos(inclinationRadians);

  return { x, y, z };
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
    points.push({ x: pos.x, y: pos.y, z: pos.z });
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
  const dy = pos2.y - pos1.y;
  const dz = pos2.z - pos1.z;

  const distanceInScaledUnits = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Convert back to AU, then to km
  const distanceInAU = distanceInScaledUnits / scaleFactor;
  const AU_TO_KM = 149597870.7;

  return distanceInAU * AU_TO_KM;
}

/**
 * Calculate the optimal intercept for a journey between two planets
 * Takes into account that the destination planet will move during the journey
 * Distance accounts for planet radii - journey starts at surface of origin, ends at surface of destination
 * @param origin Origin planet
 * @param destination Destination planet
 * @param currentTime Current simulation time in seconds
 * @param scaleFactor Scale multiplier for visualization
 * @param travelTimeCalculator Function that calculates travel time given distance in km
 * @returns Object with distance, arrivalTime, and destination position at arrival
 */
export function calculateInterceptCourse(
  origin: PlanetData,
  destination: PlanetData,
  currentTime: number,
  scaleFactor: number,
  travelTimeCalculator: (distanceKm: number) => number,
  allBodies?: PlanetData[]
): {
  distance: number;
  arrivalTime: number;
  destinationPositionAtArrival: { x: number; y: number; z: number };
  originPositionAtDeparture: { x: number; y: number; z: number };
} {
  const AU_TO_KM = 149597870.7;

  // Get origin position at current time (departure time)
  // Use universal calculator to handle both planets and moons
  const originPos = calculateCelestialBodyPosition(currentTime, origin, scaleFactor, allBodies);

  // Calculate planet radii in km
  const originRadiusKm = origin.diameter / 2; // diameter is in km
  const destinationRadiusKm = destination.diameter / 2;

  // Iteratively calculate where the destination will be when we arrive
  let arrivalTime = currentTime;
  let distance = 0;
  let destinationPos = { x: 0, y: 0, z: 0 };

  // Iterate to convergence (usually converges in 3-5 iterations)
  for (let iteration = 0; iteration < 10; iteration++) {
    // Calculate where destination will be at the estimated arrival time
    // Use universal calculator to handle both planets and moons
    destinationPos = calculateCelestialBodyPosition(arrivalTime, destination, scaleFactor, allBodies);

    // Calculate center-to-center distance from origin (at departure) to destination (at arrival)
    const dx = destinationPos.x - originPos.x;
    const dy = destinationPos.y - originPos.y;
    const dz = destinationPos.z - originPos.z;
    const distanceInScaledUnits = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // Convert to km (center-to-center)
    const distanceInAU = distanceInScaledUnits / scaleFactor;
    const centerToCenterDistanceKm = distanceInAU * AU_TO_KM;

    // Subtract the radii of both planets to get surface-to-surface distance
    // Journey starts at the surface of origin and ends at surface of destination
    const newDistance = centerToCenterDistanceKm - originRadiusKm - destinationRadiusKm;

    // Calculate travel time for this distance
    const travelTime = travelTimeCalculator(newDistance);
    const newArrivalTime = currentTime + travelTime;

    // Check for convergence (distance changed by less than 0.1%)
    if (iteration > 0 && Math.abs(newDistance - distance) / distance < 0.001) {
      distance = newDistance;
      arrivalTime = newArrivalTime;
      break;
    }

    distance = newDistance;
    arrivalTime = newArrivalTime;
  }

  return {
    distance,
    arrivalTime,
    destinationPositionAtArrival: destinationPos,
    originPositionAtDeparture: originPos,
  };
}

/**
 * Calculate Moon's position relative to Earth
 * @param time Current simulation time in seconds
 * @param moonData Moon data with orbital parameters
 * @param moonScaleFactor Scale multiplier for moon distances (MOON_DISTANCE from SCALE_FACTORS)
 * @returns {x, y, z} position relative to Earth
 */
export function calculateMoonPositionRelativeToEarth(
  time: number,
  moonData: MoonData,
  moonScaleFactor: number
): { x: number; y: number; z: number } {
  const { distanceFromPlanet, orbitalPeriod, orbitalEccentricity, orbitalInclination } = moonData;

  // Convert orbital period from days to seconds
  const periodSeconds = orbitalPeriod * 24 * 60 * 60;

  // Mean anomaly (angle traveled as if in circular orbit)
  const meanAnomaly = (2 * Math.PI * time) / periodSeconds;

  // Solve Kepler's equation for eccentric anomaly
  let eccentricAnomaly = meanAnomaly;
  for (let i = 0; i < 5; i++) {
    eccentricAnomaly =
      meanAnomaly +
      orbitalEccentricity * Math.sin(eccentricAnomaly);
  }

  // True anomaly (actual angle from periapsis)
  const trueAnomaly = 2 * Math.atan2(
    Math.sqrt(1 + orbitalEccentricity) * Math.sin(eccentricAnomaly / 2),
    Math.sqrt(1 - orbitalEccentricity) * Math.cos(eccentricAnomaly / 2)
  );

  // Distance from Earth (varies with position in ellipse)
  const semiMajorAxis = distanceFromPlanet; // km
  const distance =
    (semiMajorAxis * (1 - orbitalEccentricity * orbitalEccentricity)) /
    (1 + orbitalEccentricity * Math.cos(trueAnomaly));

  // Convert km to AU, then scale for visualization
  // Moon distances need special scaling to be visible in the scene
  const AU_TO_KM = 149597870.7;
  const distanceAU = distance / AU_TO_KM;
  const scaledDistance = distanceAU * moonScaleFactor;

  // Position in orbital plane (2D)
  const xOrbital = scaledDistance * Math.cos(trueAnomaly);
  const yOrbital = scaledDistance * Math.sin(trueAnomaly);

  // Apply orbital inclination to create 3D position
  const inclinationRadians = (orbitalInclination * Math.PI) / 180;

  const x = xOrbital;
  const y = yOrbital * Math.sin(inclinationRadians);
  const z = yOrbital * Math.cos(inclinationRadians);

  return { x, y, z };
}

/**
 * Calculate Moon's heliocentric position (position relative to Sun)
 * This is Earth's position + Moon's offset from Earth
 * @param time Current simulation time in seconds
 * @param earthData Earth's planet data
 * @param moonData Moon's orbital data
 * @param planetScaleFactor Scale multiplier for planet distances (DISTANCE from SCALE_FACTORS)
 * @param moonScaleFactor Scale multiplier for moon distances (MOON_DISTANCE from SCALE_FACTORS)
 * @returns {x, y, z} heliocentric position
 */
export function calculateMoonHeliocentricPosition(
  time: number,
  earthData: PlanetData,
  moonData: MoonData,
  planetScaleFactor: number,
  moonScaleFactor: number
): { x: number; y: number; z: number } {
  // Get Earth's heliocentric position using planet scale factor
  const earthPos = calculateEllipticalOrbitPosition(time, earthData, planetScaleFactor);

  // Get Moon's position relative to Earth using moon scale factor
  const moonRelativePos = calculateMoonPositionRelativeToEarth(time, moonData, moonScaleFactor);

  // Combine: Moon's heliocentric position = Earth's position + Moon's offset
  return {
    x: earthPos.x + moonRelativePos.x,
    y: earthPos.y + moonRelativePos.y,
    z: earthPos.z + moonRelativePos.z,
  };
}

/**
 * Universal position calculator that handles both planets and moons
 * @param time Current simulation time in seconds
 * @param body Planet or moon data
 * @param scaleFactor Scale multiplier for planet distances (DISTANCE from SCALE_FACTORS)
 * @param allBodies Optional array of all celestial bodies (needed to find parent planet for moons)
 * @param scaleMode Optional scale mode ('visual' or 'realistic') for determining moon scale factor
 * @returns {x, y, z} heliocentric position
 */
export function calculateCelestialBodyPosition(
  time: number,
  body: PlanetData,
  scaleFactor: number,
  allBodies?: PlanetData[],
  scaleMode: 'visual' | 'realistic' = 'visual'
): { x: number; y: number; z: number } {
  // If this is the Moon (or any moon), calculate its heliocentric position
  if (body.isMoon && body.parentPlanet && body.distanceFromPlanet && body.orbitalPeriod) {
    // Find the parent planet
    const parentPlanet = allBodies?.find(b => b.name === body.parentPlanet && !b.isMoon);

    if (parentPlanet) {
      // Get the appropriate moon scale factor based on scale mode
      const moonScaleFactor = scaleMode === 'visual'
        ? SCALE_FACTORS.VISUAL.MOON_DISTANCE
        : SCALE_FACTORS.REALISTIC.MOON_DISTANCE;

      // Use the body directly as it has all the moon properties we need
      return calculateMoonHeliocentricPosition(
        time,
        parentPlanet,
        body as any, // The body has moon properties (distanceFromPlanet, etc.)
        scaleFactor,
        moonScaleFactor
      );
    }

    // Fallback to regular calculation if parent not found
    return calculateEllipticalOrbitPosition(time, body, scaleFactor);
  }

  // Regular planet calculation
  return calculateEllipticalOrbitPosition(time, body, scaleFactor);
}

/**
 * Generate orbit path for a moon around its parent planet
 * @param moonData Moon data with orbital parameters
 * @param parentPlanet Parent planet data
 * @param time Current simulation time
 * @param planetScaleFactor Scale factor for planet distances
 * @param moonScaleFactor Scale factor for moon distances
 * @param segments Number of segments in the orbit path
 * @param allBodies All celestial bodies for position calculations
 * @returns Array of {x, y, z} points forming the moon's orbit
 */
export function generateMoonOrbitPath(
  moonData: PlanetData,
  parentPlanet: PlanetData,
  time: number,
  planetScaleFactor: number,
  moonScaleFactor: number,
  allBodies: PlanetData[],
  segments: number = 128
): Array<{ x: number; y: number; z: number }> {
  const points: Array<{ x: number; y: number; z: number }> = [];

  if (!moonData.distanceFromPlanet || !moonData.orbitalPeriod) {
    return points;
  }

  // Get parent planet's current position using the SAME method as Moon position calculation
  // IMPORTANT: Use calculateEllipticalOrbitPosition directly to match calculateMoonHeliocentricPosition
  const parentPos = calculateEllipticalOrbitPosition(
    time,
    parentPlanet,
    planetScaleFactor
  );

  // Moon's orbital parameters
  const distanceFromPlanet = moonData.distanceFromPlanet; // km
  const orbitalInclination = moonData.orbitalInclination || 0; // degrees
  const orbitalEccentricity = moonData.orbitalEccentricity || 0;

  const AU_TO_KM = 149597870.7;

  // Generate points around the orbit
  // IMPORTANT: Use Kepler's laws to calculate true anomaly, just like the actual Moon position
  for (let i = 0; i <= segments; i++) {
    // Mean anomaly: uniform angle distribution around orbit
    const meanAnomaly = (i / segments) * Math.PI * 2;

    // Solve Kepler's equation for eccentric anomaly
    let eccentricAnomaly = meanAnomaly;
    for (let j = 0; j < 5; j++) {
      eccentricAnomaly =
        meanAnomaly +
        orbitalEccentricity * Math.sin(eccentricAnomaly);
    }

    // True anomaly (actual angle from periapsis)
    // This is what the Moon's position calculation uses!
    const trueAnomaly = 2 * Math.atan2(
      Math.sqrt(1 + orbitalEccentricity) * Math.sin(eccentricAnomaly / 2),
      Math.sqrt(1 - orbitalEccentricity) * Math.cos(eccentricAnomaly / 2)
    );

    // Distance from Earth (varies with position in ellipse)
    // IMPORTANT: Calculate elliptical distance in km FIRST, then convert to scene units
    // This matches the calculation order in calculateMoonPositionRelativeToEarth
    const semiMajorAxis = distanceFromPlanet; // km
    const distanceKm =
      (semiMajorAxis * (1 - orbitalEccentricity * orbitalEccentricity)) /
      (1 + orbitalEccentricity * Math.cos(trueAnomaly));

    // Convert km to AU, then scale for visualization
    const distanceAU = distanceKm / AU_TO_KM;
    const scaledDistance = distanceAU * moonScaleFactor;

    const xOrbital = scaledDistance * Math.cos(trueAnomaly);
    const yOrbital = scaledDistance * Math.sin(trueAnomaly);

    // Apply orbital inclination
    const inclinationRadians = (orbitalInclination * Math.PI) / 180;
    const x = xOrbital;
    const y = yOrbital * Math.sin(inclinationRadians);
    const z = yOrbital * Math.cos(inclinationRadians);

    // Add parent planet's position to get heliocentric coordinates
    points.push({
      x: parentPos.x + x,
      y: parentPos.y + y,
      z: parentPos.z + z,
    });
  }

  return points;
}
