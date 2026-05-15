import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { writeFile, readFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

const execFileAsync = promisify(execFile)

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'ファイルがありません' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const outName = file.name.replace(/\.(heic|heif)$/i, '.jpg')

  // まずsharpで試みる
  try {
    const jpeg = await sharp(buffer).rotate().jpeg({ quality: 92 }).toBuffer()
    return jpegResponse(new Uint8Array(jpeg), outName)
  } catch {
    // sharpがHEVCコーデックに非対応の場合はmacOS標準のsipsで変換
  }

  const tmpIn = join(tmpdir(), `heic_in_${Date.now()}.heic`)
  const tmpOut = join(tmpdir(), `heic_out_${Date.now()}.jpg`)

  try {
    await writeFile(tmpIn, buffer)
    await execFileAsync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '92', tmpIn, '--out', tmpOut])
    const jpeg = await readFile(tmpOut)
    return jpegResponse(new Uint8Array(jpeg), outName)
  } catch (err) {
    return NextResponse.json({ error: `変換失敗: ${err}` }, { status: 500 })
  } finally {
    await unlink(tmpIn).catch(() => {})
    await unlink(tmpOut).catch(() => {})
  }
}

function jpegResponse(data: Uint8Array, filename: string) {
  return new NextResponse(data, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Disposition': `inline; filename="${filename}"`,
    },
  })
}
