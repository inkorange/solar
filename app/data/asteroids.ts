/**
 * Asteroid belt bodies data based on NASA resources
 * Distances in AU from the Sun
 * Sizes in km (diameter)
 * Orbital periods in Earth years
 */

export interface AsteroidData {
  name: string;
  type: string;
  color: string; // Fallback color
  texture?: string; // Path to texture file

  // Physical characteristics
  diameter: number; // km
  mass: number; // relative to Earth
  gravity: number; // m/s²

  // Orbital data
  distanceFromSun: number; // AU (semi-major axis)
  orbitalPeriod: number; // Earth years
  orbitalSpeed: number; // km/s
  orbitalEccentricity: number;
  orbitalInclination: number; // degrees

  // J2000.0 orbital elements (for calculating real-time positions)
  meanLongitudeJ2000: number; // degrees - Mean longitude at J2000.0 epoch
  meanLongitudeRate: number; // degrees per century - Rate of change

  // Rotation
  rotationPeriod: number; // hours

  // Additional info
  facts: string[];
}

export const ASTEROIDS: AsteroidData[] = [
  {
    name: "Ceres",
    type: "Dwarf Planet (Asteroid Belt)",
    color: "#a8a8a8",
    diameter: 939,
    mass: 0.00015, // Earth = 1
    gravity: 0.28,
    distanceFromSun: 2.77,
    orbitalPeriod: 4.60,
    orbitalSpeed: 17.9,
    orbitalEccentricity: 0.076,
    orbitalInclination: 10.6,

    // J2000.0 orbital elements (JPL data)
    meanLongitudeJ2000: 291.43,
    meanLongitudeRate: 7796.5,

    rotationPeriod: 9.07,
    facts: [
      "Largest object in the asteroid belt",
      "Only dwarf planet in the inner solar system",
      "Contains about 25% of the asteroid belt's total mass",
      "May have a subsurface ocean beneath its icy crust",
      "Discovered in 1801 by Giuseppe Piazzi"
    ]
  },
  {
    name: "Vesta",
    type: "Asteroid (V-type)",
    color: "#b8a894",
    diameter: 525,
    mass: 0.000043,
    gravity: 0.25,
    distanceFromSun: 2.36,
    orbitalPeriod: 3.63,
    orbitalSpeed: 19.3,
    orbitalEccentricity: 0.089,
    orbitalInclination: 7.1,

    // J2000.0 orbital elements (JPL data)
    meanLongitudeJ2000: 307.54,
    meanLongitudeRate: 9895.6,

    rotationPeriod: 5.34,
    facts: [
      "Second largest asteroid in the asteroid belt",
      "Brightest asteroid visible from Earth",
      "Has a differentiated structure like planets (crust, mantle, core)",
      "Source of many meteorites found on Earth (HED meteorites)",
      "Discovered in 1807 by Heinrich Olbers"
    ]
  },
  {
    name: "Pallas",
    type: "Asteroid (B-type)",
    color: "#9090a0",
    diameter: 512,
    mass: 0.000034,
    gravity: 0.20,
    distanceFromSun: 2.77,
    orbitalPeriod: 4.62,
    orbitalSpeed: 17.7,
    orbitalEccentricity: 0.231,
    orbitalInclination: 34.8,

    // J2000.0 orbital elements (JPL data)
    meanLongitudeJ2000: 310.47,
    meanLongitudeRate: 7763.5,

    rotationPeriod: 7.81,
    facts: [
      "Third largest asteroid in the asteroid belt",
      "Highly inclined orbit (34.8°) makes missions difficult",
      "Very irregular shape",
      "Contains about 7% of the asteroid belt's total mass",
      "Discovered in 1802 by Heinrich Olbers"
    ]
  }
];

// Visual asteroid belt configuration
export const ASTEROID_BELT_CONFIG = {
  innerRadius: 2.2, // AU - inner edge of main belt (just beyond Mars at ~1.5 AU)
  outerRadius: 3.2, // AU - outer edge of main belt (before Jupiter at ~5.2 AU)
  particleCount: 10000, // Number of point particles to render (performance optimized)
  opacity: 0.6,
  color: '#888888'
};
