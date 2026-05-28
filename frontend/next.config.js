// frontend/next.config.js
const isAdminBuild = process.env.NEXT_PUBLIC_APP_SECTION === "admin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    domains: ["placeholder.com", "via.placeholder.com", "localhost"],
  },
  ...(isAdminBuild ? {
    basePath: "/admin",
    assetPrefix: "/admin",
    distDir: "admin-out",
  } : {}),
};

module.exports = nextConfig;