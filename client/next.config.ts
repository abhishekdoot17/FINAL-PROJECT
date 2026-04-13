import type { NextConfig } from "next";

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '5001' },
      { protocol: 'https', hostname: '*.onrender.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${API}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
