import type { CSSProperties } from 'react';
import { bodyColor } from '@/app/lib/focusBody';
import styles from './PlanetGlyph.module.scss';

// Same equirectangular maps the 3D scene uses (already preloaded, so these come from cache).
const TEXTURES: Record<string, string> = {
  Mercury: '/textures/mercury.jpg',
  Venus: '/textures/venus.jpg',
  Earth: '/textures/earth.jpg',
  Moon: '/textures/moon.jpg',
  Mars: '/textures/mars.jpg',
  Jupiter: '/textures/jupiter.jpg',
  Saturn: '/textures/saturn.jpg',
  Uranus: '/textures/uranus.jpg',
  Neptune: '/textures/neptune.jpg',
  Pluto: '/textures/pluto.jpg',
};

// Axial tilt (deg) so Uranus lies on its side and Saturn's rings sit at a believable angle.
const TILT: Record<string, number> = { Saturn: -22, Uranus: -82, Earth: -23, Neptune: -28, Mars: -25 };

/**
 * A small, lit, slowly-turning planet: the real texture wrapped on a circle, with
 * a soft terminator + limb shading on top. Saturn gets its rings.
 */
export default function PlanetGlyph({
  name,
  size,
  spin = false,
}: {
  name: string;
  size: number;
  spin?: boolean;
}) {
  const texture = TEXTURES[name];
  const tilt = TILT[name] ?? 0;
  const ringed = name === 'Saturn';

  const sphere: CSSProperties = {
    width: size,
    height: size,
    backgroundColor: bodyColor(name),
    backgroundImage: texture ? `url(${texture})` : undefined,
    transform: `rotate(${tilt}deg)`,
    fontSize: size, // shading below is sized in em = diameter
  };

  return (
    <span
      className={`${styles.glyph} ${spin ? styles.spin : ''}`}
      style={{ width: ringed ? size * 2.1 : size, height: size }}
      aria-hidden
    >
      {ringed && <span className={`${styles.ring} ${styles.ringBack}`} style={ringStyle(size, tilt)} />}
      <span className={styles.sphere} style={sphere} />
      {ringed && <span className={`${styles.ring} ${styles.ringFront}`} style={ringStyle(size, tilt)} />}
    </span>
  );
}

function ringStyle(size: number, tilt: number): CSSProperties {
  return {
    width: size * 2.1,
    height: size * 2.1,
    transform: `translate(-50%, -50%) rotate(${tilt}deg) scaleY(0.28)`,
  };
}
