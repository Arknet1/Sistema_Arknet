/**
 * Tipagens da WhatsApp Business API (Meta Cloud API) e do Bot ARKNET
 */

export interface MetaWebhookPayload {
  object: 'whatsapp_business_account'
  entry?: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: 'whatsapp'
        metadata: {
          display_phone_number: string
          phone_number_id: string
        }
        contacts?: Array<{
          profile: {
            name: string
          }
          wa_id: string
        }>
        messages?: Array<MetaIncomingMessage>
        statuses?: Array<{
          id: string
          status: 'sent' | 'delivered' | 'read' | 'failed'
          timestamp: string
          recipient_id: string
        }>
      }
      field: string
    }>
  }>
}

export interface MetaIncomingMessage {
  from: string // ex: "244923111222"
  id: string
  timestamp: string
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'interactive' | 'button' | 'unknown'
  text?: {
    body: string
  }
  image?: {
    id: string
    mime_type: string
    sha256?: string
    caption?: string
  }
  document?: {
    id: string
    filename?: string
    mime_type: string
    sha256?: string
    caption?: string
  }
  interactive?: {
    type: string
    button_reply?: {
      id: string
      title: string
    }
    list_reply?: {
      id: string
      title: string
      description?: string
    }
  }
}

export interface MetaSendMessagePayload {
  messaging_product: 'whatsapp'
  recipient_type: 'individual'
  to: string
  type: 'text' | 'image' | 'document' | 'interactive'
  text?: {
    preview_url?: boolean
    body: string
  }
  image?: {
    link?: string
    id?: string
    caption?: string
  }
  document?: {
    link?: string
    id?: string
    caption?: string
    filename?: string
  }
}

export interface MetaSendMessageResponse {
  messaging_product: 'whatsapp'
  contacts: Array<{
    input: string
    wa_id: string
  }>
  messages: Array<{
    id: string
  }>
}

export interface ProcessedBotResult {
  orderId?: string
  orderNumber?: string
  botStatus?: 'bot_active' | 'waiting_receipt' | 'receipt_received' | 'needs_human' | 'confirmed'
  responseMessages: string[]
  escalatedToHuman?: boolean
  receiptAttached?: boolean
  error?: string
}
