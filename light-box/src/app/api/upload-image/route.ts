import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// サービスロールキーを使うサーバー専用クライアント（RLSをバイパスできる）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// 英数字・アンダースコア・ハイフン・ドット・スラッシュ以外を _ に置換してパスを安全にする
function sanitizePath(path: string): string {
  return path.replace(/[^a-zA-Z0-9._\-/]/g, '_')
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const rawPath = formData.get('path') as string | null

  if (!file || !rawPath) {
    return NextResponse.json({ error: 'ファイルまたはパスがありません' }, { status: 400 })
  }

  const path = sanitizePath(rawPath)

  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabaseAdmin.storage
    .from('lights-images')
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data } = supabaseAdmin.storage
    .from('lights-images')
    .getPublicUrl(path)

  return NextResponse.json({ url: data.publicUrl })
}
