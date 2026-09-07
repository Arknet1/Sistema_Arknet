import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  }
}

export async function POST(req: Request) {
  try {
    ensureUploadsDir()

    const contentType = req.headers.get('content-type') || ''

    // 1. Form-Data Upload (File)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File | null

      if (!file) {
        return NextResponse.json({ success: false, message: 'Nenhum ficheiro enviado' }, { status: 400 })
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const originalName = file.name || 'image.jpg'
      const ext = path.extname(originalName) || '.jpg'
      const cleanBaseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase()
      const fileName = `${cleanBaseName}-${Date.now()}${ext}`
      const filePath = path.join(UPLOADS_DIR, fileName)

      fs.writeFileSync(filePath, buffer)
      const url = `/uploads/${fileName}`

      return NextResponse.json({
        success: true,
        url,
        fileName,
        size: buffer.length,
      })
    }

    // 2. JSON Base64 Upload
    if (contentType.includes('application/json')) {
      const { dataUrl, filename } = await req.json()

      if (!dataUrl || typeof dataUrl !== 'string') {
        return NextResponse.json({ success: false, message: 'dataUrl inválido' }, { status: 400 })
      }

      const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/)
      if (!matches || matches.length !== 3) {
        return NextResponse.json({ success: false, message: 'Formato Base64 inválido' }, { status: 400 })
      }

      const mimeType = matches[1]
      const base64Data = matches[2]
      const buffer = Buffer.from(base64Data, 'base64')

      let ext = '.jpg'
      if (mimeType.includes('png')) ext = '.png'
      else if (mimeType.includes('webp')) ext = '.webp'
      else if (mimeType.includes('gif')) ext = '.gif'
      else if (mimeType.includes('svg')) ext = '.svg'

      const customName = filename ? path.basename(filename).replace(/[^a-zA-Z0-9-_]/g, '_') : 'upload'
      const fileName = `${customName}-${Date.now()}${ext}`
      const filePath = path.join(UPLOADS_DIR, fileName)

      fs.writeFileSync(filePath, buffer)
      const url = `/uploads/${fileName}`

      return NextResponse.json({
        success: true,
        url,
        fileName,
        size: buffer.length,
      })
    }

    return NextResponse.json({ success: false, message: 'Tipo de conteúdo não suportado' }, { status: 400 })
  } catch (error) {
    console.error('[API /api/upload] Erro ao salvar imagem:', error)
    return NextResponse.json({ success: false, message: 'Erro ao fazer upload da imagem' }, { status: 500 })
  }
}
