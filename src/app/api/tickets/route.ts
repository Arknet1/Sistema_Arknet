import { NextRequest, NextResponse } from 'next/server'
import { publicTicketSubmissionSchema } from '@/lib/tickets/schemas'
import { createTicket } from '@/lib/tickets/ticket-service'
import { verifySessionToken } from '@/lib/server-auth'

export async function POST(request: NextRequest) {
  try {
    let rawBody: any
    try {
      rawBody = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, message: 'Corpo da requisição inválido (JSON malformado).' },
        { status: 400 }
      )
    }

    // 1. Validação estrita de schema Zod (rejeita campos desconhecidos ou inválidos)
    const validationResult = publicTicketSubmissionSchema.safeParse(rawBody)
    if (!validationResult.success) {
      const firstError = validationResult.error.issues?.[0]?.message || 'Dados do formulário inválidos.'
      return NextResponse.json(
        { success: false, message: firstError, errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // 2. Extração do IP do cliente para rate limiting e auditoria de segurança
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1'

    // 3. Verifica se existe sessão de cliente autenticado para associar automaticamente
    const customerToken = request.cookies.get('arknet_customer_token')?.value
    let customerId: string | null = null
    if (customerToken) {
      const session = verifySessionToken(customerToken)
      if (session?.userId) {
        customerId = session.userId
      }
    }

    // 4. Criação do Ticket com sanitização e envio de notificações
    const result = await createTicket(data, clientIp, customerId)

    // 5. Resposta segura: Devolve apenas o número de protocolo gerado
    return NextResponse.json(
      {
        success: true,
        protocol: result.protocol,
        message: 'O seu pedido foi submetido com sucesso à equipa da ARKNET.',
      },
      { status: 201 }
    )
  } catch (error: any) {
    const isRateLimit = error.message?.includes('Limite') || error.message?.includes('aguarde')
    const status = isRateLimit ? 429 : 500

    console.error('[API /api/tickets POST Error]:', error)

    return NextResponse.json(
      {
        success: false,
        message: isRateLimit
          ? error.message
          : 'Ocorreu um erro temporário ao processar o seu pedido. Por favor tente novamente ou contacte o nosso suporte.',
      },
      { status }
    )
  }
}
