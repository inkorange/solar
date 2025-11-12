import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            #initial-loader {
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              background: #000000;
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 9999;
            }
            #initial-loader-content {
              text-align: center;
              color: white;
              font-family: var(--font-geist-sans), sans-serif;
            }
            #initial-loader-spinner {
              width: 60px;
              height: 60px;
              border: 3px solid rgba(96, 165, 250, 0.2);
              border-top: 3px solid #60a5fa;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 20px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Initial loading screen - shows immediately before React hydrates */}
        <div id="initial-loader">
          <div id="initial-loader-content">
            <div id="initial-loader-spinner"></div>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>Loading Solar System...</div>
          </div>
        </div>

        {children}

        {/* Script to remove initial loader once React takes over */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Remove initial loader after a short delay to let React render
            setTimeout(function() {
              var loader = document.getElementById('initial-loader');
              if (loader) {
                loader.style.display = 'none';
              }
            }, 100);
          `
        }} />
      </body>
    </html>
  );
}
