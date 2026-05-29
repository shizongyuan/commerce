/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/admin",
  assetPrefix: "/admin",
  images: {
    unoptimized: true,
    domains: ["placeholder.com", "via.placeholder.com", "localhost"],
  },
};

module.exports = nextConfig;