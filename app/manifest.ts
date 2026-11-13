import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Delta-V · Solar System Propulsion Simulator',
    short_name: 'Delta-V',
    description: 'Pick a planet, choose an engine, and fly the trip on real orbital data.',
    start_url: '/',
    display: 'fullscreen',
    orientation: 'any',
    background_color: '#04060a',
    theme_color: '#04060a',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
