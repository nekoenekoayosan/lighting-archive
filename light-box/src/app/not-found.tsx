import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-ciclo text-6xl text-white mb-4">404</h1>
        <p className="font-noto text-gray-400 text-lg mb-8">お探しの照明が見つかりません</p>
        <Link
          href="/"
          className="inline-block bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-noto transition-colors"
        >
          トップページに戻る
        </Link>
      </div>
    </div>
  )
}