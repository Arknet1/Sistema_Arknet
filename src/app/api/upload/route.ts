import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')

// Extensões de ficheiros permitidas (imagens e comprovativos PDF)
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.pdf'])

// Extensões perigosas explicitamente bloqueadas
const DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.com', '.msi', '.scr', '.pif',
  '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx',
  '.html', '.htm', '.xhtml', '.php', '.asp', '.aspx', '.jsp',
  '.sh', '.bash', '.ps1', '.psm1', '.vbs', '.wsf',
  '.dll', '.sys', '.py', '.rb', '.pl',
])

// Tamanho máximo de ficheiro: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// MIME types permitidos
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'application/pdf',
])

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  }
}

function isExtensionAllowed(ext: string): boolean {
  const lowerExt = ext.toLowerCase()
  if (DANGEROUS_EXTENSIONS.has(lowerExt)) return false
  return ALLOWED_EXTENSIONS.has(lowerExt)
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^[._-]+/, '')
    .toLowerCase()
    .slice(0, 100) // Limitar comprimento do nome
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

      // Validar tamanho
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, message: `Ficheiro demasiado grande. Tamanho máximo permitido: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
          { status: 400 }
        )
      }

      const originalName = file.name || 'image.jpg'
      const ext = path.extname(originalName) || '.jpg'

      // Validar extensão
      if (!isExtensionAllowed(ext)) {
        return NextResponse.json(
          { success: false, message: `Tipo de ficheiro não permitido (${ext}). Apenas imagens e PDFs são aceites.` },
          { status: 400 }
        )
      }

      // Validar MIME type
      if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          { success: false, message: `Tipo MIME não permitido (${file.type}). Apenas imagens e PDFs são aceites.` },
          { status: 400 }
        )
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const cleanBaseName = sanitizeFileName(path.basename(originalName, ext))
      const fileName = `${cleanBaseName}-${Date.now()}${ext.toLowerCase()}`
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

      // Validar tamanho do ficheiro decodificado
      if (buffer.length > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, message: `Ficheiro demasiado grande. Tamanho máximo permitido: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
          { status: 400 }
        )
      }

      // Validar MIME type
      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        return NextResponse.json(
          { success: false, message: `Tipo MIME não permitido (${mimeType}). Apenas imagens e PDFs são aceites.` },
          { status: 400 }
        )
      }

      let ext = '.jpg'
      if (mimeType.includes('png')) ext = '.png'
      else if (mimeType.includes('webp')) ext = '.webp'
      else if (mimeType.includes('gif')) ext = '.gif'
      else if (mimeType.includes('svg')) ext = '.svg'
      else if (mimeType.includes('pdf')) ext = '.pdf'

      const customName = filename ? sanitizeFileName(path.basename(filename)) : 'upload'
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

