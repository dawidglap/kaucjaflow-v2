// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Non bloccare il build su errori/warning ESLint
    ignoreDuringBuilds: true,
  },
  // Se vuoi (solo se serve) ignorare anche errori TypeScript a build:
  // typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
