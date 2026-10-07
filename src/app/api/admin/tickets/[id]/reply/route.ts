import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/tickets/admin-auth-guard'
import { replyToTicket } from '@/lib/tickets/ticket-service'
import { createTicketReplySchema } from '@/lib/tickets/schemas'

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const auth = requireAdminAuth(request)
  if (!auth.isAuthorized) return auth.response!

  try {
    const { id } = await props.params
    const body = await request.json().catch(() => ({}))

    const parsed = createTicketReplySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues?.[0]?.message || 'Conteúdo da resposta inválido.' },
        { status: 400 }
      )
    }

    const result = await replyToTicket(
      id,
      auth.session!.userId,
      auth.session!.email,
      parsed.data.content,
      parsed.data.channel,
      parsed.data.sendWhatsAppCopy
    )

    return NextResponse.json(
      {
        success: true,
        reply: result.reply,
        emailSent: result.emailSent,
        whatsappSent: result.whatsappSent,
        message: 'Resposta enviada ao cliente com sucesso.',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[API /api/admin/tickets/[id]/reply POST Error]:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Erro ao enviar resposta ao cliente.' },
      { status: 500 }
    )
  }
}
