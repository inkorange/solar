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

  // Rendering options
  showLabel?: boolean; // Only show labels on largest moons (default: true for major moons)
  useSprite?: boolean; // Use simple sprite instead of 3D sphere for performance (default: false)
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

  // Mars's Moons
  {
    name: "Phobos",
    parentPlanet: "Mars",
    color: "#6b6b6b",
    diameter: 22.2,
    mass: 0.000001,
    gravity: 0.0057,
    distanceFromPlanet: 9376,
    orbitalPeriod: 0.319,
    orbitalSpeed: 2.138,
    orbitalEccentricity: 0.0151,
    orbitalInclination: 1.08,
    tidally_locked: true,
    showLabel: false,
    useSprite: true,
    facts: [
      "Irregularly shaped, potato-like moon",
      "Named after Greek god of fear",
      "Orbits closer to Mars than any other moon to its planet",
      "Will eventually crash into Mars or break apart"
    ]
  },
  {
    name: "Deimos",
    parentPlanet: "Mars",
    color: "#8b8b8b",
    diameter: 12.4,
    mass: 0.0000003,
    gravity: 0.003,
    distanceFromPlanet: 23460,
    orbitalPeriod: 1.263,
    orbitalSpeed: 1.351,
    orbitalEccentricity: 0.0003,
    orbitalInclination: 0.93,
    tidally_locked: true,
    showLabel: false,
    useSprite: true,
    facts: [
      "Smaller and more distant of Mars' two moons",
      "Named after Greek god of terror",
      "Very smooth surface with few craters",
      "May be a captured asteroid"
    ]
  },

  // Additional Jupiter Moons
  {
    name: "Amalthea",
    parentPlanet: "Jupiter",
    color: "#c97a7a",
    diameter: 167,
    mass: 0.00003,
    gravity: 0.020,
    distanceFromPlanet: 181400,
    orbitalPeriod: 0.498,
    orbitalSpeed: 26.570,
    orbitalEccentricity: 0.0032,
    orbitalInclination: 0.37,
    tidally_locked: true,
    showLabel: false,
    useSprite: true,
    facts: [
      "Fifth moon of Jupiter",
      "Reddish color from sulfur from Io",
      "Irregularly shaped",
      "Discovered in 1892"
    ]
  },
  {
    name: "Himalia",
    parentPlanet: "Jupiter",
    color: "#9b9b9b",
    diameter: 140,
    mass: 0.00009,
    gravity: 0.062,
    distanceFromPlanet: 11460000,
    orbitalPeriod: 250.56,
    orbitalSpeed: 3.312,
    orbitalEccentricity: 0.162,
    orbitalInclination: 27.5,
    tidally_locked: false,
    showLabel: false,
    useSprite: true,
    facts: [
      "Largest irregular satellite of Jupiter",
      "Very dark surface (only reflects 4% of light)",
      "May be a captured asteroid",
      "Named after a nymph in Greek mythology"
    ]
  },

  // Additional Saturn Moons
  {
    name: "Mimas",
    parentPlanet: "Saturn",
    color: "#d0d0d0",
    diameter: 396,
    mass: 0.0051,
    gravity: 0.064,
    distanceFromPlanet: 185520,
    orbitalPeriod: 0.942,
    orbitalSpeed: 14.280,
    orbitalEccentricity: 0.0196,
    orbitalInclination: 1.57,
    tidally_locked: true,
    showLabel: false,
    useSprite: true,
    facts: [
      "Nicknamed the 'Death Star' due to giant Herschel crater",
      "Smallest known body in hydrostatic equilibrium",
      "Herschel crater is 1/3 the diameter of Mimas",
      "Impact almost destroyed the moon"
    ]
  },
  {
    name: "Tethys",
    parentPlanet: "Saturn",
    color: "#e8e8e8",
    diameter: 1062,
    mass: 0.0084,
    gravity: 0.145,
    distanceFromPlanet: 294619,
    orbitalPeriod: 1.888,
    orbitalSpeed: 11.350,
    orbitalEccentricity: 0.0001,
    orbitalInclination: 1.12,
    tidally_locked: true,
    showLabel: false,
    useSprite: true,
    facts: [
      "Third largest moon of Saturn",
      "Has a huge canyon system called Ithaca Chasma",
      "Very low density - mostly water ice",
      "Named after a Titan from Greek mythology"
    ]
  },
  {
    name: "Dione",
    parentPlanet: "Saturn",
    color: "#c0c0c0",
    diameter: 1123,
    mass: 0.015,
    gravity: 0.232,
    distanceFromPlanet: 377396,
    orbitalPeriod: 2.737,
    orbitalSpeed: 10.030,
    orbitalEccentricity: 0.0022,
    orbitalInclination: 0.02,
    tidally_locked: true,
    showLabel: false,
    useSprite: true,
    facts: [
      "Fourth largest moon of Saturn",
      "May have a subsurface ocean",
      "Wispy bright streaks on surface",
      "Named after a Titan from Greek mythology"
    ]
  },
  {
    name: "Iapetus",
    parentPlanet: "Saturn",
    color: "#a0a0a0",
    diameter: 1469,
    mass: 0.025,
    gravity: 0.223,
    distanceFromPlanet: 3560820,
    orbitalPeriod: 79.33,
    orbitalSpeed: 3.260,
    orbitalEccentricity: 0.0286,
    orbitalInclination: 15.47,
    tidally_locked: true,
    showLabel: false,
    useSprite: true,
    facts: [
      "Has a two-tone coloration (one dark, one bright hemisphere)",
      "Has an equatorial ridge 20 km high",
      "Third largest moon of Saturn",
      "Very far from Saturn compared to other major moons"
    ]
  },

  // Additional Uranus Moons
  {
    name: "Ariel",
    parentPlanet: "Uranus",
    color: "#b8b8b8",
    diameter: 1158,
    mass: 0.018,
    gravity: 0.269,
    distanceFromPlanet: 190900,
    orbitalPeriod: 2.52,
    orbitalSpeed: 5.510,
    orbitalEccentricity: 0.0012,
    orbitalInclination: 0.26,
    tidally_locked: true,
    showLabel: false,
    useSprite: true,
    facts: [
      "Fourth largest moon of Uranus",
      "Youngest surface of Uranian moons",
      "Has canyons, valleys, and ridges",
      "Named after a sprite in Shakespeare's The Tempest"
    ]
  },
  {
    name: "Umbriel",
    parentPlanet: "Uranus",
    color: "#707070",
    diameter: 1169,
    mass: 0.016,
    gravity: 0.234,
    distanceFromPlanet: 266000,
    orbitalPeriod: 4.14,
    orbitalSpeed: 4.670,
    orbitalEccentricity: 0.0039,
    orbitalInclination: 0.13,
    tidally_locked: true,
    showLabel: false,
    useSprite: true,
    facts: [
      "Third largest moon of Uranus",
      "Darkest of the large Uranian moons",
      "Ancient, heavily cratered surface",
      "Named after a sprite in Alexander Pope's poem"
    ]
  },
  {
    name: "Miranda",
    parentPlanet: "Uranus",
    color: "#989898",
    diameter: 471,
    mass: 0.0009,
    gravity: 0.079,
    distanceFromPlanet: 129900,
    orbitalPeriod: 1.41,
    orbitalSpeed: 6.660,
    orbitalEccentricity: 0.0013,
    orbitalInclination: 4.22,
    tidally_locked: true,
    showLabel: false,
    useSprite: true,
    facts: [
      "Fifth largest moon of Uranus",
      "Has the most extreme terrain in the solar system",
      "Verona Rupes cliff is 5-10 km high",
      "May have been shattered and re-formed"
    ]
  },

  // Additional Neptune Moon
  {
    name: "Proteus",
    parentPlanet: "Neptune",
    color: "#7a7a7a",
    diameter: 420,
    mass: 0.0007,
    gravity: 0.070,
    distanceFromPlanet: 117647,
    orbitalPeriod: 1.12,
    orbitalSpeed: 7.620,
    orbitalEccentricity: 0.0005,
    orbitalInclination: 0.55,
    tidally_locked: true,
    showLabel: false,
    useSprite: true,
    facts: [
      "Second largest moon of Neptune",
      "Irregularly shaped (not spherical)",
      "Very dark surface - reflects only 6% of light",
      "Named after Greek sea god Proteus"
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
  Mars: 2, // Phobos and Deimos (sprites)
  Jupiter: 6, // Galilean moons (3D) + Amalthea, Himalia (sprites)
  Saturn: 8, // Titan (3D), Enceladus, Rhea (3D) + Mimas, Tethys, Dione, Iapetus (sprites)
  Uranus: 5, // Titania, Oberon (3D) + Ariel, Umbriel, Miranda (sprites)
  Neptune: 2  // Triton (3D) + Proteus (sprite)
};
