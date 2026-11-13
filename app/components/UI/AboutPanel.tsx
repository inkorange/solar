'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useStore } from '@/app/store/useStore';
import { DeltaVLogo, InkOrangeCredit } from './Brand';
import { SHORTCUTS } from './Controls';
import {
  IconClose,
  IconPause,
  IconCalendar,
  IconCamFree,
  IconCamShip,
  IconCamPlanet,
  IconLayers,
  IconSearch,
  IconEyeOff,
  IconInfo,
} from './icons';
import styles from './AboutPanel.module.scss';

const STEPS = [
  {
    img: '/about/picker.webp',
    w: 700,
    h: 1000,
    title: 'Pick a destination',
    body: 'Tap a planet on the rail at the left. The search button at the top of the rail finds moons and dwarf planets too. On a phone, tap Destinations at the bottom.',
  },
  {
    img: '/about/info.webp',
    w: 560,
    h: 1179,
    title: 'Read up on it',
    body: 'The camera flies in and the info panel opens: key stats, its orbit, its largest moons and a few facts. When you’re ready, tap Plan trip.',
  },
  {
    img: '/about/engines.webp',
    w: 1200,
    h: 1069,
    title: 'Choose an engine',
    body: 'Every engine shows its real travel time for this trip, from a chemical rocket to a warp drive. Change where you start from, and leave Flip & burn on to slow down and stop at the target (off to fly past it). Then Launch.',
  },
  {
    img: '/about/journey.webp',
    w: 560,
    h: 1043,
    title: 'Fly the trip',
    body: 'Watch your speed, the distance left and the time remaining. Switch the view to Ship to ride along, and speed up time to get there faster. Abort any time.',
  },
];

const CONTROLS: { icon: React.ReactNode; name: string; keys?: string; body: string }[] = [
  { icon: <IconPause size={16} />, name: 'Play / pause', keys: 'Space', body: 'Freeze or resume the solar system.' },
  { icon: <IconCalendar size={18} />, name: 'Date', body: 'Jump to any date between 1900 and 2100, or back to now.' },
  { icon: <span className={styles.speedGlyph}>1×</span>, name: 'Time speed', keys: '1 – 5', body: 'Run time from real-time up to 500,000×.' },
  { icon: <IconCamFree size={18} />, name: 'Free view', keys: 'C', body: 'Drag to orbit, scroll or pinch to zoom.' },
  { icon: <IconCamShip size={18} />, name: 'Ship view', keys: 'C', body: 'Ride behind your spacecraft during a trip.' },
  { icon: <IconCamPlanet size={18} />, name: 'Planet view', keys: 'C', body: 'Fly in close and follow the selected planet.' },
  { icon: <IconLayers size={18} />, name: 'Layers', keys: 'O · L · F', body: 'Orbits, labels, FPS meter and km / miles.' },
  { icon: <IconSearch size={18} />, name: 'Search', keys: '/ or ⌘K', body: 'Find any planet, moon or dwarf planet.' },
  { icon: <IconEyeOff size={18} />, name: 'Hide interface', keys: 'H', body: 'Just the view. The eye button brings it back.' },
  { icon: <IconInfo size={18} />, name: 'About & how to use', body: 'Reopen this guide: top-right on desktop, or in the Layers menu.' },
];

export default function AboutPanel() {
  const aboutOpen = useStore((s) => s.aboutOpen);
  const setAboutOpen = useStore((s) => s.setAboutOpen);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aboutOpen) return;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAboutOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aboutOpen, setAboutOpen]);

  if (!aboutOpen) return null;

  return (
    <>
      <div className={styles.scrim} onClick={() => setAboutOpen(false)} aria-hidden />
      <div className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="about-title">
        <header className={styles.header}>
          <DeltaVLogo height={40} />
          <button ref={closeRef} type="button" className={styles.close} aria-label="Close" onClick={() => setAboutOpen(false)}>
            <IconClose size={18} />
          </button>
        </header>

        <div className={styles.body}>
          <section className={styles.intro}>
            <h2 id="about-title">Chart a course across the solar system.</h2>
            <p>
              Delta-V is a solar system propulsion simulator. Pick any planet, choose an engine and fly the trip on
              real astronomical data and orbital mechanics. You’ll see why a chemical rocket takes years to reach
              Saturn, and what it would take to get there in days.
            </p>
          </section>

          <section aria-labelledby="howto-title">
            <h3 id="howto-title" className={styles.sectionTitle}>How to use it</h3>
            <ol className={styles.steps}>
              {STEPS.map((s, i) => (
                <li key={s.title} className={styles.step}>
                  <figure className={styles.shot}>
                    <Image src={s.img} alt={`Screenshot: ${s.title}`} width={s.w} height={s.h} sizes="(max-width: 640px) 90vw, 260px" />
                  </figure>
                  <div className={styles.stepText}>
                    <span className={styles.stepNum}>{i + 1}</span>
                    <h4>{s.title}</h4>
                    <p>{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="controls-title">
            <h3 id="controls-title" className={styles.sectionTitle}>The controls</h3>
            <figure className={styles.pillShot}>
              <Image src="/about/pill.webp" alt="Screenshot: the control bar" width={1200} height={102} sizes="(max-width: 640px) 90vw, 760px" />
              <figcaption>The control bar along the bottom (on a phone, time sits at the top and the views just under it).</figcaption>
            </figure>
            <ul className={styles.controls}>
              {CONTROLS.map((c) => (
                <li key={c.name}>
                  <span className={styles.ctrlIcon} aria-hidden>{c.icon}</span>
                  <span className={styles.ctrlText}>
                    <span className={styles.ctrlName}>
                      {c.name}
                      {c.keys && <kbd>{c.keys}</kbd>}
                    </span>
                    <span className={styles.ctrlBody}>{c.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="phone-title" className={styles.phoneRow}>
            <figure className={styles.phoneShot}>
              <Image src="/about/phone.webp" alt="Screenshot: Delta-V on a phone" width={600} height={1021} sizes="180px" />
            </figure>
            <div>
              <h3 id="phone-title" className={styles.sectionTitle}>On your phone</h3>
              <p className={styles.para}>
                Everything works in portrait and landscape. In portrait, time controls sit at the top with the Free / Ship /
                Planet views under them. Destinations and planet details slide up from the bottom; tap the handle to
                expand a panel. During a trip, tap the progress strip to show or hide the details.
              </p>
            </div>
          </section>

          <section aria-labelledby="keys-title" className={styles.keysSection}>
            <h3 id="keys-title" className={styles.sectionTitle}>Keyboard shortcuts</h3>
            <dl className={styles.keys}>
              {SHORTCUTS.map(([k, v]) => (
                <div key={k}>
                  <dt><kbd>{k}</kbd></dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <footer className={styles.credits}>
            <InkOrangeCredit />
          </footer>
        </div>
      </div>
    </>
  );
}
