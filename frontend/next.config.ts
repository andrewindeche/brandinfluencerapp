import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:4000',
  },
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
};

export default nextConfig;
