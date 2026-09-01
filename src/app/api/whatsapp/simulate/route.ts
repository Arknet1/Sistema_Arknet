import { NextRequest, NextResponse } from 'next/server'
import { processIncomingWhatsAppMessage } from '@/lib/whatsapp/state-machine'
import { dataStore } from '@/lib/data-store'

/**
 * POST: Simular mensagem de cliente ou envio de comprovativo localmente
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      senderPhone = '244923111222',
      senderName = 'Cliente Teste',
      text = '',
      media,
      orderNumber,
    } = body

    let messageText = text
    if (orderNumber && !text.includes(orderNumber)) {
      messageText = `Olá ARKNET! Pedido #${orderNumber}. ${text}`
    }

    const result = await processIncomingWhatsAppMessage({
      senderPhone,
      senderName,
      text: messageText,
      media,
    })

    const updatedOrder = result.orderId
      ? dataStore.getOrders().find((o) => o.id === result.orderId)
      : null

    return NextResponse.json({
      success: true,
      result,
      order: updatedOrder,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
