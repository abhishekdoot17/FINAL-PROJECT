import type { NextConfig } from "next";

// BACKEND_URL is used server-side only (in next.config.ts) for rewrites.
// Set this in Vercel dashboard as: BACKEND_URL = https://your-render-url.onrender.com
// For local dev it falls back to localhost:5001
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '5001' },
      { protocol: 'https', hostname: '*.onrender.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  // Proxy all /api/* and /uploads/* through Next.js to the Express backend.
  // This means the frontend only ever needs ONE URL (Vercel domain).
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${BACKEND_URL}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
