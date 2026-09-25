/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "amaken-realestate.com",
      },
    ],
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
};

module.exports = nextConfig;
