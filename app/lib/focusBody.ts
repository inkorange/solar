import { PLANETS, DWARF_PLANETS, SCALE_FACTORS, PlanetData } from '@/app/data/planets';
import { calculateCelestialBodyPosition } from '@/app/lib/orbital-mechanics';
import type { ScaleMode } from '@/app/store/useStore';

export const ALL_BODIES: PlanetData[] = [...PLANETS, ...DWARF_PLANETS];

/** Display colour for each body's dot in the rail / picker. */
export const BODY_COLORS: Record<string, string> = {
  Mercury: '#A7A7A7',
  Venus: '#E3C07A',
  Earth: '#4F8FDB',
  Moon: '#BEBEBE',
  Mars: '#C8553D',
  Jupiter: '#D3A26B',
  Saturn: '#E2C98A',
  Uranus: '#8FD3DB',
  Neptune: '#5578E0',
  Pluto: '#C9B39A',
  Eris: '#D9D9D9',
  Haumea: '#E8E8E8',
  Makemake: '#C98F6B',
};

export const bodyColor = (name: string) => BODY_COLORS[name] ?? '#9AA4B4';

/** Relative dot size (px) so the rail hints at real scale without getting silly. */
export function bodyDotSize(body: PlanetData, max = 16, min = 7): number {
  const ratio = Math.log10(body.diameter / 2000) / Math.log10(142984 / 2000);
  return Math.round(min + (max - min) * Math.max(0, Math.min(1, ratio)));
}

/**
 * Camera position that frames a body nicely.
 * (Lifted unchanged from the old Navigation component so the framing feels the same.)
 */
export function cameraPositionFor(
  body: PlanetData,
  simulationTime: number,
  scaleMode: ScaleMode
): [number, number, number] {
  const scaleFactor = scaleMode === 'visual' ? SCALE_FACTORS.VISUAL : SCALE_FACTORS.REALISTIC;
  const position = calculateCelestialBodyPosition(
    simulationTime,
    body,
    scaleFactor.DISTANCE,
    ALL_BODIES,
    scaleMode
  );

  const planetRadius = (body.diameter / 12742) * scaleFactor.SIZE * 5;
  const planetDiameter = planetRadius * 2;
  const fovRadians = (60 * Math.PI) / 180;
  const jupiterDiameter = (142984 / 12742) * scaleFactor.SIZE * 5 * 2;
  const sizeRatio = Math.min(planetDiameter / jupiterDiameter, 1);
  const distanceMultiplier = 1 + 20 * Math.pow(1 - sizeRatio, 1.2);
  const viewportFill = 0.15 + 0.1 * sizeRatio;
  const baseDistance = planetDiameter / (viewportFill * 2 * Math.tan(fovRadians / 2));
  let cameraDistance = baseDistance / distanceMultiplier;

  const visualRadius =
    body.hasRings && body.ringData ? planetRadius * body.ringData.outerRadiusRatio : planetRadius;
  const safetyMultiplier = 3 + 3 * (1 - sizeRatio);
  cameraDistance = Math.max(cameraDistance, visualRadius * safetyMultiplier);

  const angle = Math.PI / 4;
  return [
    position.x + cameraDistance * Math.cos(angle),
    position.y + cameraDistance * 0.3,
    position.z + cameraDistance * Math.sin(angle),
  ];
}
