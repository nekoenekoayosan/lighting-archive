import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        // Supabase Storageの画像を許可する
        protocol: "https",
        hostname: "ipkdxqfdacdsjavxtfnu.supabase.co",
      },
    ],
  },
};

export default nextConfig;
