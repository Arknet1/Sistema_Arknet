import { NextRequest, NextResponse } from 'next/server'
import { MetaWebhookPayload } from '@/lib/whatsapp/types'
import { processIncomingWhatsAppMessage } from '@/lib/whatsapp/state-machine'
import { getMetaMediaUrl } from '@/lib/whatsapp/meta-api'

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'ARKNET_WHATSAPP_VERIFY_TOKEN'

/**
 * GET: Verificação de Webhook pela Meta Cloud API
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[WhatsApp Webhook] Verificação efetuada com sucesso!')
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

/**
 * POST: Receção de eventos e mensagens da Meta Cloud API
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MetaWebhookPayload

    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ignored' }, { status: 200 })
    }

    const entries = body.entry || []
    for (const entry of entries) {
      const changes = entry.changes || []
      for (const change of changes) {
        const value = change.value
        if (change.field !== 'messages' || !value.messages) continue

        const contacts = value.contacts || []
        const contactName = contacts[0]?.profile?.name || 'Cliente'

        for (const message of value.messages) {
          const fromPhone = message.from
          const messageType = message.type
          let textBody = ''
          let mediaPayload:
            | {
                url?: string
                type?: 'image' | 'document' | 'audio' | 'video'
                filename?: string
                mimeType?: string
              }
            | undefined = undefined

          if (messageType === 'text' && message.text) {
            textBody = message.text.body
          } else if (messageType === 'image' && message.image) {
            textBody = message.image.caption || ''
            const mediaUrl = await getMetaMediaUrl(message.image.id)
            mediaPayload = {
              url: mediaUrl || undefined,
              type: 'image',
              mimeType: message.image.mime_type,
            }
          } else if (messageType === 'document' && message.document) {
            textBody = message.document.caption || ''
            const mediaUrl = await getMetaMediaUrl(message.document.id)
            mediaPayload = {
              url: mediaUrl || undefined,
              type: 'document',
              filename: message.document.filename || 'comprovativo.pdf',
              mimeType: message.document.mime_type,
            }
          } else if (messageType === 'interactive' && message.interactive) {
            textBody =
              message.interactive.button_reply?.title ||
              message.interactive.list_reply?.title ||
              ''
          }

          // Processar a mensagem através do motor do Bot
          await processIncomingWhatsAppMessage({
            senderPhone: fromPhone,
            senderName: contactName,
            text: textBody,
            media: mediaPayload,
            messageId: message.id,
          })
        }
      }
    }

    return NextResponse.json({ status: 'success' }, { status: 200 })
  } catch (error: any) {
    console.error('[WhatsApp Webhook Handler Error]:', error)
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}
