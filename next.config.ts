import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  // Allow cross-origin requests from preview domains
  allowedDevOrigins: [
    'preview-chat-e7e6bd11-74cd-408b-aea6-0f8833312902.space-z.ai',
    '*.space-z.ai',
    '*.space.z.ai',
  ],
  // The [[...slug]] catch-all route now handles all client-side paths
  // with proper server-side metadata generation for each route.
  // No SPA rewrite needed.
};

export default nextConfig;
