/**
 * Major moons data based on NASA resources
 * Distances in km from parent planet
 * Sizes in km (diameter)
 * Orbital periods in Earth days
 */

export interface MoonData {
  name: string;
  parentPlanet: string;
  color: string; // Fallback color
  texture?: string; // Path to texture file

  // Physical characteristics
  diameter: number; // km
  mass: number; // relative to Earth's Moon
  gravity: number; // m/s²

  // Orbital data
  distanceFromPlanet: number; // km
  orbitalPeriod: number; // Earth days
  orbitalSpeed: number; // km/s
  orbitalEccentricity: number;
  orbitalInclination: number; // degrees

  // Additional info
  tidally_locked: boolean;
  facts: string[];
}

export const MOONS: MoonData[] = [
  // Earth's Moon
  {
    name: "Moon",
    parentPlanet: "Earth",
    color: "#c0c0c0",
    texture: "/textures/moon.jpg",
    diameter: 3474,
    mass: 1.0, // Reference (Earth's Moon = 1)
    gravity: 1.62,
    distanceFromPlanet: 384400,
    orbitalPeriod: 27.3,
    orbitalSpeed: 1.022,
    orbitalEccentricity: 0.0549,
    orbitalInclination: 5.14,
    tidally_locked: true,
    facts: [
      "Only natural satellite of Earth",
      "Fifth largest moon in the solar system",
      "Same side always faces Earth (tidally locked)",
      "Causes tides on Earth through gravitational interaction"
    ]
  },

  // Jupiter's Galilean Moons
  {
    name: "Io",
    parentPlanet: "Jupiter",
    color: "#f4d03f",
    diameter: 3643,
    mass: 1.21,
    gravity: 1.796,
    distanceFromPlanet: 421700,
    orbitalPeriod: 1.77,
    orbitalSpeed: 17.334,
    orbitalEccentricity: 0.0041,
    orbitalInclination: 0.05,
    tidally_locked: true,
    facts: [
      "Most volcanically active body in the solar system",
      "Over 400 active volcanoes on its surface",
      "Sulfur gives it a yellow-orange color",
      "Discovered by Galileo Galilei in 1610"
    ]
  },
  {
    name: "Europa",
    parentPlanet: "Jupiter",
    color: "#d4c5b0",
    diameter: 3122,
    mass: 0.65,
    gravity: 1.314,
    distanceFromPlanet: 671034,
    orbitalPeriod: 3.55,
    orbitalSpeed: 13.740,
    orbitalEccentricity: 0.0094,
    orbitalInclination: 0.47,
    tidally_locked: true,
    facts: [
      "Smooth ice surface with few craters",
      "Likely has a subsurface ocean beneath ice crust",
      "One of the best candidates for extraterrestrial life",
      "Ice shell is 15-25 km thick"
    ]
  },
  {
    name: "Ganymede",
    parentPlanet: "Jupiter",
    color: "#8b7355",
    diameter: 5268,
    mass: 2.02,
    gravity: 1.428,
    distanceFromPlanet: 1070412,
    orbitalPeriod: 7.15,
    orbitalSpeed: 10.880,
    orbitalEccentricity: 0.0013,
    orbitalInclination: 0.20,
    tidally_locked: true,
    facts: [
      "Largest moon in the solar system",
      "Larger than planet Mercury",
      "Only moon with its own magnetic field",
      "Has a subsurface ocean"
    ]
  },
  {
    name: "Callisto",
    parentPlanet: "Jupiter",
    color: "#5a5a5a",
    diameter: 4821,
    mass: 1.47,
    gravity: 1.235,
    distanceFromPlanet: 1882709,
    orbitalPeriod: 16.69,
    orbitalSpeed: 8.204,
    orbitalEccentricity: 0.0074,
    orbitalInclination: 0.19,
    tidally_locked: true,
    facts: [
      "Most heavily cratered object in the solar system",
      "Very old surface (4 billion years)",
      "May have a subsurface ocean",
      "Third largest moon in the solar system"
    ]
  },

  // Saturn's Major Moons
  {
    name: "Titan",
    parentPlanet: "Saturn",
    color: "#e5a642",
    diameter: 5150,
    mass: 1.83,
    gravity: 1.352,
    distanceFromPlanet: 1221870,
    orbitalPeriod: 15.95,
    orbitalSpeed: 5.570,
    orbitalEccentricity: 0.0288,
    orbitalInclination: 0.35,
    tidally_locked: true,
    facts: [
      "Only moon with a dense atmosphere",
      "Second largest moon in the solar system",
      "Has methane lakes and seas on its surface",
      "Atmosphere is mostly nitrogen, like Earth"
    ]
  },
  {
    name: "Enceladus",
    parentPlanet: "Saturn",
    color: "#f0f0f0",
    diameter: 504,
    mass: 0.015,
    gravity: 0.113,
    distanceFromPlanet: 238020,
    orbitalPeriod: 1.37,
    orbitalSpeed: 12.635,
    orbitalEccentricity: 0.0047,
    orbitalInclination: 0.02,
    tidally_locked: true,
    facts: [
      "Shoots water geysers from its south pole",
      "Has a global subsurface ocean",
      "Most reflective body in the solar system",
      "Key target in search for extraterrestrial life"
    ]
  },
  {
    name: "Rhea",
    parentPlanet: "Saturn",
    color: "#c8c8c8",
    diameter: 1528,
    mass: 0.031,
    gravity: 0.264,
    distanceFromPlanet: 527108,
    orbitalPeriod: 4.52,
    orbitalSpeed: 8.480,
    orbitalEccentricity: 0.0013,
    orbitalInclination: 0.35,
    tidally_locked: true,
    facts: [
      "Second largest moon of Saturn",
      "Heavily cratered icy surface",
      "May have a tenuous ring system",
      "Composed mostly of water ice"
    ]
  },

  // Uranus's Major Moons
  {
    name: "Titania",
    parentPlanet: "Uranus",
    color: "#a0a0a0",
    diameter: 1578,
    mass: 0.048,
    gravity: 0.378,
    distanceFromPlanet: 435910,
    orbitalPeriod: 8.71,
    orbitalSpeed: 3.640,
    orbitalEccentricity: 0.0011,
    orbitalInclination: 0.34,
    tidally_locked: true,
    facts: [
      "Largest moon of Uranus",
      "Has a mix of ice and rock",
      "Surface shows signs of past geological activity",
      "Named after queen of the fairies in Shakespeare"
    ]
  },
  {
    name: "Oberon",
    parentPlanet: "Uranus",
    color: "#909090",
    diameter: 1523,
    mass: 0.041,
    gravity: 0.346,
    distanceFromPlanet: 583520,
    orbitalPeriod: 13.46,
    orbitalSpeed: 3.150,
    orbitalEccentricity: 0.0014,
    orbitalInclination: 0.07,
    tidally_locked: true,
    facts: [
      "Second largest moon of Uranus",
      "Darkest of the major Uranian moons",
      "Ancient, heavily cratered surface",
      "Named after king of the fairies in Shakespeare"
    ]
  },

  // Neptune's Major Moon
  {
    name: "Triton",
    parentPlanet: "Neptune",
    color: "#f5deb3",
    diameter: 2707,
    mass: 0.29,
    gravity: 0.779,
    distanceFromPlanet: 354759,
    orbitalPeriod: 5.88,
    orbitalSpeed: 4.390,
    orbitalEccentricity: 0.000016,
    orbitalInclination: 156.8, // Retrograde orbit!
    tidally_locked: true,
    facts: [
      "Largest moon of Neptune",
      "Only large moon with retrograde orbit",
      "Likely a captured Kuiper Belt object",
      "Has nitrogen geysers and a thin atmosphere",
      "Coldest known object in the solar system (-235°C)"
    ]
  }
];

// Helper function to get moons for a specific planet
export function getMoonsForPlanet(planetName: string): MoonData[] {
  return MOONS.filter(moon => moon.parentPlanet === planetName);
}

// Count of moons per planet
export const MOON_COUNTS = {
  Mercury: 0,
  Venus: 0,
  Earth: 1,
  Mars: 2, // Phobos and Deimos - too small to render
  Jupiter: 4, // Galilean moons (many more exist but too small)
  Saturn: 3, // Titan, Enceladus, Rhea (many more exist)
  Uranus: 2, // Titania, Oberon (many more exist)
  Neptune: 1  // Triton (many more exist)
};
