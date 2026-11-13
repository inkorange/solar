'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { PlanetData } from '@/app/data/planets';
import { useStore } from '@/app/store/useStore';
import type { HudLayout } from '@/app/lib/useLayout';
import { useFocusBody } from '@/app/lib/useFocusBody';
import { ALL_BODIES, bodyDotSize } from '@/app/lib/focusBody';
import PlanetGlyph from './PlanetGlyph';
import { IconSearch, IconClose } from './icons';
import styles from './DestinationPicker.module.scss';

const GROUPS: { title: string; test: (b: PlanetData) => boolean }[] = [
  { title: 'Planets', test: (b) => b.type !== 'Natural Satellite' && b.type !== 'Dwarf Planet' },
  { title: 'Moons', test: (b) => b.type === 'Natural Satellite' },
  { title: 'Dwarf planets', test: (b) => b.type === 'Dwarf Planet' },
];

export default function DestinationPicker({ layout }: { layout: HudLayout }) {
  const setPickerOpen = useStore((s) => s.setPickerOpen);
  const selectedPlanet = useStore((s) => s.selectedPlanet);
  const focusBody = useFocusBody();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Don't pop the keyboard on phones; do focus search on desktop.
    if (layout === 'desktop') inputRef.current?.focus();
  }, [layout]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q ? ALL_BODIES.filter((b) => b.name.toLowerCase().includes(q)) : ALL_BODIES;
    return GROUPS.map((g) => ({ title: g.title, items: matches.filter(g.test) })).filter((g) => g.items.length);
  }, [query]);

  const first = groups[0]?.items[0];
  const isSheet = layout === 'portrait';

  return (
    <>
      {isSheet && <div className={styles.scrim} onClick={() => setPickerOpen(false)} aria-hidden />}
      <section
        className={`${styles.picker} ${isSheet ? styles.sheet : styles.panel}`}
        aria-label="Choose a destination"
        onKeyDown={(e) => {
          if (e.key === 'Escape') setPickerOpen(false);
        }}
      >
        {isSheet && (
          <div className={styles.grabber} aria-hidden>
            <span />
          </div>
        )}
        <div className={styles.searchRow}>
          <label className={styles.search}>
            <IconSearch size={16} />
            <span className={styles.srOnly}>Search destinations</span>
            <input
              ref={inputRef}
              type="search"
              placeholder="Search planets and moons"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && first) focusBody(first);
              }}
            />
          </label>
          <button type="button" className={styles.close} aria-label="Close" onClick={() => setPickerOpen(false)}>
            <IconClose size={16} />
          </button>
        </div>

        <div className={styles.scroll}>
          {groups.map((g) => (
            <div key={g.title} className={styles.group}>
              <h3 className={styles.groupTitle}>{g.title}</h3>
              <ul className={g.title === 'Planets' && isSheet ? styles.grid : styles.list}>
                {g.items.map((b) => (
                  <li key={b.name}>
                    <button
                      type="button"
                      className={styles.item}
                      aria-current={selectedPlanet?.name === b.name ? 'true' : undefined}
                      onClick={() => focusBody(b)}
                    >
                      <span className={styles.glyphCell}>
                        <PlanetGlyph
                          name={b.name}
                          size={g.title === 'Planets' && isSheet ? bodyDotSize(b, 32, 16) : bodyDotSize(b, 24, 12)}
                          spin={selectedPlanet?.name === b.name}
                        />
                      </span>
                      <span className={styles.name}>{b.name}</span>
                      <span className={styles.meta}>
                        {b.type === 'Natural Satellite' ? `of ${b.parentPlanet ?? 'Earth'}` : b.type}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {groups.length === 0 && <p className={styles.empty}>Nothing matches “{query}”.</p>}
        </div>
      </section>
    </>
  );
}
