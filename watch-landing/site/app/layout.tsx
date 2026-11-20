import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400'], style: ['normal', 'italic'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Vérane Perpétuel 40',
  description: 'Vérane Perpétuel 40 in rose gold with a chocolate sunburst dial. Geneva, since 1905.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
