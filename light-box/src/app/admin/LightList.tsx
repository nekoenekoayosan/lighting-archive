'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getAllLights, deleteLight, toggleLightPublic } from '@/lib/supabase'
import type { Light } from '@/types/lights'

export function LightList() {
  const [lights, setLights] = useState<Light[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    const { data } = await getAllLights()
    setLights(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return
    await deleteLight(id)
    setLights((prev) => prev.filter((l) => l.id !== id))
  }

  const handleToggle = async (id: number, current: boolean) => {
    await toggleLightPublic(id, !current)
    setLights((prev) => prev.map((l) => l.id === id ? { ...l, is_public: !current } : l))
  }

  if (loading) return <p className="text-gray-400 text-sm font-noto">読み込み中...</p>
  if (lights.length === 0) return <p className="text-gray-400 text-sm font-noto">まだ照明が登録されていません</p>

  return (
    <div className="space-y-3">
      {lights.map((light) => (
        <div key={light.id} className="bg-gray-800 rounded-lg p-4 flex items-center gap-4">
          {/* サムネイル */}
          <div className="w-16 h-12 relative rounded overflow-hidden flex-shrink-0 bg-gray-700">
            <Image src={light.image_on} alt={light.name} fill className="object-cover" />
          </div>

          {/* 情報 */}
          <div className="flex-1 min-w-0">
            <p className="font-noto font-medium text-white truncate">{light.name}</p>
            <p className="font-noto text-gray-400 text-xs">{light.location}　{light.shot_date}</p>
          </div>

          {/* 公開トグル */}
          <button
            onClick={() => handleToggle(light.id, light.is_public)}
            className={`text-xs font-noto px-3 py-1 rounded-full border transition-colors flex-shrink-0 ${
              light.is_public
                ? 'border-green-500 text-green-400 hover:bg-green-500/10'
                : 'border-gray-600 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {light.is_public ? '公開中' : '非公開'}
          </button>

          {/* 削除 */}
          <button
            onClick={() => handleDelete(light.id, light.name)}
            className="text-gray-500 hover:text-red-400 transition-colors text-sm flex-shrink-0"
            aria-label="削除"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
