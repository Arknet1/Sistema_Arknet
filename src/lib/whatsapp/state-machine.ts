/**
 * Motor de Fluxo e Máquina de Estados do Bot WhatsApp ARKNET
 */

import { dataStore, StoreOrder, WhatsAppChatMessage, WhatsAppMessageMedia } from '../data-store'
import {
  getOrderSummaryMessage,
  getPaymentInstructionsMessage,
  getReceiptReceivedMessage,
  getOrderConfirmedMessage,
  getEscalateToHumanMessage,
  getOrderNotFoundMessage,
} from './templates'
import { sendWhatsAppTextMessage } from './meta-api'
import { ProcessedBotResult } from './types'

/**
 * Regex para extração de identificador de pedido nas mensagens
 * Exemplos aceites: "PED-2026-0042", "#PED-2026-0042", "Pedido #1234", "ORD-1234", "Pedido #PED-2026-0042"
 */
const ORDER_NUMBER_REGEX = /(?:PED[-\s]?\d{4}[-\s]?\d+|#?[A-Z]{3,4}[-\s]?\d{4,}[-\s]?\d*|PED[-\s]?\d+|#\d{4,})/i

export function extractOrderIdentifier(text: string): string | null {
  if (!text) return null
  const match = text.match(ORDER_NUMBER_REGEX)
  if (match) {
    return match[0].replace(/^#/, '').trim()
  }
  return null
}

export interface InboundMessageParams {
  senderPhone: string
  senderName?: string
  text?: string
  media?: {
    url?: string
    type?: 'image' | 'document' | 'audio' | 'video'
    filename?: string
    mimeType?: string
  }
  messageId?: string
}

/**
 * Processador principal de mensagens recebidas pelo Bot de WhatsApp
 */
export async function processIncomingWhatsAppMessage(
  params: InboundMessageParams
): Promise<ProcessedBotResult> {
  const { senderPhone, senderName = 'Cliente', text = '', media, messageId } = params
  const cleanPhone = senderPhone.replace(/\D/g, '')

  // 1. Identificar se a mensagem faz referência a um pedido específico
  const extractedOrderId = extractOrderIdentifier(text)
  let order: StoreOrder | null = null

  if (extractedOrderId) {
    order = dataStore.findOrderByNumberOrPhone(extractedOrderId)
  }

  // Se não encontrou pelo texto, tenta encontrar pedido recente pelo número de telefone
  if (!order && cleanPhone) {
    order = dataStore.findOrderByNumberOrPhone(cleanPhone)
  }

  const responsesToSend: string[] = []

  // =========================================================================
  // CASO 1: PEDIDO NÃO IDENTIFICADO
  // =========================================================================
  if (!order) {
    const notFoundMsg = getOrderNotFoundMessage()
    responsesToSend.push(notFoundMsg)

    // Enviar mensagem de orientação via WhatsApp
    await sendWhatsAppTextMessage(senderPhone, notFoundMsg)

    return {
      responseMessages: responsesToSend,
      error: 'Pedido não identificado.',
    }
  }

  // Vincular telefone WhatsApp ao pedido se ainda não estiver preenchido
  if (!order.whatsappPhone && cleanPhone) {
    order.whatsappPhone = cleanPhone
  }

  // =========================================================================
  // CASO 2: RECEÇÃO DE COMPROVATIVO (IMAGEM OU DOCUMENTO PDF)
  // =========================================================================
  if (media && (media.type === 'image' || media.type === 'document' || media.url)) {
    const mediaPayload: WhatsAppMessageMedia = {
      url: media.url || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      type: media.type || 'image',
      filename: media.filename || (media.type === 'document' ? 'comprovativo.pdf' : 'comprovativo.jpg'),
      mimeType: media.mimeType,
    }

    // Registar mensagem do cliente no histórico
    dataStore.addWhatsAppMessage(order.id, {
      sender: 'customer',
      senderName,
      text: text || '📎 [Comprovativo de Pagamento anexado]',
      media: mediaPayload,
    })

    // Atualizar comprovativo e estado do pedido para 'receipt_received'
    dataStore.updateOrderReceipt(order.id, {
      url: mediaPayload.url,
      filename: mediaPayload.filename,
    })

    // Gerar resposta automática de confirmação de receção
    const receiptAckMsg = getReceiptReceivedMessage(order)
    responsesToSend.push(receiptAckMsg)

    dataStore.addWhatsAppMessage(order.id, {
      sender: 'bot',
      senderName: 'ARKNET Bot',
      text: receiptAckMsg,
    })

    await sendWhatsAppTextMessage(senderPhone, receiptAckMsg)

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      botStatus: 'receipt_received',
      responseMessages: responsesToSend,
      receiptAttached: true,
    }
  }

  // =========================================================================
  // CASO 3: INÍCIO DO FLUXO (RECONHECIMENTO DO PEDIDO & DADOS DE PAGAMENTO)
  // =========================================================================
  const isStartMessage =
    extractedOrderId !== null ||
    text.toLowerCase().includes('registar o pedido') ||
    text.toLowerCase().includes('finalizar') ||
    !order.botStatus ||
    order.botStatus === 'bot_active'

  if (isStartMessage && order.status !== 'fechado') {
    // Registar mensagem inicial do cliente
    dataStore.addWhatsAppMessage(order.id, {
      sender: 'customer',
      senderName,
      text: text || `Início de finalização do pedido #${order.orderNumber}`,
    })

    // Resposta 1: Resumo do Pedido
    const summaryMsg = getOrderSummaryMessage(order)
    responsesToSend.push(summaryMsg)

    dataStore.addWhatsAppMessage(order.id, {
      sender: 'bot',
      senderName: 'ARKNET Bot',
      text: summaryMsg,
    })

    await sendWhatsAppTextMessage(senderPhone, summaryMsg)

    // Resposta 2: Instruções de Pagamento (MCX + BAI / BFA)
    const paymentMsg = getPaymentInstructionsMessage(order)
    responsesToSend.push(paymentMsg)

    dataStore.addWhatsAppMessage(order.id, {
      sender: 'bot',
      senderName: 'ARKNET Bot',
      text: paymentMsg,
    })

    await sendWhatsAppTextMessage(senderPhone, paymentMsg)

    // Atualizar estado do bot para aguardar comprovativo
    dataStore.updateOrderBotStatus(order.id, 'waiting_receipt')

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      botStatus: 'waiting_receipt',
      responseMessages: responsesToSend,
    }
  }

  // =========================================================================
  // CASO 4: MENSAGEM DE TEXTO COM DÚVIDA / FORA DO FLUXO PADRÃO -> ESCALAR
  // =========================================================================
  // Registar mensagem do cliente
  dataStore.addWhatsAppMessage(order.id, {
    sender: 'customer',
    senderName,
    text,
  })

  // Se o pedido já estiver fechado/confirmado, avisar que está confirmado
  if (order.status === 'fechado' || order.botStatus === 'confirmed') {
    const confirmedMsg = getOrderConfirmedMessage(order)
    responsesToSend.push(confirmedMsg)

    dataStore.addWhatsAppMessage(order.id, {
      sender: 'bot',
      senderName: 'ARKNET Bot',
      text: confirmedMsg,
    })

    await sendWhatsAppTextMessage(senderPhone, confirmedMsg)

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      botStatus: 'confirmed',
      responseMessages: responsesToSend,
    }
  }

  // Mensagens simples de saudação ou confirmação verbal
  const lower = text.toLowerCase().trim()
  if (['ok', 'obrigado', 'obrigada', 'valeu', 'certo', 'combinado', 'bom dia', 'boa tarde', 'boa noite'].includes(lower)) {
    const politeAck = `Perfeito, *${order.customerName}*! Ficamos a aguardar o envio do comprovativo de pagamento para validarmos a sua encomenda.`
    responsesToSend.push(politeAck)

    dataStore.addWhatsAppMessage(order.id, {
      sender: 'bot',
      senderName: 'ARKNET Bot',
      text: politeAck,
    })

    await sendWhatsAppTextMessage(senderPhone, politeAck)

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      botStatus: order.botStatus || 'waiting_receipt',
      responseMessages: responsesToSend,
    }
  }

  // Qualquer outra dúvida, alteração de pedido, etc. -> NÃO ADIVINHAR: ESCALAR PARA HUMANO
  const escalateMsg = getEscalateToHumanMessage()
  responsesToSend.push(escalateMsg)

  dataStore.addWhatsAppMessage(order.id, {
    sender: 'bot',
    senderName: 'ARKNET Bot',
    text: escalateMsg,
  })

  // Atualizar estado para atenção humana necessária
  dataStore.updateOrderBotStatus(order.id, 'needs_human', `Mensagem do cliente: "${text}"`)

  await sendWhatsAppTextMessage(senderPhone, escalateMsg)

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    botStatus: 'needs_human',
    responseMessages: responsesToSend,
    escalatedToHuman: true,
  }
}
