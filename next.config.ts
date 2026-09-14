import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Label files are uploaded to Vercel Blob through a Server Action (max 10MB).
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
