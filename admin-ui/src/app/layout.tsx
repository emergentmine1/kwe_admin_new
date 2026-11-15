import type { Metadata, Viewport } from 'next';
import { Inter, Roboto_Condensed } from 'next/font/google';
import type { ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const condensed = Roboto_Condensed({ subsets: ['latin'], variable: '--font-roboto-condensed', display: 'swap' });

export const metadata: Metadata = {
  title: 'KWE · Rate & Quote Management',
  description: 'KWE Instant Quote Admin — pricing matrix, leads and quotes.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0B2545' };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${condensed.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
