/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
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
