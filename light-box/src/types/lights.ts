// Supabase lightsテーブルの型定義

export interface Light {
  id: number
  name: string
  location: string
  shot_date: string
  image_on: string
  image_off: string
  image_gif: string | null
  category: string | null
  role_memo: string | null
  space_type: '屋内' | '屋外' | 'ライトアップ'
  is_public: boolean
  created_at: string
}

// データベースに新しい照明を挿入する際の型
export interface LightInsert {
  name: string
  location: string
  shot_date: string
  image_on: string
  image_off: string
  image_gif?: string | null
  category?: string | null
  role_memo?: string | null
  space_type: '屋内' | '屋外' | 'ライトアップ'
  is_public?: boolean
}

// 照明の更新用の型
export interface LightUpdate {
  name?: string
  location?: string
  shot_date?: string
  image_on?: string
  image_off?: string
  image_gif?: string | null
  category?: string | null
  role_memo?: string | null
  space_type?: '屋内' | '屋外' | 'ライトアップ'
  is_public?: boolean
}