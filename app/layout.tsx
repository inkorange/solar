import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GoogleTagManager from "./components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = 'https://solar.chriswest.tech';
const TITLE = 'Delta-V · Solar System Propulsion Simulator';
const DESCRIPTION =
  'Chart a course across the solar system. Pick a planet, choose an engine — chemical rocket to warp drive — and fly the trip on real orbital data.';

// Icons, Open Graph and Twitter images come from Next file conventions in /app:
// favicon.ico, icon.png, apple-icon.png, opengraph-image.jpg, twitter-image.jpg (+ manifest.ts).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: 'Delta-V',
  keywords: ['space simulation', 'solar system', '3D visualization', 'propulsion', 'delta-v', 'astronomy', 'education'],
  authors: [{ name: 'Chris West', url: 'https://chriswest.tech' }],
  creator: 'Chris West',
  publisher: 'inkOrange Studios',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Delta-V',
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
  appleWebApp: { title: 'Delta-V', statusBarStyle: 'black-translucent' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export const viewport: Viewport = {
  themeColor: '#04060a',
  colorScheme: 'dark',
  viewportFit: 'cover', // lets the HUD use safe-area insets on notched phones
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleTagManager />
        {children}
      </body>
    </html>
  );
}
