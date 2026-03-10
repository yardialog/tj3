import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow all cross-origin requests in development
  allowedDevOrigins: ['*'],
};

export default nextConfig;
