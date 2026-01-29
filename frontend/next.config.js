/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'climatecnologia.cl',
      },
    ],
    unoptimized: true,
  },
};

module.exports = nextConfig;
