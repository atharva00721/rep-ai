import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  httpAgentOptions: { keepAlive: false },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
