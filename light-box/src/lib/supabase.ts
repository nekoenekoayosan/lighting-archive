import { createClient } from '@supabase/supabase-js'
import type { Light, LightInsert } from '@/types/lights'

// Supabaseの設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// デバッグ用ログ（本番環境では削除）
console.log('Supabase URL:', supabaseUrl?.slice(0, 20) + '...')
console.log('Has Anon Key:', !!supabaseAnonKey && supabaseAnonKey !== 'placeholder-key')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// lightsテーブルへのアクセス用の型付きクライアント
export const lightsTable = () => supabase.from('lights')

// 公開されている照明一覧を取得
export const getPublicLights = async () => {
  try {
    console.log('Fetching lights from Supabase...')
    const { data, error } = await lightsTable()
      .select('*')
      .eq('is_public', true)
      .order('shot_date', { ascending: false })
    
    if (error) {
      console.error('Supabase error:', error)
      return { data: null, error }
    }
    
    console.log('Fetched lights:', data?.length || 0, 'items')
    return { data: data as Light[] | null, error: null }
  } catch (err) {
    console.error('Connection error:', err)
    return { data: null, error: err }
  }
}

// 特定のIDの照明を取得
export const getLightById = async (id: number) => {
  const { data, error } = await lightsTable()
    .select('*')
    .eq('id', id)
    .eq('is_public', true)
    .single()

  return { data: data as Light | null, error }
}

// ── 管理用関数 ──────────────────────────────

// 全照明を取得（非公開含む）
export const getAllLights = async () => {
  const { data, error } = await lightsTable()
    .select('*')
    .order('shot_date', { ascending: false })
  return { data: data as Light[] | null, error }
}

// 照明を追加
// サーバー側APIルート経由でサービスロールキーを使い、RLSをバイパスする
export const addLight = async (light: LightInsert) => {
  const res = await fetch('/api/add-light', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(light),
  })
  const json = await res.json()
  if (!res.ok) return { data: null, error: new Error(json.error || '登録失敗') }
  return { data: json.data as Light | null, error: null }
}

// 照明を削除
export const deleteLight = async (id: number) => {
  const { error } = await lightsTable().delete().eq('id', id)
  return { error }
}

// 公開状態を切り替え
export const toggleLightPublic = async (id: number, isPublic: boolean) => {
  const { error } = await lightsTable()
    .update({ is_public: isPublic })
    .eq('id', id)
  return { error }
}

// 画像を Supabase Storage にアップロードして公開URLを返す
// サーバー側APIルート経由でサービスロールキーを使い、RLSをバイパスする
export const uploadImage = async (file: File, path: string) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('path', path)

  const res = await fetch('/api/upload-image', { method: 'POST', body: formData })
  const json = await res.json()

  if (!res.ok) return { url: null, error: new Error(json.error || 'アップロード失敗') }
  return { url: json.url as string, error: null }
}