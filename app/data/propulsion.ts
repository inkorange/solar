/**
 * Propulsion System Data
 * Based on real-world and theoretical propulsion technologies
 * Speeds and characteristics derived from NASA and physics research
 */

export type PropulsionType =
  | 'chemical-rocket'
  | 'ion-thruster'
  | 'solar-sail'
  | 'nuclear-thermal'
  | 'antimatter'
  | 'epstein-drive'
  | 'light-speed'
  | 'warp-drive';

export interface PropulsionData {
  id: PropulsionType;
  name: string;
  displayName: string;
  category: 'Current Technology' | 'Advanced Technology' | 'Theoretical';

  // Performance characteristics
  maxSpeed: number; // km/s
  acceleration: number; // m/s²
  supportsFlipAndBurn: boolean; // Whether this propulsion can do flip-and-burn maneuvers

  // For UI and education
  description: string;
  technicalDetails: string;
  realWorldExamples: string[];
  advantages: string[];
  limitations: string[];

  // Visual representation
  color: string;
  icon: string;
}

// Constants for calculations
export const CONSTANTS = {
  AU_TO_KM: 149597870.7, // 1 AU in kilometers
  SPEED_OF_LIGHT: 299792.458, // km/s
  SECONDS_PER_DAY: 86400,
  SECONDS_PER_YEAR: 31557600,
};

export const PROPULSION_SYSTEMS: PropulsionData[] = [
  {
    id: 'chemical-rocket',
    name: 'Chemical Rocket',
    displayName: 'Chemical Rockets',
    category: 'Current Technology',
    maxSpeed: 17, // km/s (escape velocity + margin)
    acceleration: 30, // m/s² during burn
    supportsFlipAndBurn: true,
    description: 'Traditional rocket propulsion using chemical reactions between fuel and oxidizer. The workhorse of current space exploration.',
    technicalDetails: 'Burns liquid or solid propellants to create thrust. High thrust but limited by fuel capacity. Typical exhaust velocity: 3-4.5 km/s.',
    realWorldExamples: [
      'Saturn V (Apollo missions)',
      'Space Shuttle Main Engines',
      'SpaceX Falcon 9 and Starship',
      'Blue Origin New Glenn'
    ],
    advantages: [
      'High thrust-to-weight ratio',
      'Proven, reliable technology',
      'Quick acceleration',
      'Used in all current space missions'
    ],
    limitations: [
      'Limited by fuel capacity (Tsiolkovsky rocket equation)',
      'Cannot sustain acceleration for long periods',
      'Relatively low exhaust velocity',
      'Heavy fuel requirements'
    ],
    color: '#ff6b35',
    icon: '🚀'
  },
  {
    id: 'ion-thruster',
    name: 'Ion Thruster',
    displayName: 'Ion Drive (Electric Propulsion)',
    category: 'Current Technology',
    maxSpeed: 90, // km/s (achievable with long burn times)
    acceleration: 0.00009, // m/s² (very low thrust)
    supportsFlipAndBurn: true,
    description: 'Electric propulsion that ionizes propellant and accelerates ions using electric fields. Extremely efficient but low thrust.',
    technicalDetails: 'Uses electrical energy (solar panels) to ionize xenon or other noble gases, then accelerates ions to very high speeds. Specific impulse: 3000-9000 seconds.',
    realWorldExamples: [
      'NASA Dawn spacecraft (Vesta and Ceres)',
      'ESA BepiColombo (Mercury mission)',
      'SpaceX Starlink satellites',
      'NASA DART mission'
    ],
    advantages: [
      'Extremely fuel efficient (10x better than chemical)',
      'Can run continuously for months/years',
      'Reaches higher final velocities',
      'Lower fuel mass required'
    ],
    limitations: [
      'Very low thrust (like a piece of paper on your hand)',
      'Takes months to reach high speeds',
      'Requires power source (solar panels)',
      'Cannot launch from planetary surfaces'
    ],
    color: '#4ecdc4',
    icon: '⚡'
  },
  {
    id: 'solar-sail',
    name: 'Solar Sail',
    displayName: 'Solar Sail',
    category: 'Advanced Technology',
    maxSpeed: 150, // km/s (theoretical with optimal conditions)
    acceleration: 0.00001, // m/s² (depends on distance from Sun)
    supportsFlipAndBurn: true,
    description: 'Propellantless propulsion using radiation pressure from sunlight on large reflective sails. Unlimited operational lifetime.',
    technicalDetails: 'Large ultra-thin reflective sail (kilometers across) reflects photons from the Sun, transferring momentum. Acceleration decreases with distance from Sun (inverse square law).',
    realWorldExamples: [
      'IKAROS (Japan, 2010 - first successful demonstration)',
      'LightSail 2 (Planetary Society)',
      'NASA\'s Near-Earth Asteroid Scout',
      'Breakthrough Starshot (proposed interstellar mission)'
    ],
    advantages: [
      'No propellant needed (unlimited delta-v)',
      'Continuous acceleration',
      'Can reach very high speeds over time',
      'Enables interstellar missions (theoretically)'
    ],
    limitations: [
      'Extremely low thrust',
      'Requires very large, ultra-light sails',
      'Acceleration decreases far from Sun',
      'Vulnerable to micrometeorites',
      'Takes years to reach high speeds'
    ],
    color: '#f4d03f',
    icon: '⛵'
  },
  {
    id: 'nuclear-thermal',
    name: 'Nuclear Thermal',
    displayName: 'Nuclear Thermal Rocket',
    category: 'Advanced Technology',
    maxSpeed: 30, // km/s (theoretical exhaust velocity)
    acceleration: 5, // m/s² (moderate thrust)
    supportsFlipAndBurn: true,
    description: 'Uses nuclear reactor to heat propellant to extreme temperatures. Offers double the efficiency of chemical rockets.',
    technicalDetails: 'Nuclear fission reactor heats hydrogen propellant to 2500K+, expelled through nozzle. Specific impulse: 800-1000 seconds (2x chemical rockets).',
    realWorldExamples: [
      'NERVA program (NASA, 1960s - tested but never flown)',
      'Project Orion (nuclear pulse propulsion concept)',
      'NASA DRACO program (current development)',
      'Russian RD-0410 (tested in 1980s)'
    ],
    advantages: [
      'Much higher efficiency than chemical (2x ISP)',
      'Sufficient thrust for fast missions',
      'Mature technology (tested in 1960s-80s)',
      'Enables manned Mars missions in months'
    ],
    limitations: [
      'Radioactive materials and safety concerns',
      'Political/regulatory challenges',
      'Cannot be used for launch from Earth',
      'Reactor adds significant mass',
      'Still requires propellant (hydrogen)'
    ],
    color: '#9b59b6',
    icon: '☢️'
  },
  {
    id: 'antimatter',
    name: 'Antimatter',
    displayName: 'Antimatter Catalyzed Propulsion',
    category: 'Theoretical',
    maxSpeed: 50000, // km/s (significant fraction of c - ~16.7% speed of light)
    acceleration: 15, // m/s² (high energy density)
    supportsFlipAndBurn: true,
    description: 'Matter-antimatter annihilation releases enormous energy (E=mc²). Theoretical propulsion for interstellar travel.',
    technicalDetails: 'Antimatter annihilation with matter produces pure energy. Even tiny amounts (micrograms) produce massive thrust. Specific impulse: millions of seconds theoretically.',
    realWorldExamples: [
      'No practical examples - purely theoretical',
      'CERN produces tiny amounts for research',
      'NASA NIAC antimatter propulsion studies',
      'Antimatter Factory at CERN (research only)'
    ],
    advantages: [
      'Highest energy density of any known fuel',
      'Could reach nearby stars in decades',
      'Enables true interstellar travel',
      'Very small fuel mass needed (milligrams)'
    ],
    limitations: [
      'Antimatter production extremely expensive (~$62.5 trillion/gram)',
      'Current production: nanograms per year globally',
      'Storage nearly impossible (requires magnetic bottles)',
      'Safety concerns (any containment failure = explosion)',
      'Centuries away from practical use'
    ],
    color: '#e74c3c',
    icon: '💥'
  },
  {
    id: 'epstein-drive',
    name: 'Epstein Drive',
    displayName: 'Epstein Drive (The Expanse)',
    category: 'Theoretical',
    maxSpeed: 100000, // km/s (~33% speed of light - set very high to ensure continuous acceleration)
    acceleration: 14.715, // m/s² (1.5G - safe for continuous human transport)
    supportsFlipAndBurn: true,
    description: 'Revolutionary fusion-based rocket from The Expanse. Enables rapid interplanetary travel via continuous high-g acceleration.',
    technicalDetails: 'Uses magnetic coils to accelerate plasma exhaust from fusion reactions to extremely high velocities. Maintains constant 1.5G thrust, allowing ships to continuously accelerate for the first half of the journey, then flip and decelerate at 1.5G for the second half. Never cruises - always accelerating or decelerating. Travel between Earth and Mars takes just days instead of months.',
    realWorldExamples: [
      'Fictional technology from The Expanse book series by James S.A. Corey',
      'Invented by Dr. Solomon Epstein (fictional character)',
      'Inspired by real fusion propulsion research',
      'Conceptually similar to proposed fusion rockets'
    ],
    advantages: [
      'Continuous high-thrust acceleration (1.5G)',
      'Comfortable for human crews (artificial gravity during travel)',
      'No cruise phase - always accelerating or decelerating',
      'Reaches speeds up to ~8000 km/s on long journeys',
      'Earth to Mars in 3-4 days vs. 6-9 months currently',
      'Enables routine interplanetary commerce',
      'Highly efficient fusion-based power'
    ],
    limitations: [
      'Requires breakthrough in fusion technology',
      'Magnetic acceleration system not yet developed',
      'Sustained fusion reactions remain challenging',
      'Must flip exactly at midpoint (complex navigation)',
      'High fuel requirements for sustained thrust',
      'Fictional - no experimental validation'
    ],
    color: '#1e88e5',
    icon: '⚛️'
  },
  {
    id: 'light-speed',
    name: 'Light Speed',
    displayName: 'Photonic Propulsion (Light Speed)',
    category: 'Theoretical',
    maxSpeed: 299792.458, // km/s (exactly the speed of light)
    acceleration: 0, // Assumed instantaneous for theoretical purposes
    supportsFlipAndBurn: false,
    description: 'Theoretical propulsion achieving exactly the speed of light (c). The cosmic speed limit set by Einstein\'s relativity.',
    technicalDetails: 'Travels at constant velocity of 299,792.458 km/s (186,282 miles/s). At this speed, time dilation becomes infinite for outside observers. Requires infinite energy for objects with mass according to special relativity. Only massless particles (photons) naturally travel at c.',
    realWorldExamples: [
      'Photons (light particles) travel at c naturally',
      'Laser beam propulsion concepts (Breakthrough Starshot)',
      'Photon rockets (theoretical - using pure light for thrust)',
      'Beamed energy propulsion studies'
    ],
    advantages: [
      'Absolute maximum speed possible (cosmic speed limit)',
      'Cross solar system in hours instead of months/years',
      'Earth to Mars in ~3-22 minutes (depending on distance)',
      'Pluto reachable in ~5.5 hours',
      'Time dilation effects (time slows for travelers)'
    ],
    limitations: [
      'Requires infinite energy for massive objects (E=mc²)',
      'Violates known physics for anything with mass',
      'Extreme time dilation (twin paradox)',
      'No known method to accelerate mass to light speed',
      'Would require perfect conversion of mass to energy',
      'Relativistic effects make navigation complex'
    ],
    color: '#f39c12',
    icon: '💫'
  },
  {
    id: 'warp-drive',
    name: 'Warp Drive',
    displayName: 'Alcubierre Warp Drive',
    category: 'Theoretical',
    maxSpeed: 299792458, // km/s (speed of light - FTL through spacetime manipulation)
    acceleration: 0, // Instantaneous (doesn't accelerate in traditional sense)
    supportsFlipAndBurn: false,
    description: 'Theoretical FTL travel by warping spacetime. Contracts space in front, expands behind. Purely speculative.',
    technicalDetails: 'Creates a "warp bubble" that contracts spacetime ahead and expands behind. Ship never exceeds c locally, but effective speed is FTL. Requires exotic matter with negative mass-energy.',
    realWorldExamples: [
      'No examples - purely mathematical concept',
      'Star Trek inspiration (Eugene Roddenberry)',
      'Miguel Alcubierre\'s 1994 paper',
      'NASA Eagleworks (theoretical research only)'
    ],
    advantages: [
      'Faster-than-light travel (in theory)',
      'Reach any point in solar system near-instantly',
      'No time dilation for passengers',
      'Enables interstellar exploration'
    ],
    limitations: [
      'Requires exotic matter (negative mass - not known to exist)',
      'Energy requirements: mass-energy of Jupiter or more',
      'Causality violations (potential time paradoxes)',
      'No experimental validation',
      'May be physically impossible',
      'Hawking radiation could destroy the bubble'
    ],
    color: '#3498db',
    icon: '🌌'
  }
];

/**
 * Calculate travel time between two points given a propulsion system
 * @param distanceKm Distance in kilometers
 * @param propulsion Propulsion system to use
 * @param useFlipAndBurn Whether to use flip-and-burn deceleration (default: true)
 * @returns Travel time in seconds
 */
export function calculateTravelTime(distanceKm: number, propulsion: PropulsionData, useFlipAndBurn: boolean = true): number {
  // Special case for warp drive - essentially instantaneous
  if (propulsion.id === 'warp-drive') {
    // Add small delay for drama (1 second per AU for "warp calculation")
    return (distanceKm / CONSTANTS.AU_TO_KM) * 1;
  }

  // Special case for light speed - constant velocity at c
  if (propulsion.id === 'light-speed') {
    // Time = distance / speed (speed of light)
    return distanceKm / CONSTANTS.SPEED_OF_LIGHT;
  }

  const { maxSpeed, acceleration } = propulsion;
  const maxSpeedKmPerSec = maxSpeed;
  const accelKmPerSecSq = acceleration / 1000; // Convert m/s² to km/s²

  // For very low thrust systems (ion, solar sail), assume constant velocity
  if (acceleration < 0.001) {
    // Time = distance / speed
    return distanceKm / maxSpeedKmPerSec;
  }

  // For higher thrust systems, use acceleration phase + cruise + optional deceleration
  // Time to reach max speed: v = at, so t = v/a
  const timeToMaxSpeed = maxSpeedKmPerSec / accelKmPerSecSq;

  // Distance covered during acceleration: d = 0.5 * a * t²
  const accelDistance = 0.5 * accelKmPerSecSq * timeToMaxSpeed * timeToMaxSpeed;

  // If flip-and-burn is disabled or propulsion doesn't support it, skip deceleration
  if (!useFlipAndBurn || !propulsion.supportsFlipAndBurn) {
    // Accelerate to max speed, then coast (no deceleration)
    if (distanceKm <= accelDistance) {
      // Trip is shorter than acceleration distance
      // d = 0.5 * a * t², solve for t: t = sqrt(2d/a)
      return Math.sqrt(2 * distanceKm / accelKmPerSecSq);
    }

    // Otherwise: accel + cruise (no decel)
    const cruiseDistance = distanceKm - accelDistance;
    const cruiseTime = cruiseDistance / maxSpeedKmPerSec;
    return timeToMaxSpeed + cruiseTime;
  }

  // Flip-and-burn enabled: need same distance for deceleration
  const totalAccelDecelDistance = 2 * accelDistance;

  // If trip is shorter than accel+decel distance, we never reach max speed
  if (distanceKm <= totalAccelDecelDistance) {
    // Accelerate halfway, decelerate halfway
    const halfDistance = distanceKm / 2;
    // d = 0.5 * a * t², solve for t: t = sqrt(2d/a)
    const timeToMidpoint = Math.sqrt(2 * halfDistance / accelKmPerSecSq);
    return 2 * timeToMidpoint; // Double for decel phase
  }

  // Otherwise: accel + cruise + decel
  const cruiseDistance = distanceKm - totalAccelDecelDistance;
  const cruiseTime = cruiseDistance / maxSpeedKmPerSec;
  const totalTime = 2 * timeToMaxSpeed + cruiseTime;

  return totalTime;
}

/**
 * Calculate current speed during a journey
 * @param elapsedTime Time elapsed since journey start (seconds)
 * @param totalDistance Total journey distance (km)
 * @param propulsion Propulsion system
 * @param useFlipAndBurn Whether flip-and-burn deceleration is enabled (default: true)
 * @returns Current speed in km/s
 */
export function calculateCurrentSpeed(
  elapsedTime: number,
  totalDistance: number,
  propulsion: PropulsionData,
  useFlipAndBurn: boolean = true
): number {
  if (propulsion.id === 'warp-drive') {
    return propulsion.maxSpeed; // Instantaneous
  }

  if (propulsion.id === 'light-speed') {
    return CONSTANTS.SPEED_OF_LIGHT; // Constant at c
  }

  const { maxSpeed, acceleration } = propulsion;
  const accelKmPerSecSq = acceleration / 1000;

  // Low thrust systems reach max speed gradually
  if (acceleration < 0.001) {
    const timeToMaxSpeed = maxSpeed / accelKmPerSecSq;
    if (elapsedTime < timeToMaxSpeed) {
      return accelKmPerSecSq * elapsedTime;
    }
    return maxSpeed;
  }

  // Calculate acceleration phase duration
  const timeToMaxSpeed = maxSpeed / accelKmPerSecSq;
  const totalTime = calculateTravelTime(totalDistance, propulsion, useFlipAndBurn);

  // If flip-and-burn is disabled or not supported, no deceleration phase
  if (!useFlipAndBurn || !propulsion.supportsFlipAndBurn) {
    if (elapsedTime < timeToMaxSpeed) {
      // Acceleration phase
      return accelKmPerSecSq * elapsedTime;
    } else {
      // Cruise phase (no deceleration)
      return maxSpeed;
    }
  }

  // Flip-and-burn enabled
  const accelDistance = 0.5 * accelKmPerSecSq * timeToMaxSpeed * timeToMaxSpeed;
  const totalAccelDecelDistance = 2 * accelDistance;

  // Case 1: Trip is so short we never reach max speed (accelerate halfway, decelerate halfway)
  if (totalDistance <= totalAccelDecelDistance) {
    const halfTime = totalTime / 2;

    if (elapsedTime < halfTime) {
      // Acceleration phase
      return accelKmPerSecSq * elapsedTime;
    } else {
      // Deceleration phase - mirror of acceleration
      const decelTime = elapsedTime - halfTime;
      const peakSpeed = accelKmPerSecSq * halfTime; // Speed at midpoint
      const currentSpeed = peakSpeed - (accelKmPerSecSq * decelTime);
      return Math.max(0, currentSpeed);
    }
  }

  // Case 2: Trip has accel + cruise + decel phases
  const decelStartTime = totalTime - timeToMaxSpeed;

  if (elapsedTime < timeToMaxSpeed) {
    // Acceleration phase
    return accelKmPerSecSq * elapsedTime;
  } else if (elapsedTime < decelStartTime) {
    // Cruise phase
    return maxSpeed;
  } else {
    // Deceleration phase - slow down to 0 m/s
    const decelTime = elapsedTime - decelStartTime;
    const currentSpeed = maxSpeed - (accelKmPerSecSq * decelTime);
    // Ensure speed never goes negative and reaches exactly 0 at arrival
    return Math.max(0, currentSpeed);
  }
}

/**
 * Get current flight phase
 * @param elapsedTime Time elapsed since journey start (seconds)
 * @param totalDistance Total journey distance (km)
 * @param propulsion Propulsion system
 * @param useFlipAndBurn Whether flip-and-burn deceleration is enabled
 * @returns Current flight phase: 'accelerating', 'cruising', or 'decelerating'
 */
export function getFlightPhase(
  elapsedTime: number,
  totalDistance: number,
  propulsion: PropulsionData,
  useFlipAndBurn: boolean = true
): 'accelerating' | 'cruising' | 'decelerating' {
  if (propulsion.id === 'warp-drive' || propulsion.id === 'light-speed') {
    return 'cruising'; // Instantaneous or constant velocity
  }

  const { maxSpeed, acceleration } = propulsion;
  const accelKmPerSecSq = acceleration / 1000;

  // Low thrust systems
  if (acceleration < 0.001) {
    const timeToMaxSpeed = maxSpeed / accelKmPerSecSq;
    return elapsedTime < timeToMaxSpeed ? 'accelerating' : 'cruising';
  }

  // High thrust systems
  const timeToMaxSpeed = maxSpeed / accelKmPerSecSq;
  const totalTime = calculateTravelTime(totalDistance, propulsion, useFlipAndBurn);

  // If flip-and-burn is disabled, no deceleration phase
  if (!useFlipAndBurn || !propulsion.supportsFlipAndBurn) {
    return elapsedTime < timeToMaxSpeed ? 'accelerating' : 'cruising';
  }

  // Flip-and-burn enabled
  const accelDistance = 0.5 * accelKmPerSecSq * timeToMaxSpeed * timeToMaxSpeed;
  const totalAccelDecelDistance = 2 * accelDistance;

  // Short trip: never reach max speed
  if (totalDistance <= totalAccelDecelDistance) {
    const halfTime = totalTime / 2;
    return elapsedTime < halfTime ? 'accelerating' : 'decelerating';
  }

  // Normal trip: accel + cruise + decel
  const decelStartTime = totalTime - timeToMaxSpeed;

  if (elapsedTime < timeToMaxSpeed) {
    return 'accelerating';
  } else if (elapsedTime < decelStartTime) {
    return 'cruising';
  } else {
    return 'decelerating';
  }
}

/**
 * Calculate distance traveled at a given elapsed time
 * @param elapsedTime Time elapsed since journey start (seconds)
 * @param totalDistance Total journey distance (km)
 * @param propulsion Propulsion system
 * @param useFlipAndBurn Whether flip-and-burn deceleration is enabled
 * @returns Distance traveled in km
 */
export function calculateDistanceTraveled(
  elapsedTime: number,
  totalDistance: number,
  propulsion: PropulsionData,
  useFlipAndBurn: boolean = true
): number {
  if (propulsion.id === 'warp-drive' || propulsion.id === 'light-speed') {
    // Instant or constant velocity - linear progress
    const totalTime = calculateTravelTime(totalDistance, propulsion, useFlipAndBurn);
    const progress = Math.min(1, elapsedTime / totalTime);
    return totalDistance * progress;
  }

  const { maxSpeed, acceleration } = propulsion;
  const accelKmPerSecSq = acceleration / 1000;
  const totalTime = calculateTravelTime(totalDistance, propulsion, useFlipAndBurn);

  // Low thrust systems - approximate as linear
  if (acceleration < 0.001) {
    const progress = Math.min(1, elapsedTime / totalTime);
    return totalDistance * progress;
  }

  // High thrust systems with proper physics
  const timeToMaxSpeed = maxSpeed / accelKmPerSecSq;

  // No flip-and-burn: accel + cruise
  if (!useFlipAndBurn || !propulsion.supportsFlipAndBurn) {
    const accelDistance = 0.5 * accelKmPerSecSq * timeToMaxSpeed * timeToMaxSpeed;

    if (elapsedTime < timeToMaxSpeed) {
      // During acceleration: d = 0.5 * a * t²
      return 0.5 * accelKmPerSecSq * elapsedTime * elapsedTime;
    } else {
      // During cruise: accel distance + cruise distance
      const cruiseTime = elapsedTime - timeToMaxSpeed;
      return accelDistance + (maxSpeed * cruiseTime);
    }
  }

  // Flip-and-burn enabled
  const accelDistance = 0.5 * accelKmPerSecSq * timeToMaxSpeed * timeToMaxSpeed;
  const totalAccelDecelDistance = 2 * accelDistance;

  // Short trip: accelerate halfway, decelerate halfway
  if (totalDistance <= totalAccelDecelDistance) {
    const halfTime = totalTime / 2;

    if (elapsedTime < halfTime) {
      // Acceleration phase: d = 0.5 * a * t²
      return 0.5 * accelKmPerSecSq * elapsedTime * elapsedTime;
    } else {
      // Deceleration phase
      const decelTime = elapsedTime - halfTime;
      const peakSpeed = accelKmPerSecSq * halfTime;
      const halfDistance = totalDistance / 2;
      // Distance during decel = peakSpeed * t - 0.5 * a * t²
      const decelDistance = (peakSpeed * decelTime) - (0.5 * accelKmPerSecSq * decelTime * decelTime);
      return halfDistance + decelDistance;
    }
  }

  // Long trip: accel + cruise + decel
  const decelStartTime = totalTime - timeToMaxSpeed;

  if (elapsedTime < timeToMaxSpeed) {
    // Acceleration phase: d = 0.5 * a * t²
    return 0.5 * accelKmPerSecSq * elapsedTime * elapsedTime;
  } else if (elapsedTime < decelStartTime) {
    // Cruise phase
    const cruiseTime = elapsedTime - timeToMaxSpeed;
    return accelDistance + (maxSpeed * cruiseTime);
  } else {
    // Deceleration phase
    const cruiseDistance = totalDistance - totalAccelDecelDistance;
    const decelTime = elapsedTime - decelStartTime;
    // Distance during decel = maxSpeed * t - 0.5 * a * t²
    const decelDistance = (maxSpeed * decelTime) - (0.5 * accelKmPerSecSq * decelTime * decelTime);
    return accelDistance + cruiseDistance + decelDistance;
  }
}

/**
 * Format time duration to human-readable string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)} seconds`;
  }

  const minutes = seconds / 60;
  if (minutes < 60) {
    return `${Math.round(minutes)} minutes`;
  }

  const hours = minutes / 60;
  if (hours < 24) {
    return `${hours.toFixed(1)} hours`;
  }

  const days = hours / 24;
  if (days < 365) {
    return `${days.toFixed(1)} days`;
  }

  const years = days / 365.25;
  if (years < 1000) {
    return `${years.toFixed(1)} years`;
  }

  return `${(years / 1000).toFixed(1)} thousand years`;
}

/**
 * Get propulsion system by ID
 */
export function getPropulsionById(id: PropulsionType): PropulsionData | undefined {
  return PROPULSION_SYSTEMS.find(p => p.id === id);
}
