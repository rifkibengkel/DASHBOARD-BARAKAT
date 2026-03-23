import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",

  // Fixed Build ID dari environment variable
  generateBuildId: async () => {
    return process.env.BUILD_ID || "prod-stable-v1";
  },

  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
