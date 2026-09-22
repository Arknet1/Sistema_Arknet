import { NextRequest, NextResponse } from 'next/server'
import { saveProductServerAsync, deleteProductServerAsync, getProductsServerAsync } from '@/lib/server-db'
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

// GET /api/products/[id] - Retorna um produto individual
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const products = await getProductsServerAsync()
    const product = products.find((p: any) => p.id === id)
    if (!product) {
      return NextResponse.json({ success: false, message: 'Produto não encontrado' }, { status: 404 })
    }
    return NextResponse.json({ success: true, product }, { status: 200 })
  } catch (error) {
    console.error('[API /api/products/[id] GET] Erro:', error)
    return NextResponse.json({ success: false, message: 'Erro ao obter produto' }, { status: 500 })
  }
}

// PUT /api/products/[id] - Atualiza um produto atomicamente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminPayload(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Autenticação necessária para atualizar produtos.' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, message: 'Dados inválidos' }, { status: 400 })
    }

    const updatedProduct = await saveProductServerAsync({
      ...body,
      id,
    })

    return NextResponse.json(
      {
        success: true,
        message: `Produto "${updatedProduct.name}" atualizado com sucesso.`,
        product: updatedProduct,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API /api/products/[id] PUT] Erro:', error)
    return NextResponse.json({ success: false, message: 'Erro ao atualizar produto' }, { status: 500 })
  }
}

// DELETE /api/products/[id] - Elimina um produto atomicamente
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminPayload(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Autenticação necessária para eliminar produtos.' },
        { status: 401 }
      )
    }

    const { id } = await params
    await deleteProductServerAsync(id)

    return NextResponse.json(
      {
        success: true,
        message: 'Produto eliminado com sucesso do catálogo.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API /api/products/[id] DELETE] Erro:', error)
    return NextResponse.json({ success: false, message: 'Erro ao eliminar produto' }, { status: 500 })
  }
}
