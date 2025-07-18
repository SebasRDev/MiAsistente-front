import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  crossOrigin: 'anonymous',
  compiler: {
    removeConsole: process.env.NEXT_PUBLIC_NODE_ENV === 'production',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
