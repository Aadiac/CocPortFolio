/**
 * @license
 * Copyright (c) 2026 Your Name. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 * Project: Portfolio
 * Author: Your Name (yourhandle)
 * Website: https://your-domain.com
 */

import { Geist, Geist_Mono, Space_Grotesk, Instrument_Serif, Bungee } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import ClientLayout from './ClientLayout';
import { siteMetadata } from '@/lib/metadata';
import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics } from '@next/third-parties/google';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  preload: true,
  display: 'swap',
});
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  preload: true,
  display: 'swap',
});
const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  preload: true,
  display: 'swap',
});
const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  preload: true,
  display: 'swap',
});
const bungee = Bungee({
  variable: '--font-bungee',
  subsets: ['latin'],
  weight: '400',
  preload: true,
  display: 'swap',
});
const supercellMagic = localFont({
  src: './fonts/SupercellMagic-Regular.ttf',
  variable: '--font-supercell',
  weight: '400',
  preload: true,
  display: 'swap',
});
export const metadata = siteMetadata;
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${instrumentSerif.variable} ${bungee.variable} ${supercellMagic.variable} antialiased bg-cream`}
      >
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ClientLayout>{children}</ClientLayout>
        <Analytics />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}

