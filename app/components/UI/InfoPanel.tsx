'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/app/store/useStore';
import { PLANETS } from '@/app/data/planets';
import { getMoonsForPlanet } from '@/app/data/moons';
import { useLayout } from '@/app/lib/useLayout';
import { bodyColor } from '@/app/lib/focusBody';
import { IconClose, IconArrowRight } from './icons';
import styles from './InfoPanel.module.scss';

type Tab = 'overview' | 'orbit' | 'moons';

const KM_TO_MI = 0.621371;

export default function InfoPanel() {
  const layout = useLayout();
  const selectedPlanet = useStore((s) => s.selectedPlanet);
  const setSelectedPlanet = useStore((s) => s.setSelectedPlanet);
  const showInfoPanel = useStore((s) => s.showInfoPanel);
  const journeyStatus = useStore((s) => s.journeyStatus);
  const unitSystem = useStore((s) => s.unitSystem);
  // Tab + sheet state are remembered per body, so picking a new body resets to the overview.
  const [ui, setUi] = useState<{ body?: string; tab: Tab; expanded: boolean }>({ tab: 'overview', expanded: false });
  const current = ui.body === selectedPlanet?.name ? ui : { tab: 'overview' as Tab, expanded: false };
  const { tab, expanded } = current;
  const setTab = (t: Tab) => setUi({ ...current, body: selectedPlanet?.name, tab: t });
  const setExpanded = (e: boolean) => setUi({ ...current, body: selectedPlanet?.name, expanded: e });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === 'Escape' && t.tagName !== 'INPUT') setSelectedPlanet(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setSelectedPlanet]);

  if (!showInfoPanel || !selectedPlanet) return null;

  const body = selectedPlanet;
  const isMoon = 'parentPlanet' in body && !!body.parentPlanet;
  const moons = !isMoon ? getMoonsForPlanet(body.name) : [];
  const isMinor = body.type?.includes('Asteroid') || body.type?.includes('Dwarf');
  const imperial = unitSystem === 'imperial';

  const km = (v: number) =>
    imperial ? `${Math.round(v * KM_TO_MI).toLocaleString()} mi` : `${v.toLocaleString()} km`;
  const kms = (v: number) => (imperial ? `${(v * KM_TO_MI).toFixed(1)} mi/s` : `${v} km/s`);

  const planTrip = () => {
    const { setOrigin, setDestination, setJourneyStatus } = useStore.getState();
    setOrigin(PLANETS.find((p) => p.name === 'Earth') || PLANETS[2]);
    setDestination(body);
    setJourneyStatus('selecting-propulsion');
    setSelectedPlanet(null);
  };

  const subtitle = isMoon ? `Moon of ${body.parentPlanet}` : body.type;
  const keyStats: [string, string][] = [
    ['Diameter', km(body.diameter)],
    isMoon
      ? [`From ${body.parentPlanet}`, km((body as { distanceFromPlanet?: number }).distanceFromPlanet ?? 0)]
      : ['From Sun', `${body.distanceFromSun} AU`],
    ['Mass (Earth = 1)', String(body.mass)],
    body.moons !== undefined ? ['Moons', String(body.moons)] : ['Gravity', `${body.gravity} m/s²`],
  ];

  const orbitStats: [string, string][] = [
    [
      'Orbital period',
      isMoon
        ? `${body.orbitalPeriod.toFixed(2)} days`
        : isMinor
        ? `${body.orbitalPeriod.toFixed(2)} years`
        : `${body.orbitalPeriod.toLocaleString()} days`,
    ],
    ['Orbital speed', kms(body.orbitalSpeed)],
    ['Surface gravity', `${body.gravity} m/s²`],
  ];
  if (!isMoon && body.rotationPeriod !== undefined) {
    orbitStats.push([
      'Day length',
      isMinor ? `${Math.abs(body.rotationPeriod).toFixed(2)} hours` : `${Math.abs(body.rotationPeriod)} days`,
    ]);
  }
  if (isMoon && (body as { tidally_locked?: boolean }).tidally_locked) orbitStats.push(['Rotation', 'Tidally locked']);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'orbit', label: 'Orbit' },
    ...(moons.length ? [{ id: 'moons' as Tab, label: 'Moons' }] : []),
  ];

  const isSheet = layout === 'portrait';
  const keyStatsShown = isSheet ? keyStats.slice(0, 3) : keyStats;

  return (
    <aside
      className={`${styles.panel} ${styles[layout]} ${isSheet && expanded ? styles.expanded : ''}`}
      aria-label={`${body.name} details`}
    >
      {isSheet && (
        <button
          type="button"
          className={styles.grabber}
          aria-label={expanded ? 'Collapse details' : 'Expand details'}
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          <span />
        </button>
      )}

      <header className={styles.header}>
        {isSheet && <span className={styles.swatch} style={{ background: bodyColor(body.name) }} aria-hidden />}
        <div className={styles.titles}>
          {!isSheet && <span className={styles.eyebrow}>{subtitle}</span>}
          <h2>{body.name}</h2>
          {isSheet && <span className={styles.sub}>{subtitle}</span>}
        </div>
        <button type="button" className={styles.close} aria-label="Close details" onClick={() => setSelectedPlanet(null)}>
          <IconClose size={16} />
        </button>
      </header>

      <dl className={`${styles.stats} ${isSheet ? styles.stats3 : ''}`}>
        {keyStatsShown.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.tabs} role="tablist" aria-label="Detail sections">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.body} role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'overview' && (
          <>
            {body.atmosphere && body.atmosphere.length > 0 && (
              <section className={styles.section}>
                <h3>Atmosphere</h3>
                <ul className={styles.chips}>
                  {body.atmosphere.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </section>
            )}
            <section className={styles.section}>
              <h3>Facts</h3>
              <ul className={styles.facts}>
                {body.facts.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </section>
          </>
        )}

        {tab === 'orbit' && (
          <dl className={styles.rows}>
            {orbitStats.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {tab === 'moons' && (
          <table className={styles.moons}>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Diameter</th>
                <th scope="col">Orbit</th>
              </tr>
            </thead>
            <tbody>
              {moons.map((m) => (
                <tr key={m.name}>
                  <td>{m.name}</td>
                  <td>{km(m.diameter)}</td>
                  <td>{m.orbitalPeriod.toFixed(1)} d</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {journeyStatus === 'idle' && (
        <footer className={styles.footer}>
          <button type="button" className={styles.travel} onClick={planTrip}>
            Plan trip to {body.name} <IconArrowRight />
          </button>
        </footer>
      )}
    </aside>
  );
}
