import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import sharp from 'sharp'
import { verifySessionToken } from '@/lib/server-auth'
import { getBaseSiteUrl } from '@/lib/newsletter-template'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'newsletter')

/**
 * Validação de Administrador / Editor
 */
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const adminCookie = request.cookies.get('arknet_admin_token')?.value
  const token = authHeader?.replace('Bearer ', '') || adminCookie
  if (!token) return false

  const payload = verifySessionToken(token)
  if (!payload || (payload.role !== 'admin' && payload.role !== 'editor')) {
    return false
  }
  return true
}

/**
 * Validação estrita de Magic Bytes no buffer para prevenir ficheiros disfarçados
 */
function validateImageMagicBytes(buffer: Buffer): { valid: boolean; format: 'jpeg' | 'png' | 'webp' | null } {
  if (buffer.length < 12) return { valid: false, format: null }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, format: 'jpeg' }
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, format: 'png' }
  }

  // WebP: RIFF .... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { valid: true, format: 'webp' }
  }

  return { valid: false, format: null }
}

export async function POST(request: NextRequest) {
  // 1. Verificação de permissões
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, message: 'Não autorizado. Apenas administradores podem carregar imagens.' },
      { status: 401 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const slot = (formData.get('slot') as string) || 'general' // 'cover' | 'banner' | 'product' | 'general'

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Nenhum ficheiro foi enviado.' },
        { status: 400 }
      )
    }

    // 2. Validação de tamanho (máximo 2 MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: 'Ficheiro muito grande. O tamanho máximo permitido é de 2 MB.' },
        { status: 400 }
      )
    }

    // 3. Validação do tipo de ficheiro informado pelo navegador
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Formato inválido. Apenas imagens JPG, PNG e WebP são aceites.' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const rawBuffer = Buffer.from(arrayBuffer)

    // 4. Validação estrita de Magic Bytes no Servidor
    const magicCheck = validateImageMagicBytes(rawBuffer)
    if (!magicCheck.valid) {
      return NextResponse.json(
        { success: false, message: 'O conteúdo do ficheiro não corresponde a uma imagem válida (JPG, PNG ou WebP).' },
        { status: 400 }
      )
    }

    // Garantir pasta de destino
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true })
    }

    // 5. Redimensionamento e Compressão no Servidor
    // Capa: até 1200px para ecrãs retina/alta densidade; Outras imagens: até 600px
    const maxWidth = slot === 'cover' ? 1200 : 600

    let imagePipeline = sharp(rawBuffer).rotate() // Corrige orientação EXIF automaticamente
    const metadata = await imagePipeline.metadata()

    if (metadata.width && metadata.width > maxWidth) {
      imagePipeline = imagePipeline.resize({
        width: maxWidth,
        withoutEnlargement: true,
        fit: 'inside',
      })
    }

    // Converter para WebP otimizado (formato leve e moderno)
    const optimizedBuffer = await imagePipeline
      .webp({ quality: 85, effort: 4 })
      .toBuffer()

    // 6. Gerar nome de ficheiro único e seguro (sem usar o nome original do utilizador)
    const randomSuffix = crypto.randomBytes(6).toString('hex')
    const safeSlot = slot.replace(/[^a-zA-Z0-9_-]/g, '')
    const finalFileName = `nl_${safeSlot}_${Date.now()}_${randomSuffix}.webp`
    const finalFilePath = path.join(UPLOADS_DIR, finalFileName)

    await fs.promises.writeFile(finalFilePath, optimizedBuffer)

    const relativeUrl = `/uploads/newsletter/${finalFileName}`
    const baseUrl = getBaseSiteUrl()
    const absoluteUrl = `${baseUrl}${relativeUrl}`

    const finalMeta = await sharp(optimizedBuffer).metadata()

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      fullUrl: absoluteUrl,
      fileName: finalFileName,
      width: finalMeta.width || null,
      height: finalMeta.height || null,
      size: optimizedBuffer.length,
      originalSize: file.size,
      compressionRatio: Math.round(((file.size - optimizedBuffer.length) / file.size) * 100),
      message: 'Imagem carregada, redimensionada e otimizada com sucesso!',
    })
  } catch (error: any) {
    console.error('[Newsletter Upload Error]', error)
    return NextResponse.json(
      { success: false, message: `Falha ao processar o upload: ${error.message || 'Erro interno do servidor'}` },
      { status: 500 }
    )
  }
}
