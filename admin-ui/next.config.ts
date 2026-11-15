import type { NextConfig } from 'next';

// Context path (e.g. /rqms). Empty string = served at the domain root. Fixed at build time.
const basePath = process.env.BASE_PATH ?? '';

const nextConfig: NextConfig = {
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  allowedDevOrigins: ['*.preview.emergentagent.com', '*.emergentagent.com', '*.emergent.host'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
};

export default nextConfig;
