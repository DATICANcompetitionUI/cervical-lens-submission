import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@cervical-lens/shared",
    "@cervical-lens/ui",
    "@cervical-lens/hooks",
  ],
};

export default nextConfig;
