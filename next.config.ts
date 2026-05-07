import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
};

export default nextConfig;
