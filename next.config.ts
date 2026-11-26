import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  serverExternalPackages: ["mathjax-full", "pdfjs-dist"],
  experimental: {
    proxyClientMaxBodySize: "25mb",
  },
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.159.1",
    "192.168.*",
  ],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
