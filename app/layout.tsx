import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Celestial Vehicle Propulsion Simulator",
  description: "Interactive 3D visualization exploring space travel through our solar system with different propulsion methods",
  keywords: ["space simulation", "solar system", "3D visualization", "propulsion", "astronomy", "education"],
  authors: [{ name: "Your Name" }],
  creator: "Your Name",
  publisher: "Your Name",
  metadataBase: new URL('https://yourdomain.com'), // Replace with your actual domain

  // Favicon - Next.js automatically serves favicon.ico from /app directory
  icons: {
    icon: '/favicon.jpg',
    apple: '/favicon.jpg',
  },

  // Open Graph metadata for social sharing
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yourdomain.com', // Replace with your actual domain
    siteName: 'Celestial Vehicle Propulsion Simulator',
    title: 'Celestial Vehicle Propulsion Simulator',
    description: 'Interactive 3D visualization exploring space travel through our solar system with different propulsion methods',
    images: [
      {
        url: '/favicon.jpg', // You may want to create a larger OG image (1200x630px recommended)
        width: 1200,
        height: 630,
        alt: 'Celestial Vehicle Propulsion Simulator',
      },
    ],
  },

  // Twitter Card metadata
  twitter: {
    card: 'summary_large_image',
    title: 'Celestial Vehicle Propulsion Simulator',
    description: 'Interactive 3D visualization exploring space travel through our solar system with different propulsion methods',
    images: ['/favicon.jpg'], // You may want to create a larger Twitter image (1200x675px recommended)
    creator: '@yourusername', // Replace with your Twitter handle
  },

  // Additional SEO
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Verification (add if needed)
  // verification: {
  //   google: 'your-google-verification-code',
  // },
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
