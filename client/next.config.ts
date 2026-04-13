import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '5001' },
      { protocol: 'https', hostname: '*.onrender.com' },
      { protocol: 'https', hostname: '*.vercel.app' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  async rewrites() {
    // Only add rewrites when a valid external backend URL is provided
    // In local dev — rewrites to localhost (Next.js handles it)
    // On Vercel — rewrites to production backend URL
    if (!BACKEND_URL || BACKEND_URL.trim() === '') {
      console.warn('⚠ BACKEND_URL not set — API rewrites disabled');
      return [];
    }
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
