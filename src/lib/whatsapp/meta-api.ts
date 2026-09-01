/**
 * Cliente para a WhatsApp Business API (Meta Cloud API)
 */

import { MetaSendMessagePayload, MetaSendMessageResponse } from './types'

const META_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0'
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN

/**
 * Enviar mensagem de texto via WhatsApp Cloud API
 */
export async function sendWhatsAppTextMessage(
  to: string,
  text: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const cleanPhone = to.replace(/\D/g, '')

  // Se não houver credenciais reais configuradas em ambiente, simula o envio com sucesso
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.log(`[WHATSAPP MOCK SEND] To: ${cleanPhone} | Message: ${text.slice(0, 80)}...`)
    return {
      success: true,
      messageId: `mock-msg-${Date.now()}`,
    }
  }

  const payload: MetaSendMessagePayload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanPhone,
    type: 'text',
    text: {
      preview_url: false,
      body: text,
    },
  }

  try {
    const url = `https://graph.facebook.com/${META_API_VERSION}/${PHONE_NUMBER_ID}/messages`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    })

    const data = (await response.json()) as MetaSendMessageResponse & { error?: any }

    if (!response.ok || data.error) {
      console.error('[Meta Cloud API Error]:', data.error || response.statusText)
      return {
        success: false,
        error: data.error?.message || `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    }
  } catch (err: any) {
    console.error('[Meta Cloud API Fetch Exception]:', err)
    return {
      success: false,
      error: err.message || 'Falha na conexão com a Meta Cloud API',
    }
  }
}

/**
 * Enviar mensagem com mídia (Imagem ou Documento PDF)
 */
export async function sendWhatsAppMediaMessage(
  to: string,
  mediaUrl: string,
  type: 'image' | 'document',
  caption?: string,
  filename?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const cleanPhone = to.replace(/\D/g, '')

  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.log(`[WHATSAPP MOCK MEDIA] To: ${cleanPhone} | Type: ${type} | URL: ${mediaUrl}`)
    return {
      success: true,
      messageId: `mock-media-${Date.now()}`,
    }
  }

  const payload: MetaSendMessagePayload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanPhone,
    type: type,
    ...(type === 'image'
      ? {
          image: {
            link: mediaUrl,
            caption: caption,
          },
        }
      : {
          document: {
            link: mediaUrl,
            caption: caption,
            filename: filename || 'documento.pdf',
          },
        }),
  }

  try {
    const url = `https://graph.facebook.com/${META_API_VERSION}/${PHONE_NUMBER_ID}/messages`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    })

    const data = (await response.json()) as MetaSendMessageResponse & { error?: any }

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || 'Falha ao enviar mídia via WhatsApp',
      }
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    }
  }
}

/**
 * Obter URL de download de uma mídia recebida via Meta Cloud API
 */
export async function getMetaMediaUrl(mediaId: string): Promise<string | null> {
  if (!ACCESS_TOKEN) return null

  try {
    const url = `https://graph.facebook.com/${META_API_VERSION}/${mediaId}`
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    })
    const data = await response.json()
    return data.url || null
  } catch (err) {
    console.error('Error fetching Meta Media URL:', err)
    return null
  }
}
