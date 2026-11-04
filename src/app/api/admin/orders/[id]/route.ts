import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/tickets/admin-auth-guard'
import { readServerDb, writeServerDb } from '@/lib/server-db'

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const auth = requireAdminAuth(request)
  if (!auth.isAuthorized) return auth.response!

  try {
    const { id } = await props.params
    const [order, fallbackDb] = await Promise.all([
      prisma.storeOrder.findUnique({ where: { id }, select: { id: true, orderNumber: true } }),
      Promise.resolve(readServerDb()),
    ])

    const fallbackOrder = (fallbackDb.orders || []).find((item: any) => item.id === id)
    if (!order && !fallbackOrder) {
      return NextResponse.json({ success: false, message: 'Encomenda não encontrada.' }, { status: 404 })
    }

    if (order) await prisma.storeOrder.delete({ where: { id } })

    const persisted = writeServerDb({
      orders: (fallbackDb.orders || []).filter((item: any) => item.id !== id),
    })
    if (!persisted) throw new Error('Não foi possível atualizar a cópia de segurança JSON.')

    return NextResponse.json({ success: true, message: 'Encomenda eliminada com sucesso.' })
  } catch (error) {
    console.error('[API /api/admin/orders/[id] DELETE Error]:', error)
    return NextResponse.json({ success: false, message: 'Erro ao eliminar a encomenda.' }, { status: 500 })
  }
}