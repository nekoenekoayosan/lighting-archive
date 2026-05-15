import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next.jsの画像最適化を無効化してSupabaseから直接読み込む
    unoptimized: true,
  },
};

export default nextConfig;
