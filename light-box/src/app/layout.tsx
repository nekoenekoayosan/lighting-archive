import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

// Noto Sans JP for Japanese text
const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

// Ciclo Display は Adobe Fonts（Typekit）から読み込む（layout内のlinkタグ参照）

export const metadata: Metadata = {
  title: "light box — 照明アーカイブサイト",
  description: "光を消すことで、その照明が空間に何をしているかを見せるアーカイブサイト",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} h-full antialiased`}
    >
      <head>
        {/* Adobe Fonts（Typekit）から Ciclo Display を読み込む */}
        <link rel="stylesheet" href="https://use.typekit.net/bbq1sls.css" />
      </head>
      <body className="min-h-full flex flex-col bg-gray-900 text-white font-noto">{children}</body>
    </html>
  );
}
