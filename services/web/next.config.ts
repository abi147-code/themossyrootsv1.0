import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_INVOICE_API_URL: process.env.NEXT_PUBLIC_INVOICE_API_URL,
  },
  async redirects() {
    return [
      {
        source: '/invoice-generator',
        destination: '/software/invoice-generator',
        permanent: true,
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
      {
        protocol: 'https',
        hostname: 'tmr-proxy.fly.dev',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
