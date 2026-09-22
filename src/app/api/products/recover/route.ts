import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { saveProductServerAsync } from '@/lib/server-db'
import { verifySessionToken } from '@/lib/security-utils'

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')
const DB_FILE = path.join(process.cwd(), 'data', 'arknet-db.json')

function getAdminPayload(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const adminCookie = request.cookies.get('arknet_admin_token')?.value
  const token = authHeader?.replace('Bearer ', '') || adminCookie
  if (!token) {
    if (process.env.NODE_ENV === 'development') {
      return { userId: 'admin-dev', email: 'admin@arknet.co.ao', role: 'admin' }
    }
    return null
  }
  const payload = verifySessionToken(token)
  if (!payload || (payload.role !== 'admin' && payload.role !== 'editor')) {
    if (process.env.NODE_ENV === 'development') {
      return { userId: 'admin-dev', email: 'admin@arknet.co.ao', role: 'admin' }
    }
    return null
  }
  return payload
}

// GET /api/products/recover - Lista fotos órfãs recentes
export async function GET(request: NextRequest) {
  try {
    if (!fs.existsSync(UPLOADS_DIR) || !fs.existsSync(DB_FILE)) {
      return NextResponse.json({ success: true, unlinkedFiles: [] })
    }

    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    const db = JSON.parse(raw)
    const existingProducts = db.products || []
    const existingImages = new Set(existingProducts.map((p: any) => p.image))

    const files = fs.readdirSync(UPLOADS_DIR)
    const unlinkedRecent = files
      .filter((f) => {
        const match = f.match(/-(\d+)\./)
        if (match) {
          const ts = parseInt(match[1])
          return ts > 1789800000000 && !existingImages.has('/uploads/' + f)
        }
        return false
      })
      .map((file) => {
        const filePath = path.join(UPLOADS_DIR, file)
        const stats = fs.statSync(filePath)
        return {
          fileName: file,
          url: `/uploads/${file}`,
          size: stats.size,
          mtime: stats.mtimeMs,
        }
      })
      .sort((a, b) => b.mtime - a.mtime)

    return NextResponse.json({ success: true, unlinkedFiles: unlinkedRecent })
  } catch (error) {
    console.error('[API /api/products/recover GET] Erro:', error)
    return NextResponse.json({ success: false, unlinkedFiles: [] }, { status: 500 })
  }
}

// POST /api/products/recover - Cria produtos em lote a partir das fotos
export async function POST(request: NextRequest) {
  try {
    const admin = getAdminPayload(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Autenticação necessária.' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const selectedFiles: string[] = body.files || []

    if (!fs.existsSync(UPLOADS_DIR) || !fs.existsSync(DB_FILE)) {
      return NextResponse.json({ success: false, message: 'Ficheiros não encontrados.' }, { status: 404 })
    }

    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    const db = JSON.parse(raw)
    const existingProducts = db.products || []
    const existingImages = new Set(existingProducts.map((p: any) => p.image))

    const files = fs.readdirSync(UPLOADS_DIR)
    const targetFiles = selectedFiles.length > 0
      ? files.filter((f) => selectedFiles.includes(f))
      : files.filter((f) => {
          const match = f.match(/-(\d+)\./)
          if (match) {
            const ts = parseInt(match[1])
            return ts > 1789800000000 && !existingImages.has('/uploads/' + f)
          }
          return false
        })

    const createdList = []
    const timestamp = Date.now()

    for (let i = 0; i < targetFiles.length; i++) {
      const file = targetFiles[i]
      const imageUrl = `/uploads/${file}`
      const id = `prod-rec-${timestamp}-${i + 1}`
      const sku = `ARK-${Math.floor(1000 + Math.random() * 9000)}`

      let name = `Produto Restaurado ${i + 1}`
      let category = 'Produtos'

      if (file.toLowerCase().includes('impressora')) {
        name = `Impressora ${i + 1}`
        category = 'Impressoras e Consumíveis'
      } else if (file.toLowerCase().includes('router') || file.toLowerCase().includes('wifi') || file.toLowerCase().includes('rede')) {
        name = `Equipamento de Rede ${i + 1}`
        category = 'Redes e Internet'
      } else if (file.toLowerCase().includes('cabo') || file.toLowerCase().includes('rj45')) {
        name = `Cabo / Conector ${i + 1}`
        category = 'Cabos e Conectividade'
      } else if (file.toLowerCase().includes('monitor')) {
        name = `Monitor ${i + 1}`
        category = 'Monitores'
      }

      const prodData = {
        id,
        name,
        description: 'Equipamento disponível na loja ARKNET. Edite este produto para definir o preço e detalhes.',
        category,
        price: null,
        image: imageUrl,
        images: null,
        inStock: true,
        quantity: 10,
        featured: false,
        sku,
      }

      const saved = await saveProductServerAsync(prodData)
      createdList.push(saved)
    }

    return NextResponse.json({
      success: true,
      message: `${createdList.length} produtos restaurados com sucesso a partir das fotos!`,
      count: createdList.length,
      products: createdList,
    })
  } catch (error) {
    console.error('[API /api/products/recover POST] Erro:', error)
    return NextResponse.json({ success: false, message: 'Erro ao restaurar produtos' }, { status: 500 })
  }
}
