import { LightGrid } from '@/components/LightGrid'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#545454]">
      {/* ヘッダー */}
      <header className="py-8 px-6 text-center">
        <h1 className="font-ciclo text-4xl md:text-5xl text-white tracking-wide">
          light box
        </h1>
      </header>

      {/* メインコンテンツ */}
      <main className="px-6 pb-12">
        <LightGrid />
      </main>
    </div>
  );
}
