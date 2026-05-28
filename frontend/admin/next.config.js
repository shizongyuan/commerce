/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["placeholder.com", "via.placeholder.com", "localhost"],
  },
  assetPrefix: "/admin",
  basePath: "/admin",
};

module.exports = nextConfig;