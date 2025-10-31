import { createRequire } from "module";

import type { NextConfig } from 'next';

const require = createRequire(import.meta.url);
const packageJson = require("./package.json");

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
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
};

export default nextConfig;