/**
 * Planetary data based on NASA resources
 * Distances in AU (Astronomical Units, 1 AU = Earth-Sun distance = ~150 million km)
 * Sizes are relative (with Earth = 1)
 * Orbital periods in Earth days
 */

export interface PlanetData {
  name: string;
  type: string;
  color: string; // Fallback color for basic rendering
  texture?: string; // Path to texture file

  // Physical characteristics
  diameter: number; // km
  mass: number; // relative to Earth
  gravity: number; // m/s²

  // Orbital data
  distanceFromSun: number; // AU
  orbitalPeriod: number; // Earth days
  orbitalSpeed: number; // km/s
  orbitalEccentricity: number; // 0 = perfect circle, closer to 1 = more elliptical
  orbitalInclination: number; // degrees

  // J2000.0 orbital elements (for calculating real-time positions)
  meanLongitudeJ2000: number; // degrees - Mean longitude at J2000.0 epoch (Jan 1, 2000, noon)
  meanLongitudeRate: number; // degrees per century - Rate of change of mean longitude

  // Rotation
  rotationPeriod: number; // Earth days
  axialTilt: number; // degrees

  // Atmospheric composition (simplified)
  atmosphere: string[];

  // Additional info
  moons: number;
  hasRings: boolean;
  ringData?: {
    innerRadiusRatio: number; // Ratio relative to planet radius
    outerRadiusRatio: number; // Ratio relative to planet radius
    texture?: string; // Optional ring texture path
    opacity?: number; // Ring opacity (0-1)
  };
  facts: string[];
}

export const PLANETS: PlanetData[] = [
  {
    name: "Mercury",
    type: "Terrestrial",
    color: "#8c7853",
    texture: "/textures/mercury.jpg",
    diameter: 4879,
    mass: 0.055,
    gravity: 3.7,
    distanceFromSun: 0.39,
    orbitalPeriod: 88,
    orbitalSpeed: 47.4,
    orbitalEccentricity: 0.206,
    orbitalInclination: 7.0,

    // J2000.0 orbital elements (NASA JPL)
    meanLongitudeJ2000: 252.250,
    meanLongitudeRate: 149472.674,

    rotationPeriod: 58.6,
    axialTilt: 0.034,
    atmosphere: ["Trace"],
    moons: 0,
    hasRings: false,
    facts: [
      "Smallest planet in the solar system",
      "Has the most eccentric orbit",
      "Surface temperatures range from -173°C to 427°C",
      "One day on Mercury lasts 176 Earth days"
    ]
  },
  {
    name: "Venus",
    type: "Terrestrial",
    color: "#ffc649",
    texture: "/textures/venus.jpg",
    diameter: 12104,
    mass: 0.815,
    gravity: 8.9,
    distanceFromSun: 0.72,
    orbitalPeriod: 225,
    orbitalSpeed: 35.0,
    orbitalEccentricity: 0.007,
    orbitalInclination: 3.4,

    // J2000.0 orbital elements (NASA JPL)
    meanLongitudeJ2000: 181.979,
    meanLongitudeRate: 58517.815,

    rotationPeriod: -243, // Negative indicates retrograde rotation
    axialTilt: 177.4,
    atmosphere: ["CO2 (96.5%)", "N2 (3.5%)"],
    moons: 0,
    hasRings: false,
    facts: [
      "Hottest planet in the solar system (~462°C)",
      "Rotates backwards compared to most planets",
      "A day on Venus is longer than its year",
      "Has a thick, toxic atmosphere with sulfuric acid clouds"
    ]
  },
  {
    name: "Earth",
    type: "Terrestrial",
    color: "#4169e1",
    texture: "/textures/earth.jpg",
    diameter: 12742,
    mass: 1.0,
    gravity: 9.8,
    distanceFromSun: 1.0,
    orbitalPeriod: 365.25,
    orbitalSpeed: 29.8,
    orbitalEccentricity: 0.017,
    orbitalInclination: 0.0,

    // J2000.0 orbital elements (NASA JPL)
    meanLongitudeJ2000: 100.465,
    meanLongitudeRate: 35999.372,

    rotationPeriod: 1.0,
    axialTilt: 23.4,
    atmosphere: ["N2 (78%)", "O2 (21%)", "Ar (0.9%)"],
    moons: 1,
    hasRings: false,
    facts: [
      "The only known planet to support life",
      "71% of the surface is covered by water",
      "Has a protective magnetic field",
      "The densest planet in the solar system"
    ]
  },
  {
    name: "Mars",
    type: "Terrestrial",
    color: "#cd5c5c",
    texture: "/textures/mars.jpg",
    diameter: 6779,
    mass: 0.107,
    gravity: 3.7,
    distanceFromSun: 1.52,
    orbitalPeriod: 687,
    orbitalSpeed: 24.1,
    orbitalEccentricity: 0.094,
    orbitalInclination: 1.9,

    // J2000.0 orbital elements (NASA JPL)
    meanLongitudeJ2000: -4.553,
    meanLongitudeRate: 19140.303,

    rotationPeriod: 1.03,
    axialTilt: 25.2,
    atmosphere: ["CO2 (95%)", "N2 (2.8%)", "Ar (2%)"],
    moons: 2,
    hasRings: false,
    facts: [
      "Known as the Red Planet due to iron oxide",
      "Home to the largest volcano in the solar system (Olympus Mons)",
      "Has polar ice caps of water and CO2",
      "A day on Mars is very similar to Earth (24.6 hours)"
    ]
  },
  {
    name: "Jupiter",
    type: "Gas Giant",
    color: "#daa520",
    texture: "/textures/jupiter.jpg",
    diameter: 139820,
    mass: 317.8,
    gravity: 23.1,
    distanceFromSun: 5.20,
    orbitalPeriod: 4333,
    orbitalSpeed: 13.1,
    orbitalEccentricity: 0.049,
    orbitalInclination: 1.3,

    // J2000.0 orbital elements (NASA JPL)
    meanLongitudeJ2000: 34.396,
    meanLongitudeRate: 3034.746,

    rotationPeriod: 0.41,
    axialTilt: 3.1,
    atmosphere: ["H2 (90%)", "He (10%)"],
    moons: 95,
    hasRings: true,
    ringData: {
      innerRadiusRatio: 1.75, // Main ring at 122,500 km
      outerRadiusRatio: 1.85,  // Outer edge at 129,000 km
      opacity: 0.05, // Very faint rings
    },
    facts: [
      "Largest planet in the solar system",
      "The Great Red Spot is a storm larger than Earth",
      "Has the shortest day of all planets (9.9 hours)",
      "Strong magnetic field, 20,000 times stronger than Earth's"
    ]
  },
  {
    name: "Saturn",
    type: "Gas Giant",
    color: "#f4a460",
    texture: "/textures/saturn.jpg",
    diameter: 116460,
    mass: 95.2,
    gravity: 9.0,
    distanceFromSun: 9.54,
    orbitalPeriod: 10759,
    orbitalSpeed: 9.7,
    orbitalEccentricity: 0.057,
    orbitalInclination: 2.5,

    // J2000.0 orbital elements (NASA JPL)
    meanLongitudeJ2000: 49.954,
    meanLongitudeRate: 1222.494,

    rotationPeriod: 0.45,
    axialTilt: 26.7,
    atmosphere: ["H2 (96%)", "He (3%)"],
    moons: 146,
    hasRings: true,
    ringData: {
      innerRadiusRatio: 1.15, // D ring at 66,900 km
      outerRadiusRatio: 2.35,  // A ring outer edge at 136,780 km
      texture: "/textures/saturn_ring_alpha.png",
      opacity: 0.9, // Prominent, visible rings
    },
    facts: [
      "Has the most spectacular ring system",
      "Second largest planet in the solar system",
      "Least dense planet - would float in water",
      "Titan, its largest moon, has a dense atmosphere"
    ]
  },
  {
    name: "Uranus",
    type: "Ice Giant",
    color: "#4fd0e5",
    texture: "/textures/uranus.jpg",
    diameter: 50724,
    mass: 14.5,
    gravity: 8.7,
    distanceFromSun: 19.19,
    orbitalPeriod: 30687,
    orbitalSpeed: 6.8,
    orbitalEccentricity: 0.046,
    orbitalInclination: 0.8,

    // J2000.0 orbital elements (NASA JPL)
    meanLongitudeJ2000: 313.238,
    meanLongitudeRate: 428.482,

    rotationPeriod: -0.72, // Retrograde rotation
    axialTilt: 97.8,
    atmosphere: ["H2 (83%)", "He (15%)", "CH4 (2%)"],
    moons: 28,
    hasRings: true,
    ringData: {
      innerRadiusRatio: 1.50, // Zeta ring at 38,000 km
      outerRadiusRatio: 2.02,  // Epsilon ring outer at 51,149 km
      opacity: 0.05, // Thin, dark rings
    },
    facts: [
      "Rotates on its side (97.8° tilt)",
      "Coldest planetary atmosphere (-224°C)",
      "Faint ring system discovered in 1977",
      "Takes 84 Earth years to orbit the Sun"
    ]
  },
  {
    name: "Neptune",
    type: "Ice Giant",
    color: "#4169e1",
    texture: "/textures/neptune.jpg",
    diameter: 49244,
    mass: 17.1,
    gravity: 11.0,
    distanceFromSun: 30.07,
    orbitalPeriod: 60190,
    orbitalSpeed: 5.4,
    orbitalEccentricity: 0.011,
    orbitalInclination: 1.8,

    // J2000.0 orbital elements (NASA JPL)
    meanLongitudeJ2000: -55.120,
    meanLongitudeRate: 218.459,

    rotationPeriod: 0.67,
    axialTilt: 28.3,
    atmosphere: ["H2 (80%)", "He (19%)", "CH4 (1%)"],
    moons: 16,
    hasRings: true,
    ringData: {
      innerRadiusRatio: 1.71, // Galle ring at 42,000 km
      outerRadiusRatio: 2.56,  // Adams ring at 63,000 km
      opacity: 0.05, // Faint arcs/rings
    },
    facts: [
      "Farthest planet from the Sun",
      "Has the strongest winds in the solar system (2,100 km/h)",
      "First planet found by mathematical prediction",
      "Takes 165 Earth years to complete one orbit"
    ]
  }
];

export const SUN_DATA = {
  name: "Sun",
  type: "Star (G-type main-sequence)",
  color: "#fdb813",
  texture: "/textures/sun.jpg",
  diameter: 1392700, // km
  mass: 333000, // relative to Earth
  surfaceTemp: 5778, // Kelvin
  rotationPeriod: 25.05, // Earth days (at equator - Sun has differential rotation)
  facts: [
    "Contains 99.86% of the solar system's mass",
    "Core temperature is about 15 million degrees Celsius",
    "Energy takes 170,000 years to travel from core to surface",
    "About 4.6 billion years old, halfway through its lifetime"
  ]
};

// Scale factors for visualization
export const SCALE_FACTORS = {
  // For visual mode (adjusted for better viewing)
  VISUAL: {
    DISTANCE: 50, // Multiplier for orbital distances
    SIZE: 0.01, // Multiplier for planet sizes
    SUN_SIZE: 5, // Fixed sun size for visibility
  },
  // For realistic mode (true to scale)
  REALISTIC: {
    DISTANCE: 100,
    SIZE: 0.001,
    SUN_SIZE: 10,
  }
};
