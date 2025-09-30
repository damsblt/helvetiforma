import fs from 'fs'
import path from 'path'
import { put, head, list, del } from '@vercel/blob'

const isProd = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'

const CONTENT_DIR = path.join(process.cwd(), 'content')

export interface StoredFileMeta {
  pathname: string
  size?: number
  url?: string
}

export async function readTextFile(filePath: string): Promise<string | null> {
  if (!isProd) {
    const abs = path.join(CONTENT_DIR, filePath)
    if (!fs.existsSync(abs)) return null
    return fs.readFileSync(abs, 'utf8')
  }
  try {
    const h = await head(`content/${filePath}`)
    if (!h) return null
    const res = await fetch(h.url)
    if (!res.ok) return null
    return await res.text()
  } catch {
    // Fallback lecture en readonly depuis le filesystem du build
    try {
      const abs = path.join(CONTENT_DIR, filePath)
      if (!fs.existsSync(abs)) return null
      return fs.readFileSync(abs, 'utf8')
    } catch {
      return null
    }
  }
}

export async function writeTextFile(filePath: string, contents: string): Promise<void> {
  if (!isProd) {
    const abs = path.join(CONTENT_DIR, filePath)
    const dir = path.dirname(abs)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(abs, contents, 'utf8')
    return
  }
  await put(`content/${filePath}`, contents, {
    contentType: 'text/markdown; charset=utf-8',
    addRandomSuffix: false,
    access: 'public',
    // Critical: allow overwriting existing blobs when updating content
    allowOverwrite: true,
  })
}

export async function listFiles(prefix: string): Promise<StoredFileMeta[]> {
  if (!isProd) {
    const abs = path.join(CONTENT_DIR, prefix)
    if (!fs.existsSync(abs)) return []
    return fs
      .readdirSync(abs)
      .filter(name => !name.startsWith('.'))
      .map(name => ({ pathname: path.join(prefix, name) }))
  }
  const result = await list({ prefix: `content/${prefix}` })
  return result.blobs.map(b => ({ pathname: b.pathname.replace(/^content\//, ''), size: b.size, url: b.url }))
}

export async function deleteFile(filePath: string): Promise<void> {
  if (!isProd) {
    const abs = path.join(CONTENT_DIR, filePath)
    if (fs.existsSync(abs)) fs.unlinkSync(abs)
    return
  }
  await del(`content/${filePath}`)
}


