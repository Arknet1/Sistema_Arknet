import { NextRequest, NextResponse } from 'next/server'
import { processIncomingWhatsAppMessage } from '@/lib/whatsapp/state-machine'
import { dataStore } from '@/lib/data-store'
import { sessionStore } from '@/lib/whatsapp/session-store'

/**
 * POST: Simular mensagem de cliente WhatsApp localmente
 * Agora suporta conversa livre (sem forçar número de pedido)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      senderPhone = '244923111222',
      senderName,
      text = '',
      media,
      orderNumber,
    } = body

    // Usar o texto tal como o cliente o escreveria, sem injetar números de pedido
    const messageText = text

    const result = await processIncomingWhatsAppMessage({
      senderPhone,
      senderName: senderName || undefined,
      text: messageText,
      media,
    })

    // Obter o nome do cliente da sessão (para o frontend exibir)
    const session = sessionStore.getSession(senderPhone.replace(/\D/g, ''))

    const updatedOrder = result.orderId
      ? dataStore.getOrders().find((o) => o.id === result.orderId)
      : null

    return NextResponse.json({
      success: true,
      result: {
        ...result,
        extractedCustomerName: session.clientName || null,
        extractedCustomerTitle: session.clientTitle || null,
      },
      order: updatedOrder,
    })
  } catch (error: any) {
    console.error('Erro na simulação do bot WhatsApp:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
