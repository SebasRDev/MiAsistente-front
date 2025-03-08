import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin', 'firebase-admin/app', 'firebase-admin/auth'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Añadir fallbacks solo para el cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        process: require.resolve('process/browser'),
        path: require.resolve('path-browserify'),
        fs: false,
        os: require.resolve('os-browserify/browser'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
      };
    }
    
    return config;
  },
  crossOrigin: 'anonymous',
  compiler: {
    removeConsole: process.env.NEXT_PUBLIC_NODE_ENV === 'production',
  }
};

export default nextConfig;
