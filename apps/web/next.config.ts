import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpila i package sorgente del workspace (TS/TSX non pre-compilati).
  transpilePackages: ["@gmgroup/ui", "@gmgroup/lib"],
};

export default nextConfig;
