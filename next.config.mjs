/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['10.0.0.189', '127.0.0.1'],
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'd3bphourhbt2ew.cloudfront.net' },
    ],
  },
};

export default nextConfig;
