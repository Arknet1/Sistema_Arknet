import { NextRequest, NextResponse } from 'next/server'
import { getProductsServerAsync, saveProductServerAsync } from '@/lib/server-db'
import { verifySessionToken } from '@/lib/security-utils'

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

// GET /api/products - Lista todos os produtos
export async function GET() {
  try {
    const products = await getProductsServerAsync()
    return NextResponse.json({ success: true, products }, { status: 200 })
  } catch (error) {
    console.error('[API /api/products GET] Erro:', error)
    return NextResponse.json({ success: false, message: 'Erro ao listar produtos' }, { status: 500 })
  }
}

// POST /api/products - Cria um novo produto
export async function POST(request: NextRequest) {
  try {
    const admin = getAdminPayload(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Autenticação necessária para criar produtos.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    if (!body || !body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Nome do produto é obrigatório.' },
        { status: 400 }
      )
    }

    const savedProduct = await saveProductServerAsync(body)

    return NextResponse.json(
      {
        success: true,
        message: `Produto "${savedProduct.name}" gravado com sucesso.`,
        product: savedProduct,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API /api/products POST] Erro:', error)
    return NextResponse.json({ success: false, message: 'Erro ao guardar produto' }, { status: 500 })
  }
}
