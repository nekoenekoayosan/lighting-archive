import { notFound } from 'next/navigation'
import Link from 'next/link'
import { LightForm } from './LightForm'
import { LightList } from './LightList'

export default function AdminPage() {
  // 本番環境では404にする（管理画面はローカル限定）
  if (process.env.NODE_ENV === 'production') notFound()
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <header className="py-6 px-6 border-b border-gray-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="font-ciclo text-2xl tracking-wide">light box — 管理画面</h1>
          <Link href="/" className="text-gray-400 hover:text-white text-sm font-noto transition-colors">
            ← サイトに戻る
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-14">
        <section>
          <h2 className="font-noto text-lg font-bold mb-6 text-gray-200">照明を追加</h2>
          <LightForm />
        </section>
        <section>
          <h2 className="font-noto text-lg font-bold mb-6 text-gray-200">登録済みの照明</h2>
          <LightList />
        </section>
      </main>
    </div>
  )
}
