import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/tickets/admin-auth-guard'
import {
  getTicketById,
  updateTicketStatusAndPriority,
  anonymizeTicket,
  deleteTicket,
} from '@/lib/tickets/ticket-service'
import { updateTicketStatusSchema } from '@/lib/tickets/schemas'

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const auth = requireAdminAuth(request)
  if (!auth.isAuthorized) return auth.response!

  try {
    const { id } = await props.params
    const ticket = await getTicketById(id)

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: 'Ticket não encontrado.' },
        { status: 404 }
      )
    }

    // Se estiver em estado NOVO, transita automaticamente para EM_ANALISE ao ser aberto pela equipa
    if (ticket.status === 'NOVO') {
      const updated = await updateTicketStatusAndPriority(id, { status: 'EM_ANALISE' })
      return NextResponse.json({
        success: true,
        ticket: updated || ticket,
        autoTransitioned: true,
      })
    }

    return NextResponse.json({
      success: true,
      ticket,
    })
  } catch (error: any) {
    console.error('[API /api/admin/tickets/[id] GET Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao carregar detalhes do ticket.' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const auth = requireAdminAuth(request)
  if (!auth.isAuthorized) return auth.response!

  try {
    const { id } = await props.params
    const body = await request.json().catch(() => ({}))

    const parsed = updateTicketStatusSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const updated = await updateTicketStatusAndPriority(id, parsed.data)

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Ticket não encontrado.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      ticket: updated,
      message: 'Estado do ticket atualizado com sucesso.',
    })
  } catch (error: any) {
    console.error('[API /api/admin/tickets/[id] PATCH Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao atualizar ticket.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const auth = requireAdminAuth(request)
  if (!auth.isAuthorized) return auth.response!

  try {
    const { id } = await props.params
    const { searchParams } = new URL(request.url)
    const anonymize = searchParams.get('anonymize') === 'true'

    if (anonymize) {
      await anonymizeTicket(id)
      return NextResponse.json({
        success: true,
        message: 'Dados pessoais do ticket foram anonimizados em conformidade com as normas de privacidade.',
      })
    }

    await deleteTicket(id)
    return NextResponse.json({
      success: true,
      message: 'Ticket eliminado definitivamente.',
    })
  } catch (error: any) {
    console.error('[API /api/admin/tickets/[id] DELETE Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao processar eliminação do ticket.' },
      { status: 500 }
    )
  }
}
