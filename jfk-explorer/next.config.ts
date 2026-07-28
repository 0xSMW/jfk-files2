import type { NextConfig } from "next";
import path from "path";

const threePath = path.resolve("./node_modules/.pnpm/three@0.185.1/node_modules/three");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.34"],
  turbopack: {
    resolveAlias: {
      three: "three",
    },
  },
  webpack: (config) => {
    // Force all three.js imports to resolve to the same version (0.185.1)
    // Fixes "three.Timer is not a constructor" caused by multiple three.js versions
    // (three-pathfinding pulls in older three@0.164.1 via aframe-extras chain)
    config.resolve.alias = {
      ...config.resolve.alias,
      three: threePath,
    };
    return config;
  },
};

export default nextConfig;
