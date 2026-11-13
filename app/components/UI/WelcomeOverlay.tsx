'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useStore } from '@/app/store/useStore';
import { PLANETS } from '@/app/data/planets';
import { LogoMark, IconArrowRight } from './icons';
import styles from './WelcomeOverlay.module.scss';

export default function WelcomeOverlay() {
  const showWelcome = useStore((s) => s.showWelcome);
  const setShowWelcome = useStore((s) => s.setShowWelcome);
  const launchRef = useRef<HTMLButtonElement>(null);

  const launch = () => setShowWelcome(false);

  // Fly the Hail Mary: jump straight into propulsion selection with the Astrophage drive pre-picked.
  const flyHailMary = () => {
    const { setOrigin, setDestination, setJourneyStatus, setSuggestedPropulsion } = useStore.getState();
    const earth = PLANETS.find((p) => p.name === 'Earth') ?? PLANETS[2];
    const saturn = PLANETS.find((p) => p.name === 'Saturn') ?? PLANETS[6];
    setShowWelcome(false);
    setSuggestedPropulsion('astrophage-drive');
    setOrigin(earth);
    setDestination(saturn);
    setJourneyStatus('selecting-propulsion');
  };

  useEffect(() => {
    if (!showWelcome) return;
    launchRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') launch();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showWelcome]);

  if (!showWelcome) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="splash-title">
      <header className={styles.header}>
        <div className={styles.brand}>
          <LogoMark size={26} />
          <span>Delta-V</span>
        </div>
        <a className={styles.about} href="https://chriswest.tech" target="_blank" rel="noreferrer">
          About
        </a>
      </header>

      <main className={styles.hero}>
        <p className={styles.eyebrow}>Solar system propulsion simulator</p>
        <h1 id="splash-title" className={styles.title}>How long does it take to get there?</h1>
        <p className={styles.lede}>
          Pick a planet, choose an engine (anything from a chemical rocket to a warp drive), then fly the trip on real
          orbital data.
        </p>
        <div className={styles.actions}>
          <button ref={launchRef} type="button" className={styles.launch} onClick={launch}>
            Launch <IconArrowRight size={18} />
          </button>
          <button type="button" className={styles.secondary} onClick={flyHailMary}>
            Fly the Hail Mary
          </button>
          <span className={styles.hint}>
            or press <kbd>Enter</kbd>
          </span>
        </div>

        <button type="button" className={styles.newCard} onClick={flyHailMary}>
          <span className={styles.thumb}>
            <Image src="/project-hail-mary.jpg" alt="" width={64} height={64} />
          </span>
          <span className={styles.newText}>
            <span className={styles.newTitle}>
              <span className={styles.badge}>New</span> Astrophage Spin Drive
            </span>
            <span className={styles.newBody}>
              Constant 1.5 g, with a flip-and-burn at the midpoint. Fly the ship from Project Hail Mary.
            </span>
          </span>
        </button>
      </main>

      <footer className={styles.footer}>
        <ul className={styles.stats}>
          <li><strong>9</strong><span>propulsion systems</span></li>
          <li><strong>1× → 500k×</strong><span>time warp</span></li>
          <li><strong>Real</strong><span>orbits and travel times</span></li>
        </ul>
      </footer>
    </div>
  );
}
