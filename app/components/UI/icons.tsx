// Stroke icons for the HUD. All decorative (aria-hidden); buttons carry their own labels.
import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 18): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
});

export const LogoMark = ({ size = 22, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden {...p}>
    <circle cx="14" cy="14" r="12.5" stroke="currentColor" strokeOpacity="0.35" />
    <path d="M14 7 L21 20 H7 Z" stroke="var(--accent-primary)" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

export const IconSearch = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></svg>
);
export const IconClose = ({ size, ...p }: P) => (
  <svg {...base(size)} strokeWidth={2} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const IconPlay = ({ size = 16, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}><path d="M7 4.5v15l13-7.5z" /></svg>
);
export const IconPause = ({ size = 16, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" />
  </svg>
);
export const IconCamFree = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4" /></svg>
);
export const IconCamShip = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M12 3l6 16-6-4-6 4z" /></svg>
);
export const IconCamPlanet = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M4 9V5a1 1 0 011-1h4M15 4h4a1 1 0 011 1v4M20 15v4a1 1 0 01-1 1h-4M9 20H5a1 1 0 01-1-1v-4" />
  </svg>
);
export const IconLayers = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 13l9 5 9-5" /></svg>
);
export const IconEye = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const IconEyeOff = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M17.9 17.9A10 10 0 0112 20c-7 0-10-8-10-8a18 18 0 015.1-5.9M9.9 4.2A9 9 0 0112 4c7 0 10 8 10 8a18 18 0 01-2.2 3.2" />
    <path d="M2 2l20 20" />
  </svg>
);
export const IconKeyboard = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="2.5" y="6" width="19" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" /></svg>
);
export const IconMore = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="6" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="18" cy="12" r="1.6" /></svg>
);
export const IconArrowRight = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} strokeWidth={2.2} {...p}><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
);
export const IconCalendar = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>
);

export const CAMERA_ICONS = {
  free: IconCamFree,
  'follow-spaceship': IconCamShip,
  'planet-focus': IconCamPlanet,
} as const;
