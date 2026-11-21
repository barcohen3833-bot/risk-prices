import type { Metadata } from "next";
import { Playfair_Display, Frank_Ruhl_Libre, Heebo } from "next/font/google";
import "./globals.css";
import { product } from "@/lib/store";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", weight: ["400"], style: ["normal", "italic"] });
const frank = Frank_Ruhl_Libre({ subsets: ["hebrew", "latin"], variable: "--font-frank", weight: ["400", "500"] });
const heebo = Heebo({ subsets: ["hebrew", "latin"], variable: "--font-heebo", weight: ["300", "400", "500"] });

export const metadata: Metadata = {
  title: `${product.brand} ${product.name} | ${product.type}`,
  description: product.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${playfair.variable} ${frank.variable} ${heebo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
