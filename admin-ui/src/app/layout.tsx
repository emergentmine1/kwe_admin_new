import type { Metadata, Viewport } from 'next';
import { Inter, Roboto_Condensed } from 'next/font/google';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import { NonceRegistrar } from '@/components/common/NonceRegistrar';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const condensed = Roboto_Condensed({ subsets: ['latin'], variable: '--font-roboto-condensed', display: 'swap' });

export const metadata: Metadata = {
  title: 'KWE · Rate & Quote Management',
  description: 'KWE Instant Quote Admin — pricing matrix, leads and quotes.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0B2545' };

// Reading the request headers makes every page dynamic, so each response carries a fresh CSP nonce.
export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  await headers();
  return (
    <html lang="en" className={`${inter.variable} ${condensed.variable}`}>
      <body>
        <NonceRegistrar />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
