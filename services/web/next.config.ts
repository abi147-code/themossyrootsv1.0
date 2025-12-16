import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_INVOICE_API_URL: process.env.NEXT_PUBLIC_INVOICE_API_URL,
  },
  async rewrites() {
    return [
      {
        source: '/invoice-generator',
        destination: 'https://tmr-proxy.fly.dev/invoice-generator/',
      },
      {
        source: '/invoice-generator/:path*',
        destination: 'https://tmr-proxy.fly.dev/invoice-generator/:path*',
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'tmr-api.fly.dev',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
