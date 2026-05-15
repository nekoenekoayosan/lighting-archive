'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getLightById } from '@/lib/supabase'
import type { Light } from '@/types/lights'
import { LightDetail } from '@/components/LightDetail'

interface LightDetailClientProps {
  lightId: number
}

export function LightDetailClient({ lightId }: LightDetailClientProps) {
  const [light, setLight] = useState<Light | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchLight() {
      try {
        const { data, error } = await getLightById(lightId)
        if (error) throw error
        if (!data) {
          setError('照明が見つかりません')
          return
        }
        setLight(data)
      } catch (err) {
        setError('照明データの取得に失敗しました')
        console.error('Error fetching light:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLight()
  }, [lightId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-gray-400">読み込み中...</div>
      </div>
    )
  }

  if (error || !light) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || '照明が見つかりません'}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-noto transition-colors"
          >
            トップページに戻る
          </button>
        </div>
      </div>
    )
  }

  return <LightDetail light={light} />
}