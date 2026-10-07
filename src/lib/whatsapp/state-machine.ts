/**
 * Motor de Fluxo e Máquina de Estados do Bot WhatsApp ARKNET
 * Com memória de sessão para manter contexto entre mensagens
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
import { generateDomingasResponse } from './domingas-engine'
import { sessionStore } from './session-store'

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
 * Agora com contexto de sessão persistente por número de telefone
 */
export async function processIncomingWhatsAppMessage(
  params: InboundMessageParams
): Promise<ProcessedBotResult> {
  const { senderPhone, senderName = 'Cliente', text = '', media, messageId } = params
  const cleanPhone = senderPhone.replace(/\D/g, '')

  // 1. Obter/criar sessão do cliente para manter contexto
  const session = sessionStore.getSession(cleanPhone)

  // 2. Se o nome foi fornecido externamente (ex.: do simulador) e ainda não há nome na sessão
  if (senderName && senderName !== 'Cliente' && senderName !== 'Cliente Teste' && !session.clientName) {
    sessionStore.updateClient(cleanPhone, { name: senderName })
  }

  // 3. Identificar se a mensagem faz referência a um pedido específico
  const extractedOrderId = extractOrderIdentifier(text)
  let order: StoreOrder | null = null

  if (extractedOrderId) {
    order = dataStore.findOrderByNumberOrPhone(extractedOrderId)
  }

  // Se não encontrou pelo texto, tenta encontrar pedido recente pelo número de telefone
  if (!order && cleanPhone) {
    order = dataStore.findOrderByNumberOrPhone(cleanPhone)
  }

  // Se a sessão tem um pedido ativo, tentar usar
  if (!order && session.activeOrderNumber) {
    order = dataStore.findOrderByNumberOrPhone(session.activeOrderNumber)
  }

  const responsesToSend: string[] = []

  // =========================================================================
  // CASO 1: PEDIDO NÃO IDENTIFICADO OU CONSULTA GERAL COM DOMINGAS MANUEL
  // =========================================================================
  if (!order) {
    // Usar o nome da sessão se disponível para contexto
    const contextName = session.clientName || senderName
    const contextTitle = session.clientTitle || 'Sr.'

    const domingasReply = generateDomingasResponse(text, {
      senderPhone: cleanPhone,
      senderName: contextName,
      customerTitle: contextTitle,
    })

    responsesToSend.push(domingasReply.text)

    // Se o motor de Domingas extraiu um nome, persistir na sessão
    if (domingasReply.extractedCustomerName) {
      sessionStore.updateClient(cleanPhone, {
        name: domingasReply.extractedCustomerName,
        title: domingasReply.extractedCustomerTitle,
      })
    }

    // Enviar mensagem via WhatsApp Cloud API
    await sendWhatsAppTextMessage(senderPhone, domingasReply.text)

    return {
      responseMessages: responsesToSend,
      botStatus: domingasReply.escalateToHuman ? 'needs_human' : 'bot_active',
      escalatedToHuman: domingasReply.escalateToHuman,
    }
  }

  // Vincular telefone WhatsApp ao pedido se ainda não estiver preenchido
  if (!order.whatsappPhone && cleanPhone) {
    order.whatsappPhone = cleanPhone
  }

  // Registar pedido ativo na sessão
  sessionStore.setActiveOrder(cleanPhone, order.orderNumber)

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
      senderName: session.clientName || senderName,
      text: text || '[Comprovativo de Pagamento anexado]',
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

    sessionStore.setBotState(cleanPhone, 'waiting_receipt')
    sessionStore.addMessage(cleanPhone, 'bot', receiptAckMsg)

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
      senderName: session.clientName || senderName,
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
    sessionStore.setBotState(cleanPhone, 'waiting_receipt')
    sessionStore.setLastTopic(cleanPhone, 'pagamento')

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
    senderName: session.clientName || senderName,
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

    sessionStore.addMessage(cleanPhone, 'bot', confirmedMsg)

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
    const customerName = session.clientName || order.customerName
    const politeAck = `Perfeito, *${customerName}*! Ficamos a aguardar o envio do comprovativo de pagamento para validarmos a sua encomenda.`
    responsesToSend.push(politeAck)

    dataStore.addWhatsAppMessage(order.id, {
      sender: 'bot',
      senderName: 'ARKNET Bot',
      text: politeAck,
    })

    sessionStore.addMessage(cleanPhone, 'bot', politeAck)

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
  sessionStore.setBotState(cleanPhone, 'needs_human')
  sessionStore.addMessage(cleanPhone, 'bot', escalateMsg)

  await sendWhatsAppTextMessage(senderPhone, escalateMsg)

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    botStatus: 'needs_human',
    responseMessages: responsesToSend,
    escalatedToHuman: true,
  }
}
