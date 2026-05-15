'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Light } from '@/types/lights'
import { PhysicalSwitch } from '@/components/PhysicalSwitch'

interface LightDetailProps {
  light: Light
}

export function LightDetail({ light }: LightDetailProps) {
  const [isLightOn, setIsLightOn] = useState(true)
  // サーバーとクライアントで値が違うハイドレーションエラーを防ぐため useEffect 内で決定する
  const [showGif, setShowGif] = useState(false)

  useEffect(() => {
    setShowGif(!!light.image_gif && Math.random() > 0.7)
  }, [light.image_gif])

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* ヘッダー */}
      <header className="py-6 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ←
          </Link>
          <Link 
            href="/" 
            className="font-ciclo text-2xl md:text-3xl text-white tracking-wide hover:text-gray-300 transition-colors"
          >
            light box
          </Link>
          <div className="w-8"></div> {/* 右側のスペース確保用 */}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 照明の詳細情報 */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="space-y-3">
                <h1 className="font-noto text-lg font-bold text-white mb-3">
                  {light.name}
                </h1>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-noto text-gray-400 mb-1">場所</p>
                    <p className="font-noto text-white">{light.location}</p>
                  </div>

                  <div>
                    <p className="font-noto text-gray-400 mb-1">カテゴリ</p>
                    <p className="font-noto text-white">{light.space_type}</p>
                  </div>

                  {light.category && (
                    <div>
                      <p className="font-noto text-gray-400 mb-1">分類</p>
                      <p className="font-noto text-white">{light.category}</p>
                    </div>
                  )}

                  {light.role_memo && (
                    <div>
                      <p className="font-noto text-gray-400 mb-1">空間における役割</p>
                      <p className="font-noto text-white leading-relaxed text-xs">
                        {light.role_memo}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 照明の写真とスイッチ */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <div className="relative">
                {/* メイン写真 */}
                <div className="aspect-[4/3] relative bg-gray-800 rounded-lg overflow-hidden mb-6">
                  {showGif && light.image_gif ? (
                    // 時々GIFを表示（30%の確率で）
                    <Image
                      src={light.image_gif}
                      alt={`${light.name} - GIF`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      unoptimized // GIF用
                    />
                  ) : (
                    <Image
                      src={isLightOn ? light.image_on : light.image_off}
                      alt={`${light.name} - ${isLightOn ? '点灯' : '消灯'}`}
                      fill
                      className="object-cover transition-all duration-500"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                  )}
                </div>

                {/* 物理スイッチ */}
                <div className="flex justify-end">
                  <PhysicalSwitch 
                    isOn={isLightOn} 
                    onChange={setIsLightOn} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}