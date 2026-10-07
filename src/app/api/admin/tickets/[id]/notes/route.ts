import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/tickets/admin-auth-guard'
import { addTicketNote } from '@/lib/tickets/ticket-service'
import { createTicketNoteSchema } from '@/lib/tickets/schemas'

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const auth = requireAdminAuth(request)
  if (!auth.isAuthorized) return auth.response!

  try {
    const { id } = await props.params
    const body = await request.json().catch(() => ({}))

    const parsed = createTicketNoteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues?.[0]?.message || 'Nota inválida.' },
        { status: 400 }
      )
    }

    const note = await addTicketNote(
      id,
      auth.session!.userId,
      auth.session!.email,
      parsed.data.content
    )

    return NextResponse.json(
      {
        success: true,
        note,
        message: 'Nota interna adicionada com sucesso.',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[API /api/admin/tickets/[id]/notes POST Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao registar nota interna.' },
      { status: 500 }
    )
  }
}
