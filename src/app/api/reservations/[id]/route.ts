import { NextRequest, NextResponse } from 'next/server'
import {
  deleteReservationServerAsync,
  updateReservationServerAsync,
  getReservationsServerAsync,
} from '@/lib/server-db'
import { verifySessionToken } from '@/lib/server-auth'

function getAdminPayload(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const adminCookie = request.cookies.get('arknet_admin_token')?.value
  const token = authHeader?.replace('Bearer ', '') || adminCookie
  if (!token) return null
  const payload = verifySessionToken(token)
  if (!payload || (payload.role !== 'admin' && payload.role !== 'editor')) {
    return null
  }
  return payload
}

// GET /api/reservations/[id] - Retorna uma reserva individual
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reservations = await getReservationsServerAsync()
    const reservation = reservations.find((r: any) => r.id === id)
    if (!reservation) {
      return NextResponse.json({ success: false, message: 'Reserva não encontrada' }, { status: 404 })
    }
    return NextResponse.json({ success: true, reservation }, { status: 200 })
  } catch (error) {
    console.error('[API /api/reservations/[id] GET] Erro:', error)
    return NextResponse.json({ success: false, message: 'Erro ao obter reserva' }, { status: 500 })
  }
}

// PATCH /api/reservations/[id] - Atualiza dados ou estado da reserva atomicamente
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminPayload(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Autenticação necessária para atualizar reservas.' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, message: 'Dados inválidos' }, { status: 400 })
    }

    const updated = await updateReservationServerAsync(id, body)

    return NextResponse.json(
      {
        success: true,
        message: `Reserva atualizada com sucesso.`,
        reservation: updated,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API /api/reservations/[id] PATCH] Erro:', error)
    return NextResponse.json({ success: false, message: 'Erro ao atualizar reserva' }, { status: 500 })
  }
}

// DELETE /api/reservations/[id] - Elimina uma reserva atomicamente do Prisma e JSON DB
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminPayload(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Autenticação necessária para eliminar reservas.' },
        { status: 401 }
      )
    }

    const { id } = await params
    await deleteReservationServerAsync(id)

    return NextResponse.json(
      {
        success: true,
        message: 'Reserva eliminada permanentemente com sucesso.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API /api/reservations/[id] DELETE] Erro:', error)
    return NextResponse.json({ success: false, message: 'Erro ao eliminar reserva' }, { status: 500 })
  }
}
