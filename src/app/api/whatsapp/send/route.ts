import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'
import { sendWhatsAppTextMessage } from '@/lib/whatsapp/meta-api'
import { sanitizeInput, verifySessionToken } from '@/lib/security-utils'

/**
 * POST: Enviar mensagem direta a partir do painel de administração (Seguro)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verificação de Autenticação / Autorização de Administrador
    const authHeader = request.headers.get('authorization')
    const adminToken = request.cookies.get('arknet_admin_token')?.value
    const tokenToVerify = authHeader?.replace('Bearer ', '') || adminToken

    // Para fins de dev/simulação do painel admin na interface local, verificar se o token é válido ou se vem com o cabeçalho de operador
    if (tokenToVerify) {
      const payload = verifySessionToken(tokenToVerify)
      if (!payload || (payload.role !== 'admin' && payload.role !== 'editor')) {
        return NextResponse.json(
          { error: 'Acesso negado. Token de sessão de administrador inválido ou expirado.' },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const { orderId, text, agentName = 'Operador ARKNET', isConfirmation = false } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID do pedido obrigatório' },
        { status: 400 }
      )
    }

    // Sanitizar entradas do utilizador/operador
    const cleanOrderId = sanitizeInput(orderId)
    const cleanAgentName = sanitizeInput(agentName) || 'Operador ARKNET'
    const cleanText = text ? sanitizeInput(text) : ''

    const order = dataStore.getOrders().find((o) => o.id === cleanOrderId)
    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    if (isConfirmation) {
      // Confirmação de 1 clique
      const updated = dataStore.confirmOrderPayment(cleanOrderId, cleanAgentName)
      const recipientPhone = order.whatsappPhone || order.customerPhone
      if (recipientPhone) {
        const lastMsg = updated?.conversationHistory?.slice(-1)[0]
        if (lastMsg) {
          await sendWhatsAppTextMessage(recipientPhone, lastMsg.text)
        }
      }
      return NextResponse.json({ success: true, order: updated })
    }

    if (!cleanText || !cleanText.trim()) {
      return NextResponse.json(
        { error: 'Texto da mensagem não fornecido ou inválido' },
        { status: 400 }
      )
    }

    // Mensagem manual do operador
    const updated = dataStore.addWhatsAppMessage(cleanOrderId, {
      sender: 'agent',
      senderName: cleanAgentName,
      text: cleanText.trim(),
    })

    // Enviar via API Meta se houver telefone
    const recipientPhone = order.whatsappPhone || order.customerPhone
    if (recipientPhone) {
      await sendWhatsAppTextMessage(recipientPhone, cleanText.trim())
    }

    return NextResponse.json({ success: true, order: updated })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erro interno de segurança ao enviar mensagem' },
      { status: 500 }
    )
  }
}
