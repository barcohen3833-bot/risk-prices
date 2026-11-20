import type { NextConfig } from 'next';

// Static export so the site can be hosted anywhere (Vercel, GitHub Pages, a zip for the client).
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
};
export default nextConfig;
