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
  const focusBody = useFocusBody();

  return (
    <>
      {layout !== 'portrait' && (
        <nav className={styles.rail} aria-label="Destinations">
          {/* Landscape has no top-left brand tile, so the mark sits atop the rail (static). */}
          {layout === 'landscape' && (
            <span className={styles.railLogo} role="img" aria-label="Delta-V">
              <LogoMark size={26} />
            </span>
          )}
          {/* Opens the full picker: search + moons + dwarf planets. */}
          <button
            type="button"
            className={`${styles.railButton} ${styles.searchButton}`}
            aria-label="Search all destinations, including moons and dwarf planets (/)"
            aria-expanded={pickerOpen}
            data-tip="Search · moons · dwarf planets"
            onClick={() => setPickerOpen(!pickerOpen)}
          >
            <IconSearch />
          </button>
          <span className={styles.divider} aria-hidden />
          {RAIL_BODIES.map((body) => {
            const size = bodyDotSize(body, layout === 'landscape' ? 20 : 26, layout === 'landscape' ? 10 : 13);
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
        <div className={styles.brand}>
          <DeltaVLogo height={30} />
        </div>
      )}

      {pickerOpen && <DestinationPicker layout={layout} />}
    </>
  );
}
