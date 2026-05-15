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
        <div className="text-gray-400">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-400">{error}</div>
      </div>
    )
  }

  if (lights.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400">照明データが見つかりません</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
      {lights.map((light) => (
        <LightCard key={light.id} light={light} />
      ))}
    </div>
  )
}

interface LightCardProps {
  light: Light
}

function LightCard({ light }: LightCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link href={`/lights/${light.id}`}>
      <div 
        className="light-card bg-gray-800 rounded-lg overflow-hidden cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="aspect-[4/3] relative bg-gray-700">
          <Image
            src={isHovered ? light.image_off : light.image_on}
            alt={`${light.name} - ${isHovered ? '消灯' : '点灯'}`}
            fill
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>
        <div className="p-4">
          <h3 className="font-noto font-medium text-white text-lg mb-1">
            {light.name}
          </h3>
          <p className="font-noto text-gray-400 text-sm">
            {light.location}
          </p>
        </div>
      </div>
    </Link>
  )
}