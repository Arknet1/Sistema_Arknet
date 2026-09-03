import nodemailer from 'nodemailer'

export interface SendEventEmailParams {
  to: string
  participantName: string
  eventTitle: string
  eventDate: string
  eventTime?: string
  eventLocation: string
  eventFormat: string
  status: 'pendente' | 'confirmada' | 'cancelada'
}

export interface SendEmailResult {
  success: boolean
  message: string
  messageId?: string
  previewUrl?: string | false
  mode: 'real_smtp' | 'ethereal_test' | 'simulated'
  error?: string
}

/**
 * Cria o transportador Nodemailer com base nas variáveis de ambiente ou fallback de teste.
 */
async function createTransporter() {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587
  const secure = process.env.SMTP_SECURE === 'true' || port === 465
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (host && user && pass) {
    return {
      transporter: nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: {
          rejectUnauthorized: false, // Permitir certificados de servidores locais ou corporativos
        },
      }),
      from: process.env.SMTP_FROM || `"ARKNET Eventos" <${user}>`,
      mode: 'real_smtp' as const,
    }
  }

  // Se não houver SMTP configurado no .env, tenta criar uma conta de teste Ethereal real
  try {
    const testAccount = await nodemailer.createTestAccount()
    return {
      transporter: nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      }),
      from: '"ARKNET Eventos (Teste)" <eventos@arknet.co.ao>',
      mode: 'ethereal_test' as const,
    }
  } catch (err) {
    console.warn('[ARKNET Mailer] Não foi possível criar conta de teste Ethereal, modo simulado ativado.')
    return {
      transporter: null,
      from: '"ARKNET Eventos" <eventos@arknet.co.ao>',
      mode: 'simulated' as const,
    }
  }
}

/**
 * Envia o email de evento para o participante
 */
export async function sendEventNotificationEmail(
  params: SendEventEmailParams
): Promise<SendEmailResult> {
  const {
    to,
    participantName,
    eventTitle,
    eventDate,
    eventTime,
    eventLocation,
    eventFormat,
    status,
  } = params

  const formattedDate = new Date(eventDate).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const isPending = status === 'pendente'
  const isConfirmed = status === 'confirmada'
  const isCancelled = status === 'cancelada'

  const subject = isPending
    ? `⏳ Solicitação de Inscrição Recebida — ${eventTitle}`
    : isConfirmed
    ? `🎉 Vaga Aprovada & Confirmada — ${eventTitle}`
    : `Atualização sobre Inscrição — ${eventTitle}`

  const badgeHtml = isPending
    ? `<span style="display:inline-block; background:#fef3c7; color:#92400e; padding:8px 20px; border-radius:999px; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; border:1px solid #fde68a;">
        ⏳ Solicitação Registada · Aguardando Aprovação
      </span>`
    : isConfirmed
    ? `<span style="display:inline-block; background:#dcfce7; color:#166534; padding:8px 20px; border-radius:999px; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; border:1px solid #bbf7d0;">
        ✅ Vaga Confirmada e Aprovada
      </span>`
    : `<span style="display:inline-block; background:#fee2e2; color:#991b1b; padding:8px 20px; border-radius:999px; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">
        ❌ Inscrição Cancelada
      </span>`

  const messageText = isPending
    ? `Recebemos o seu pedido de inscrição para o evento. Devido ao limite rigoroso de lotação, a sua vaga está atualmente <strong>em análise</strong> pela coordenação da ARKNET. Enviaremos a confirmação definitiva assim que validada.`
    : isConfirmed
    ? `Temos o prazer de informar que a sua inscrição no evento foi <strong>oficialmente aprovada e confirmada</strong>! O seu lugar está garantido.`
    : `Informamos que a sua inscrição para este evento não pôde ser confirmada ou foi cancelada.`

  const html = `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0; padding:0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:20px auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #020817 0%, #10316b 100%); padding: 36px 32px; text-align: center;">
        <h1 style="color:#fff; font-size:24px; margin:0 0 6px 0; font-weight:800; letter-spacing:1px;">ARKNET</h1>
        <p style="color:#94a3b8; font-size:11px; margin:0; text-transform:uppercase; letter-spacing:2px;">Gestão Central de Eventos</p>
      </td>
    </tr>
    
    <!-- Body -->
    <tr>
      <td style="padding: 32px;">
        <p style="font-size:16px; color:#1e293b; margin:0 0 12px 0;">
          Olá, <strong>${participantName}</strong>! 👋
        </p>
        <p style="font-size:14px; color:#475569; line-height:1.7; margin:0 0 20px 0;">
          ${messageText}
        </p>
        
        <!-- Status Badge -->
        <div style="margin:20px 0 24px 0; text-align:center;">
          ${badgeHtml}
        </div>

        <!-- Event Details Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;">
          <tr>
            <td style="background:#020817; padding:10px 18px;">
              <p style="color:#fff; font-size:10px; text-transform:uppercase; letter-spacing:2px; margin:0; font-weight:700;">Detalhes do Evento</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px;">
              <h2 style="font-size:16px; color:#020817; margin:0 0 16px 0; font-weight:800; line-height:1.4;">${eventTitle}</h2>
              
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:6px 0; font-size:13px; color:#64748b; width:28%;">📅 Data:</td>
                  <td style="padding:6px 0; font-size:13px; color:#1e293b; font-weight:600;">${formattedDate}</td>
                </tr>
                ${eventTime ? `
                <tr>
                  <td style="padding:6px 0; font-size:13px; color:#64748b;">🕐 Horário:</td>
                  <td style="padding:6px 0; font-size:13px; color:#1e293b; font-weight:600;">${eventTime}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding:6px 0; font-size:13px; color:#64748b;">📍 Local:</td>
                  <td style="padding:6px 0; font-size:13px; color:#1e293b; font-weight:600;">${eventLocation}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; font-size:13px; color:#64748b;">🎯 Formato:</td>
                  <td style="padding:6px 0; font-size:13px; color:#1e293b; font-weight:600;">${eventFormat}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Info Footer Note -->
        <p style="font-size:12px; color:#64748b; line-height:1.6; margin:24px 0 0 0;">
          ${isPending 
            ? 'A equipa da ARKNET analisará a lotação e entrará em contacto para confirmar a atribuição da sua credencial de acesso.'
            : 'Apresente este email ou o seu nome na receção no dia do encontro.'}
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#f8fafc; border-top:1px solid #e2e8f0; padding:20px 32px; text-align:center;">
        <p style="font-size:11px; color:#94a3b8; margin:0 0 4px 0;">
          ARKNET — Soluções de Telecomunicações &amp; Tecnologia
        </p>
        <p style="font-size:10px; color:#cbd5e1; margin:0;">
          Este é um email automático de gestão de eventos.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`

  const { transporter, from, mode } = await createTransporter()

  if (!transporter) {
    console.log(`[ARKNET Mailer] (Simulado) Email para ${to} | Assunto: ${subject}`)
    return {
      success: true,
      message: `Email registrado para envio (${to}).`,
      mode: 'simulated',
    }
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    })

    const previewUrl = mode === 'ethereal_test' ? nodemailer.getTestMessageUrl(info) : undefined

    console.log(`[ARKNET Mailer] ✅ Email enviado para ${to} (MessageID: ${info.messageId}) [Modo: ${mode}]`)
    if (previewUrl) {
      console.log(`[ARKNET Mailer] 🔗 Visualizar email no Ethereal: ${previewUrl}`)
    }

    return {
      success: true,
      message: `Email enviado com sucesso para ${to}!`,
      messageId: info.messageId,
      previewUrl: previewUrl || false,
      mode,
    }
  } catch (err: any) {
    console.error('[ARKNET Mailer] ❌ Erro ao enviar email:', err)
    return {
      success: false,
      message: `Erro ao enviar email: ${err.message || 'Falha no servidor de correio'}`,
      mode,
      error: err.message,
    }
  }
}
