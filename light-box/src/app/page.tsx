import { LightGrid } from '@/components/LightGrid'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#545454]">
      {/* ヘッダー — 細い線で区切るミニマルスタイル */}
      <header className="px-6 pt-10 pb-6 border-b border-white/15">
        <div className="max-w-7xl mx-auto flex items-baseline justify-between">
          <h1 className="font-ciclo text-2xl text-white tracking-widest">
            light box
          </h1>
          <p className="font-noto text-[11px] text-white/40 tracking-widest">
            照明アーカイブ
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="px-6 py-10">
        <LightGrid />
      </main>
    </div>
  )
}
