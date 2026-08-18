/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "amaken-realestate.com",
      },
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
};

module.exports = nextConfig;
