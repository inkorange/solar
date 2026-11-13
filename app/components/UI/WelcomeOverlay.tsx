'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/app/store/useStore';
import { PLANETS } from '@/app/data/planets';
import { IconArrowRight } from './icons';
import { DeltaVLogo, InkOrangeCredit } from './Brand';
import styles from './WelcomeOverlay.module.scss';

const EXIT_MS = 1100;

export default function WelcomeOverlay() {
  const showWelcome = useStore((s) => s.showWelcome);
  const setShowWelcome = useStore((s) => s.setShowWelcome);
  const launchRef = useRef<HTMLButtonElement>(null);

  // Exit transition: the aurora fades, the copy zooms towards the viewer and dissolves, then the
  // splash unmounts and `after` runs. EXIT_MS must match the longest .leaving animation in the SCSS.
  const [leaving, setLeaving] = useState(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = (after?: () => void) => {
    if (exitTimer.current) return; // already leaving
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setLeaving(true);
    exitTimer.current = setTimeout(() => {
      exitTimer.current = null;
      setLeaving(false);
      setShowWelcome(false);
      after?.();
    }, reduced ? 250 : EXIT_MS);
  };

  useEffect(() => () => { if (exitTimer.current) clearTimeout(exitTimer.current); }, []);

  const launch = () => dismiss();

  // Fly the Hail Mary: jump straight into propulsion selection with the Astrophage drive pre-picked.
  const flyHailMary = () =>
    dismiss(() => {
      const { setOrigin, setDestination, setJourneyStatus, setSuggestedPropulsion } = useStore.getState();
      const earth = PLANETS.find((p) => p.name === 'Earth') ?? PLANETS[2];
      const saturn = PLANETS.find((p) => p.name === 'Saturn') ?? PLANETS[6];
      setSuggestedPropulsion('astrophage-drive');
      setOrigin(earth);
      setDestination(saturn);
      setJourneyStatus('selecting-propulsion');
    });

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
    <div className={`${styles.overlay} ${leaving ? styles.leaving : ''}`} role="dialog" aria-modal="true" aria-labelledby="splash-title">
      {/* Aurora: decorative colour wash behind the text, in front of the 3D scene */}
      <div className={styles.aurora} aria-hidden="true">
        <span /><span /><span /><span />
      </div>
      <header className={styles.header}>
        <div className={styles.brand}>
          <DeltaVLogo height={96} />
        </div>
        <div className={styles.headerRight}>
          <button type="button" className={styles.howLink} onClick={() => useStore.getState().setAboutOpen(true)}>
            How it works
          </button>
          <InkOrangeCredit />
        </div>
      </header>

      <main className={styles.hero}>
        <p className={styles.eyebrow}>Solar system propulsion simulator</p>
        <h1 id="splash-title" className={styles.title}>Chart a course across the solar system.</h1>
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

        <NewCard className={styles.inHero} onClick={flyHailMary} />
        <div className={styles.phoneCredit}>
          <InkOrangeCredit compact />
        </div>
      </main>

      <footer className={styles.footer}>
        <ul className={styles.stats}>
          <li><strong>9</strong><span>propulsion systems</span></li>
          <li><strong>1× → 500k×</strong><span>time warp</span></li>
          <li><strong>Real</strong><span>orbits and travel times</span></li>
        </ul>
        <NewCard className={styles.inFooter} onClick={flyHailMary} />
      </footer>
    </div>
  );
}

/** The "New: Astrophage Spin Drive" card. Rendered in the hero on phones and in the footer row on
 *  tablet/desktop, so it sits in normal flow next to the stats instead of floating over them. */
function NewCard({ className, onClick }: { className: string; onClick: () => void }) {
  return (
<button type="button" className={`${styles.newCard} ${className}`} onClick={onClick}>
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
  );
}
