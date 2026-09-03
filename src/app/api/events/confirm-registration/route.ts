import { NextRequest, NextResponse } from 'next/server'
import { sendEventNotificationEmail } from '@/lib/email-service'

/**
 * POST /api/events/confirm-registration
 * Envia email de notificação / confirmação de evento ao participante via Nodemailer / SMTP / Ethereal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      participantName,
      participantEmail,
      eventTitle,
      eventDate,
      eventTime,
      eventLocation,
      eventFormat,
      status = 'pendente', // 'pendente' | 'confirmada' | 'cancelada'
    } = body

    if (!participantEmail || !participantName || !eventTitle) {
      return NextResponse.json(
        { error: 'Dados de inscrição incompletos para envio de email.' },
        { status: 400 }
      )
    }

    const result = await sendEventNotificationEmail({
      to: participantEmail.trim(),
      participantName: participantName.trim(),
      eventTitle: eventTitle.trim(),
      eventDate,
      eventTime,
      eventLocation,
      eventFormat,
      status,
    })

    return NextResponse.json({
      success: result.success,
      message: result.message,
      previewUrl: result.previewUrl,
      mode: result.mode,
      messageId: result.messageId,
      error: result.error,
    })
  } catch (err: any) {
    console.error('[ARKNET] Erro na rota de envio de email de evento:', err)
    return NextResponse.json(
      { error: err.message || 'Erro ao processar envio do email' },
      { status: 500 }
    )
  }
}
