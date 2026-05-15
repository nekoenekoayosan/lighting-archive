'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getPublicLights } from '@/lib/supabase'
import type { Light } from '@/types/lights'

export function LightGrid() {
  const [lights, setLights] = useState<Light[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLights() {
      try {
        const { data, error } = await getPublicLights()
        if (error) throw error
        setLights(data || [])
      } catch (err) {
        setError('照明データの取得に失敗しました')
        console.error('Error fetching lights:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLights()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="font-noto text-sm text-white/40 tracking-widest">読み込み中</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="font-noto text-sm text-red-400">{error}</p>
      </div>
    )
  }

  if (lights.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="font-noto text-sm text-white/40 tracking-widest">照明データが見つかりません</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 max-w-7xl mx-auto">
      {lights.map((light, index) => (
        <LightCard key={light.id} light={light} index={index} />
      ))}
    </div>
  )
}

interface LightCardProps {
  light: Light
  index: number
}

function LightCard({ light, index }: LightCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link href={`/lights/${light.id}`}>
      <div
        className="group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
      >
        {/* 写真 — カード背景なし、シャープな角 */}
        <div className="aspect-[4/3] relative overflow-hidden">
          <Image
            src={isHovered ? light.image_on : light.image_off}
            alt={`${light.name} - ${isHovered ? '点灯' : '消灯'}`}
            fill
            className="object-cover transition-opacity duration-500"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </div>

        {/* キャプション — 図録スタイル */}
        <div className="mt-2.5 border-t border-white/15 pt-2">
          <div className="flex items-baseline gap-2">
            <span className="font-noto text-[10px] text-white/35 tabular-nums tracking-wider">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="font-noto text-sm text-white/90 leading-snug">
              {light.name}
            </span>
          </div>
          <p className="font-noto text-[11px] text-white/45 mt-0.5 pl-5">
            {light.location}
          </p>
        </div>
      </div>
    </Link>
  )
}
