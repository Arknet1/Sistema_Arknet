/**
 * Modelos e Templates de Mensagens do Bot WhatsApp ARKNET (Português de Angola)
 * Inclui protocolos de segurança, prevenção anti-fraude e indicação de contacto da equipa.
 */

import { StoreOrder } from '../data-store'
import { formatProdutoPrice } from '../format-produto-price'

export const ARKNET_BANK_DETAILS = {
  mcxNumber: '+244 935 208 449',
  holder: 'ARKNET TECNOLOGIA LDA',
  nif: '5412398760',
  baiIban: 'AO06 0040 0000 1234 5678 9012 3',
  bfaIban: 'AO06 0006 0000 9876 5432 1098 7',
  bicIban: 'AO06 0051 0000 5544 3322 1100 9',
  contactPhone: '+244 935 208 449',
}

/**
 * Mensagem 1: Reconhecimento do Pedido e Resumo de Itens
 */
export function getOrderSummaryMessage(order: StoreOrder): string {
  const formattedTotal =
    order.total !== null ? formatProdutoPrice(order.total) : 'Sob consulta'

  const itemsList = (order.items || [])
    .map((item) => {
      const priceStr =
        item.price !== null ? ` (${formatProdutoPrice(item.price)} un.)` : ''
      return `  • *${item.quantity}x* ${item.productName}${priceStr}`
    })
    .join('\n')

  return (
    `Olá *${order.customerName}*! 👋\n` +
    `Recebemos com sucesso o seu pedido *#${order.orderNumber}* registado na Loja Online ARKNET.\n\n` +
    `📦 *Resumo da Encomenda:*\n` +
    `${itemsList}\n\n` +
    `💰 *Valor Total:* *${formattedTotal}*\n` +
    `📍 *Entrega:* ${order.customerAddress || 'A combinar em Luanda'}`
  )
}

/**
 * Mensagem 2: Instruções de Pagamento (MCX + Transferência)
 */
export function getPaymentInstructionsMessage(order: StoreOrder): string {
  const formattedTotal =
    order.total !== null ? formatProdutoPrice(order.total) : 'Sob consulta'

  return (
    `💳 *Instruções para Pagamento:*\n\n` +
    `Para processar o seu pedido, por favor realize o pagamento no valor de *${formattedTotal}* utilizando uma das opções oficiais abaixo:\n\n` +
    `🔹 *1. Multicaixa Express (MCX)*\n` +
    `• Número Comercial: *${ARKNET_BANK_DETAILS.mcxNumber}*\n\n` +
    `🔹 *2. Transferência Bancária*\n` +
    `• *Banco BAI:* \`${ARKNET_BANK_DETAILS.baiIban}\`\n` +
    `• *Banco BFA:* \`${ARKNET_BANK_DETAILS.bfaIban}\`\n` +
    `• *Titular:* ${ARKNET_BANK_DETAILS.holder}\n` +
    `• *NIF:* ${ARKNET_BANK_DETAILS.nif}\n` +
    `• *Descritivo:* ${order.orderNumber}\n\n` +
    `📎 *Próximo Passo:* Após efetuar o pagamento, *envie a foto ou ficheiro PDF do comprovativo aqui nesta conversa*.\n\n` +
    `🔒 *Aviso de Segurança:* A ARKNET nunca solicita transferências para contas em nome de pessoas físicas. Verifique sempre o titular *${ARKNET_BANK_DETAILS.holder}*.`
  )
}

/**
 * Mensagem 3: Confirmação de Receção do Comprovativo & Protocolo de Segurança
 */
export function getReceiptReceivedMessage(order: StoreOrder): string {
  return (
    `✅ *Comprovativo Recebido com Sucesso!*\n\n` +
    `O seu comprovativo referente ao pedido *#${order.orderNumber}* foi anexado e encaminhado para a nossa equipa de validação financeira.\n\n` +
    `⏳ *Processo de Validação:* A nossa equipa financeira irá conferir o crédito na conta bancária institucional e entrará em contacto consigo por este canal para confirmar a aprovação e coordenar a entrega.\n\n` +
    `🔒 *Segurança ARKNET:* Nunca partilhe códigos SMS ou palavras-passe por mensagem. A nossa equipa entrará em contacto apenas pelos canais oficiais.`
  )
}

/**
 * Mensagem 4: Confirmação Final de Pagamento (Disparada no 1-Clique após conferência bancária)
 */
export function getOrderConfirmedMessage(order: StoreOrder): string {
  return (
    `🎉 *Pagamento Validado com Sucesso!*\n\n` +
    `O seu pedido *#${order.orderNumber}* foi conferido no sistema e encontra-se agora em processamento logístico.\n\n` +
    `📄 *Fatura Oficial:* A fatura comercial já se encontra emitida e disponível para descarregamento na sua Área de Cliente ARKNET.\n\n` +
    `🚚 *Expedição & Contacto:* A nossa equipa de logística/estafeta entrará em contacto consigo nas próximas horas pelo número *${order.customerPhone || order.whatsappPhone}* para agendar o horário e local da entrega/levantamento (prazo: 24h a 48h úteis).\n\n` +
    `Agradecemos a sua preferência e confiança na ARKNET!\n` +
    `_ARKNET — Conectividade & Soluções Tecnológicas_`
  )
}

/**
 * Mensagem 5: Escalamento para Operador Humano
 */
export function getEscalateToHumanMessage(): string {
  return (
    `👨‍💼 *Atendimento Personalizado ARKNET*\n\n` +
    `Obrigado pelo seu contacto. Transferi esta conversa para um dos nossos operadores comerciais.\n\n` +
    `A nossa equipa entrará em contacto direto consigo por este canal em breve para esclarecer qualquer dúvida.`
  )
}

/**
 * Mensagem 6: Pedido Não Encontrado
 */
export function getOrderNotFoundMessage(): string {
  return (
    `⚠️ *Pedido Não Identificado*\n\n` +
    `Não conseguimos localizar um pedido ativo com os dados informados.\n\n` +
    `Por favor, aceda ao seu carrinho na Loja Online ARKNET e clique no botão *«Finalizar no WhatsApp»*, ou envie-nos o número do pedido no formato: *#PED-2026-XXXX*.\n\n` +
    `Se precisar de falar diretamente com a nossa equipa comercial, envie-nos uma mensagem e entraremos em contacto.`
  )
}
