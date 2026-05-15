'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { addLight, uploadImage } from '@/lib/supabase'

// HEICかどうか判定
function isHeicFile(file: File) {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif')
  )
}

// HEICをサーバー側でJPEGに変換（送信時のみ呼ぶ）
async function convertToJpeg(file: File): Promise<File> {
  if (!isHeicFile(file)) return file

  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/convert-image', { method: 'POST', body: formData })
  if (!res.ok) throw new Error('HEIC変換に失敗しました')

  const blob = await res.blob()
  const jpegName = file.name.replace(/\.(heic|heif)$/i, '.jpg')
  return new File([blob], jpegName, { type: 'image/jpeg' })
}

type SpaceType = '屋内' | '屋外' | 'ライトアップ'

const defaultForm = {
  name: '',
  location: '',
  shot_date: '',
  category: '',
  role_memo: '',
  space_type: '屋内' as SpaceType,
  is_public: false,
}

export function LightForm() {
  const [form, setForm] = useState(defaultForm)
  const [imageOn, setImageOn] = useState<File | null>(null)
  const [imageOff, setImageOff] = useState<File | null>(null)
  const [imageGif, setImageGif] = useState<File | null>(null)
  const [previewOn, setPreviewOn] = useState<string | null>(null)
  const [previewOff, setPreviewOff] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const refOn = useRef<HTMLInputElement>(null)
  const refOff = useRef<HTMLInputElement>(null)
  const refGif = useRef<HTMLInputElement>(null)

  // ファイル選択：同期処理。HEICはプレビューなし、JPEGはblob URL
  const handleFile = (
    file: File | null,
    setter: (f: File | null) => void,
    previewSetter?: (url: string | null) => void,
  ) => {
    setter(file)
    if (!file || !previewSetter) return
    if (isHeicFile(file)) {
      // HEICはブラウザで表示できないのでnullのまま（送信時に変換）
      previewSetter(null)
    } else {
      previewSetter(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageOn || !imageOff) {
      setMessage({ type: 'error', text: '点灯・消灯の写真は必須です' })
      return
    }
    setLoading(true)
    setMessage(null)

    try {
      const ts = Date.now()
      // 送信時にHEIC変換 → アップロード
      const [convertedOn, convertedOff] = await Promise.all([
        convertToJpeg(imageOn),
        convertToJpeg(imageOff),
      ])
      const [onResult, offResult] = await Promise.all([
        uploadImage(convertedOn, `${ts}_on_${convertedOn.name}`),
        uploadImage(convertedOff, `${ts}_off_${convertedOff.name}`),
      ])
      if (onResult.error) throw new Error(`点灯画像のアップロードに失敗しました: ${onResult.error.message ?? onResult.error}`)
      if (offResult.error) throw new Error(`消灯画像のアップロードに失敗しました: ${offResult.error.message ?? offResult.error}`)

      let gifUrl: string | null = null
      if (imageGif) {
        const convertedGif = await convertToJpeg(imageGif)
        const gifResult = await uploadImage(convertedGif, `${ts}_gif_${convertedGif.name}`)
        if (gifResult.error) throw new Error('GIFのアップロードに失敗しました')
        gifUrl = gifResult.url
      }

      const { error } = await addLight({
        ...form,
        image_on: onResult.url!,
        image_off: offResult.url!,
        image_gif: gifUrl,
      })
      if (error) throw error

      setMessage({ type: 'success', text: '追加しました！' })
      setForm(defaultForm)
      setImageOn(null); setImageOff(null); setImageGif(null)
      setPreviewOn(null); setPreviewOff(null)
    } catch (err: unknown) {
      console.error('追加エラー:', err)
      const text = err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : '追加に失敗しました'
      setMessage({ type: 'error', text })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 space-y-5">
      {/* 写真アップロード */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ImageUploader
          label="点灯写真 *"
          file={imageOn}
          preview={previewOn}
          inputRef={refOn}
          accept="image/*,.heic,.heif"
          onChange={(f) => handleFile(f, setImageOn, setPreviewOn)}
        />
        <ImageUploader
          label="消灯写真 *"
          file={imageOff}
          preview={previewOff}
          inputRef={refOff}
          accept="image/*,.heic,.heif"
          onChange={(f) => handleFile(f, setImageOff, setPreviewOff)}
        />
      </div>

      <div>
        <label className="label">GIF（任意）</label>
        <input
          ref={refGif}
          type="file"
          accept="image/gif"
          className="text-sm text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600 cursor-pointer"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null, setImageGif)}
        />
        {imageGif && <p className="text-xs text-gray-400 mt-1">{imageGif.name}</p>}
      </div>

      {/* テキスト情報 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="照明の名前 *">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="例：大正ロマン喫茶 正面ペンダント" />
        </Field>
        <Field label="場所 *">
          <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input" placeholder="例：金沢市東山" />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="撮影日 *">
          <input required type="date" value={form.shot_date} onChange={(e) => setForm({ ...form, shot_date: e.target.value })} className="input" />
        </Field>
        <Field label="空間タイプ *">
          <select value={form.space_type} onChange={(e) => setForm({ ...form, space_type: e.target.value as SpaceType })} className="input">
            <option>屋内</option>
            <option>屋外</option>
            <option>ライトアップ</option>
          </select>
        </Field>
        <Field label="カテゴリ（任意）">
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input" placeholder="例：ペンダントライト" />
        </Field>
      </div>

      <Field label="空間における役割メモ（任意）">
        <textarea value={form.role_memo} onChange={(e) => setForm({ ...form, role_memo: e.target.value })} className="input h-24 resize-none" placeholder="この照明が空間に与えている効果・役割を書いてください" />
      </Field>

      <label className="flex items-center gap-2 cursor-pointer text-sm font-noto text-gray-300">
        <input type="checkbox" checked={form.is_public} onChange={(e) => setForm({ ...form, is_public: e.target.checked })} className="w-4 h-4 accent-green-400" />
        公開する
      </label>

      {message && (
        <p className={`text-sm font-noto ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
          {message.text}
        </p>
      )}

      <button type="submit" disabled={loading} className="w-full bg-white text-gray-900 font-noto font-medium py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
        {loading ? 'HEIC変換・アップロード中...' : '追加する'}
      </button>
    </form>
  )
}

// ── 小コンポーネント ──

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

function ImageUploader({ label, file, preview, inputRef, accept, onChange }: {
  label: string
  file: File | null
  preview: string | null
  inputRef: React.RefObject<HTMLInputElement | null>
  accept: string
  onChange: (file: File | null) => void
}) {
  const isHeic = file ? isHeicFile(file) : false

  return (
    <div>
      <label className="label">{label}</label>
      <div
        className="aspect-[4/3] bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors relative border-2 border-dashed border-gray-600 hover:border-gray-400"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <Image src={preview} alt="プレビュー" fill className="object-cover" />
        ) : isHeic ? (
          <div className="text-center px-4">
            <p className="text-gray-300 text-sm font-noto">HEIC</p>
            <p className="text-gray-500 text-xs font-noto mt-1 break-all">{file?.name}</p>
            <p className="text-gray-500 text-xs font-noto mt-1">追加時に変換します</p>
          </div>
        ) : (
          <span className="text-gray-400 text-sm font-noto">クリックして選択</span>
        )}
      </div>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
    </div>
  )
}
