'use client';

import { PLANETS } from '@/app/data/planets';
import { useStore } from '@/app/store/useStore';
import { useLayout } from '@/app/lib/useLayout';
import { useFocusBody } from '@/app/lib/useFocusBody';
import { bodyDotSize } from '@/app/lib/focusBody';
import PlanetGlyph from './PlanetGlyph';
import { IconSearch, IconMore, LogoMark } from './icons';
import { DeltaVLogo } from './Brand';
import DestinationPicker from './DestinationPicker';
import styles from './Navigation.module.scss';

// The eight planets get a permanent spot on the rail; everything else lives in the picker.
const RAIL_BODIES = PLANETS.filter((p) => p.type !== 'Natural Satellite' && p.type !== 'Dwarf Planet');

/**
 * Destinations.
 * - desktop / landscape: slim icon rail on the left + a picker panel beside it
 * - portrait: no rail (the bottom bar opens the picker as a sheet)
 */
export default function Navigation() {
  const layout = useLayout();
  const selectedPlanet = useStore((s) => s.selectedPlanet);
  const pickerOpen = useStore((s) => s.pickerOpen);
  const setPickerOpen = useStore((s) => s.setPickerOpen);
  const setShowWelcome = useStore((s) => s.setShowWelcome);
  const focusBody = useFocusBody();

  return (
    <>
      {layout !== 'portrait' && (
        <nav className={styles.rail} aria-label="Destinations">
          {layout === 'landscape' ? (
            <button
              type="button"
              className={styles.railButton}
              aria-label="All destinations and search"
              aria-expanded={pickerOpen}
              onClick={() => setPickerOpen(!pickerOpen)}
            >
              <LogoMark size={28} />
            </button>
          ) : (
            <button
              type="button"
              className={styles.railButton}
              aria-label="Search destinations (/)"
              aria-expanded={pickerOpen}
              data-tip="Search  /"
              onClick={() => setPickerOpen(!pickerOpen)}
            >
              <IconSearch />
            </button>
          )}
          <span className={styles.divider} aria-hidden />
          {RAIL_BODIES.map((body) => {
            const size = bodyDotSize(body, layout === 'landscape' ? 22 : 26, layout === 'landscape' ? 11 : 13);
            return (
              <button
                key={body.name}
                type="button"
                className={styles.railPlanet}
                aria-label={body.name}
                aria-current={selectedPlanet?.name === body.name ? 'true' : undefined}
                data-tip={body.name}
                onClick={() => focusBody(body)}
              >
                <PlanetGlyph name={body.name} size={size} spin={selectedPlanet?.name === body.name} />
              </button>
            );
          })}
          {layout === 'desktop' && (
            <>
              <span className={styles.divider} aria-hidden />
              <button
                type="button"
                className={styles.railButton}
                aria-label="Moons and dwarf planets"
                data-tip="Moons & dwarf planets"
                onClick={() => setPickerOpen(!pickerOpen)}
              >
                <IconMore />
              </button>
            </>
          )}
        </nav>
      )}

      {layout === 'desktop' && (
        <button type="button" className={styles.brand} onClick={() => setShowWelcome(true)} aria-label="Delta-V, back to start screen">
          <DeltaVLogo height={30} alt="" />
        </button>
      )}

      {pickerOpen && <DestinationPicker layout={layout} />}
    </>
  );
}
