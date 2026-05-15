'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { getAllLights, deleteLight, toggleLightPublic, updateLight, uploadImage } from '@/lib/supabase'
import type { Light } from '@/types/lights'

type SpaceType = '屋内' | '屋外' | 'ライトアップ'

function isHeicFile(file: File) {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif')
  )
}

async function convertToJpeg(file: File): Promise<File> {
  if (!isHeicFile(file)) return file
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/convert-image', { method: 'POST', body: formData })
  if (!res.ok) throw new Error('HEIC変換に失敗しました')
  const blob = await res.blob()
  return new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' })
}

// ── インライン編集フォーム ──────────────────────────────

function LightEditForm({ light, onSave, onCancel }: {
  light: Light
  onSave: (updated: Light) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: light.name,
    location: light.location,
    shot_date: light.shot_date,
    category: light.category ?? '',
    role_memo: light.role_memo ?? '',
    space_type: light.space_type as SpaceType,
    is_public: light.is_public,
  })
  const [imageOn, setImageOn] = useState<File | null>(null)
  const [imageOff, setImageOff] = useState<File | null>(null)
  const [previewOn, setPreviewOn] = useState<string>(light.image_on)
  const [previewOff, setPreviewOff] = useState<string>(light.image_off)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const refOn = useRef<HTMLInputElement>(null)
  const refOff = useRef<HTMLInputElement>(null)

  const handleImageChange = (
    file: File | null,
    setter: (f: File | null) => void,
    previewSetter: (url: string) => void,
    fallback: string,
  ) => {
    setter(file)
    if (!file) { previewSetter(fallback); return }
    if (isHeicFile(file)) {
      previewSetter(fallback) // HEICはプレビューなし
    } else {
      previewSetter(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const ts = Date.now()
      let imageOnUrl = light.image_on
      let imageOffUrl = light.image_off

      if (imageOn) {
        const converted = await convertToJpeg(imageOn)
        const result = await uploadImage(converted, `${ts}_on_${converted.name}`)
        if (result.error) throw result.error
        imageOnUrl = result.url!
      }
      if (imageOff) {
        const converted = await convertToJpeg(imageOff)
        const result = await uploadImage(converted, `${ts}_off_${converted.name}`)
        if (result.error) throw result.error
        imageOffUrl = result.url!
      }

      const { data, error } = await updateLight(light.id, {
        ...form,
        category: form.category || null,
        role_memo: form.role_memo || null,
        image_on: imageOnUrl,
        image_off: imageOffUrl,
      })
      if (error) throw error
      onSave(data!)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-gray-700 space-y-4">
      {/* テキスト情報 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 font-noto block mb-1">照明の名前 *</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-gray-700 text-white text-sm rounded px-3 py-2 font-noto"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 font-noto block mb-1">場所 *</label>
          <input
            required
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full bg-gray-700 text-white text-sm rounded px-3 py-2 font-noto"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-400 font-noto block mb-1">撮影日 *</label>
          <input
            required
            type="date"
            value={form.shot_date}
            onChange={(e) => setForm({ ...form, shot_date: e.target.value })}
            className="w-full bg-gray-700 text-white text-sm rounded px-3 py-2 font-noto"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 font-noto block mb-1">空間タイプ *</label>
          <select
            value={form.space_type}
            onChange={(e) => setForm({ ...form, space_type: e.target.value as SpaceType })}
            className="w-full bg-gray-700 text-white text-sm rounded px-3 py-2 font-noto"
          >
            <option>屋内</option>
            <option>屋外</option>
            <option>ライトアップ</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 font-noto block mb-1">カテゴリ</label>
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full bg-gray-700 text-white text-sm rounded px-3 py-2 font-noto"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 font-noto block mb-1">役割メモ</label>
        <textarea
          value={form.role_memo}
          onChange={(e) => setForm({ ...form, role_memo: e.target.value })}
          className="w-full bg-gray-700 text-white text-sm rounded px-3 py-2 font-noto h-20 resize-none"
        />
      </div>

      {/* 写真差し替え */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 font-noto block mb-1">点灯写真（クリックで差し替え）</label>
          <div
            className="relative aspect-[4/3] bg-gray-700 rounded overflow-hidden cursor-pointer group"
            onClick={() => refOn.current?.click()}
          >
            <Image src={previewOn} alt="点灯" fill className="object-cover" unoptimized={!!imageOn} />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-noto">変更する</span>
            </div>
          </div>
          <input
            ref={refOn}
            type="file"
            accept="image/*,.heic,.heif"
            className="hidden"
            onChange={(e) => handleImageChange(e.target.files?.[0] ?? null, setImageOn, setPreviewOn, light.image_on)}
          />
          {imageOn && <p className="text-xs text-blue-400 mt-1 truncate font-noto">変更: {imageOn.name}</p>}
        </div>
        <div>
          <label className="text-xs text-gray-400 font-noto block mb-1">消灯写真（クリックで差し替え）</label>
          <div
            className="relative aspect-[4/3] bg-gray-700 rounded overflow-hidden cursor-pointer group"
            onClick={() => refOff.current?.click()}
          >
            <Image src={previewOff} alt="消灯" fill className="object-cover" unoptimized={!!imageOff} />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-noto">変更する</span>
            </div>
          </div>
          <input
            ref={refOff}
            type="file"
            accept="image/*,.heic,.heif"
            className="hidden"
            onChange={(e) => handleImageChange(e.target.files?.[0] ?? null, setImageOff, setPreviewOff, light.image_off)}
          />
          {imageOff && <p className="text-xs text-blue-400 mt-1 truncate font-noto">変更: {imageOff.name}</p>}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer text-sm font-noto text-gray-300">
        <input
          type="checkbox"
          checked={form.is_public}
          onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
          className="w-4 h-4 accent-green-400"
        />
        公開する
      </label>

      {error && <p className="text-red-400 text-sm font-noto">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-white text-gray-900 font-noto text-sm font-medium px-4 py-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {loading ? '保存中...' : '保存する'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-white font-noto text-sm px-4 py-2 rounded border border-gray-700 hover:border-gray-500 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}

// ── メインの照明リスト ──────────────────────────────

export function LightList() {
  const [lights, setLights] = useState<Light[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)

  const fetchLights = async () => {
    const { data } = await getAllLights()
    setLights(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchLights() }, [])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return
    const { error } = await deleteLight(id)
    if (error) { alert('削除に失敗しました: ' + error.message); return }
    setLights((prev) => prev.filter((l) => l.id !== id))
  }

  const handleToggle = async (id: number, current: boolean) => {
    await toggleLightPublic(id, !current)
    setLights((prev) => prev.map((l) => l.id === id ? { ...l, is_public: !current } : l))
  }

  const handleSave = (updated: Light) => {
    setLights((prev) => prev.map((l) => l.id === updated.id ? updated : l))
    setEditingId(null)
  }

  if (loading) return <p className="text-gray-400 text-sm font-noto">読み込み中...</p>
  if (lights.length === 0) return <p className="text-gray-400 text-sm font-noto">まだ照明が登録されていません</p>

  return (
    <div className="space-y-3">
      {lights.map((light) => (
        <div key={light.id} className="bg-gray-800 rounded-lg p-4">
          {/* 1行サマリー */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-12 relative rounded overflow-hidden flex-shrink-0 bg-gray-700">
              <Image src={light.image_on} alt={light.name} fill className="object-cover" />
            </div>

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

            {/* 編集ボタン */}
            <button
              onClick={() => setEditingId(editingId === light.id ? null : light.id)}
              className={`text-xs font-noto px-3 py-1 rounded border transition-colors flex-shrink-0 ${
                editingId === light.id
                  ? 'border-blue-400 text-blue-400 bg-blue-400/10'
                  : 'border-gray-600 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {editingId === light.id ? '閉じる' : '編集'}
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

          {/* インライン編集フォーム */}
          {editingId === light.id && (
            <LightEditForm
              light={light}
              onSave={handleSave}
              onCancel={() => setEditingId(null)}
            />
          )}
        </div>
      ))}
    </div>
  )
}
