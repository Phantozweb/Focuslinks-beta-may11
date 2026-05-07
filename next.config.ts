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
  // SPA rewrite: serve the root page for all client-side routes
  async rewrites() {
    return {
      beforeFiles: [
        // Skip API routes and static files, rewrite everything else to /
        {
          source: '/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|workbox-*).*)',
          destination: '/',
        },
      ],
    };
  },
};

export default nextConfig;
