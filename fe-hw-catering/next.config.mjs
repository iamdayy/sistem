/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'hw-catering.wahidev.my.id',
        port: '',
        pathname: '/images/**',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
