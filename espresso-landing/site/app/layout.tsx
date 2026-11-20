import type { Metadata } from 'next';
import { Heebo, Frank_Ruhl_Libre } from 'next/font/google';
import { brand } from './brand';
import './globals.css';

const body = Heebo({ subsets: ['hebrew', 'latin'], weight: ['300', '400', '500'], variable: '--font-body' });
const display = Frank_Ruhl_Libre({ subsets: ['hebrew', 'latin'], weight: ['400', '500'], variable: '--font-display' });

export const metadata: Metadata = { title: brand.title, description: brand.description };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${body.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
