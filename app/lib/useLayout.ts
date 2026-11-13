'use client';

import { useEffect, useState } from 'react';

/**
 * Which HUD layout to render.
 * - desktop:   rail left, drawer right, control pill bottom-center
 * - landscape: phone on its side (short viewport) — same pieces, compacted
 * - portrait:  phone upright — time chip on top, bottom bar + bottom sheets
 */
export type HudLayout = 'desktop' | 'landscape' | 'portrait';

const PORTRAIT_QUERY = '(max-width: 640px) and (orientation: portrait)';
const LANDSCAPE_QUERY = '(max-height: 500px) and (orientation: landscape)';

function read(): HudLayout {
  if (typeof window === 'undefined') return 'desktop';
  if (window.matchMedia(PORTRAIT_QUERY).matches) return 'portrait';
  if (window.matchMedia(LANDSCAPE_QUERY).matches) return 'landscape';
  return 'desktop';
}

export function useLayout(): HudLayout {
  const [layout, setLayout] = useState<HudLayout>('desktop');

  useEffect(() => {
    const update = () => setLayout(read());
    update();
    const mqs = [window.matchMedia(PORTRAIT_QUERY), window.matchMedia(LANDSCAPE_QUERY)];
    mqs.forEach((mq) => mq.addEventListener('change', update));
    window.addEventListener('resize', update);
    return () => {
      mqs.forEach((mq) => mq.removeEventListener('change', update));
      window.removeEventListener('resize', update);
    };
  }, []);

  return layout;
}
