import { Metadata } from 'next';
import { site } from './site';

const pageTitle = `${site.name} - Full Stack Developer`;
const pageDescription = `${site.tagline} Specializing in React, Next.js, and modern web tooling.`;

export const siteMetadata: Metadata = {
  title: {
    default: pageTitle,
    template: `%s | ${site.name}`,
  },
  description: pageDescription,
  keywords: [
    site.name,
    'Web Developer',
    'Frontend Developer',
    'Full Stack Developer',
    'Next.js',
    'React',
    'JavaScript',
    'MERN Stack',
    'Portfolio',
  ],
  authors: [
    {
      name: site.name,
    },
  ],
  creator: site.name,
  metadataBase: new URL(site.url),
  alternates: {
    canonical: './',
  },
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: site.url,
    siteName: `${site.name} Portfolio`,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: pageTitle,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};
