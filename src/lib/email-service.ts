import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import {
  generateFullNewsletterHtml,
  generateNewsletterPlainText,
  getBaseSiteUrl,
  toAbsoluteUrl,
  ProductBlockData,
  EditorialPromoData,
} from './newsletter-template'

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

export async function sendPasswordRecoveryEmail(to: string, code: string, userName?: string): Promise<SendEmailResult> {
  const { transporter, mode } = await createTransporter()
  const subject = 'ARKNET - Código de recuperação de palavra-passe'
  const displayName = userName ? userName : 'Cliente'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://arknet.co.ao'
  const resetLink = `${siteUrl}/login?tab=recuperar&email=${encodeURIComponent(to)}&code=${encodeURIComponent(code)}`

  // Template moderno, otimizado para deliverability e compatibilidade com Gmail / Outlook
  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="pt">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased; line-height: 1.6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0f172a; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 800; letter-spacing: 0.5px; color: #ffffff;">
                      ARKNET<span style="color: #38bdf8;">.</span>
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">
                      Segurança
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Corpo Principal -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0;">
                Recuperação de palavra-passe
              </h1>

              <p style="font-size: 14px; color: #334155; margin: 0 0 20px 0;">
                Olá <strong>${displayName}</strong>, recebemos um pedido para repor a palavra-passe da sua conta associada ao endereço <strong>${to}</strong>.
              </p>

              <p style="font-size: 13px; color: #475569; margin: 0 0 12px 0;">
                Utilize o seguinte código de verificação para prosseguir:
              </p>

              <!-- Caixa do Código -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td align="center" style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px;">
                    <span style="font-family: Consolas, Monaco, 'Courier New', monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f172a;">
                      ${code}
                    </span>
                    <div style="font-size: 12px; color: #64748b; margin-top: 6px;">
                      Código válido durante 15 minutos
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Botão Direto -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" style="display: inline-block; background-color: #0284c7; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 6px;">
                      Redefinir palavra-passe
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />

              <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 1.5;">
                Se não solicitou a redefinição de palavra-passe, ignore esta mensagem com segurança. Nenhuma alteração será efetuada na sua conta.
              </p>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="padding: 16px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                ARKNET Angola · Luanda · Apoio ao Cliente: arknet40@gmail.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const text = `ARKNET - Recuperação de Palavra-passe\n\nOlá ${displayName},\n\nO seu código de verificação é: ${code}\n\nEste código é válido por 15 minutos.\n\nOu aceda diretamente ao link:\n${resetLink}\n\nSe não fez este pedido, ignore esta mensagem.\n\nARKNET Angola`

  if (!transporter) {
    return { success: false, message: 'O serviço de correio electrónico não está disponível.', mode }
  }

  try {
    const senderEmail = process.env.SMTP_USER || 'arknet40@gmail.com'
    const fromHeader = process.env.SMTP_FROM || `"ARKNET" <${senderEmail}>`

    const info = await transporter.sendMail({
      from: fromHeader,
      to,
      replyTo: senderEmail,
      subject,
      text,
      html,
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
      },
    })

    const recipientAccepted = info.accepted && info.accepted.some((recipient) => String(recipient).toLowerCase() === to.toLowerCase())
    if (!recipientAccepted && (!info.accepted || info.accepted.length === 0)) {
      return {
        success: false,
        message: 'O servidor de email não aceitou o endereço destinatário.',
        mode,
        error: `SMTP rejected recipient (${(info.rejected || []).length} rejected)`,
      }
    }

    console.log(`[ARKNET Mailer] Código de recuperação enviado para ${to} (MessageID: ${info.messageId}) [Modo: ${mode}]`)

    return {
      success: true,
      message: 'Código de recuperação enviado com sucesso para o seu email.',
      messageId: info.messageId,
      previewUrl: mode === 'ethereal_test' ? (nodemailer.getTestMessageUrl(info) as string | false) : undefined,
      mode,
    }
  } catch (error: any) {
    console.error('[ARKNET Mailer] [Erro] Falha ao enviar código de recuperação:', error)
    return { success: false, message: 'Não foi possível enviar o código de recuperação.', mode, error: error.message }
  }
}

/**
 * Cria o transportador Nodemailer com base nas variáveis de ambiente ou fallback de teste.
 */
export async function createTransporter() {
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
          rejectUnauthorized: false,
          minVersion: 'TLSv1.2',
        },
        connectionTimeout: 9000,
        greetingTimeout: 9000,
        socketTimeout: 15000,
      }),
      from: process.env.SMTP_FROM || `"ARKNET" <${user}>`,
      mode: 'real_smtp' as const,
    }
  }

  if (host || user || pass) {
    console.error('[ARKNET Mailer] Configuração SMTP incompleta. Verifique SMTP_HOST, SMTP_USER e SMTP_PASS.')
    return {
      transporter: null,
      from: process.env.SMTP_FROM || 'ARKNET',
      mode: 'simulated' as const,
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
      from: '"ARKNET (Teste)" <arknet40@gmail.com>',
      mode: 'ethereal_test' as const,
    }
  } catch (err) {
    console.warn('[ARKNET Mailer] Não foi possível criar conta de teste Ethereal, modo simulado ativado.')
    return {
      transporter: null,
      from: '"ARKNET" <arknet40@gmail.com>',
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
    ? `Solicitação de Inscrição Recebida: ${eventTitle}`
    : isConfirmed
    ? `Vaga Aprovada e Confirmada: ${eventTitle}`
    : `Atualização sobre Inscrição: ${eventTitle}`

  const badgeHtml = isPending
    ? `<span style="display:inline-block; background:#fef3c7; color:#92400e; padding:8px 20px; border-radius:999px; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; border:1px solid #fde68a;">
        Solicitação Registada · Aguardando Aprovação
      </span>`
    : isConfirmed
    ? `<span style="display:inline-block; background:#dcfce7; color:#166534; padding:8px 20px; border-radius:999px; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; border:1px solid #bbf7d0;">
        Vaga Confirmada e Aprovada
      </span>`
    : `<span style="display:inline-block; background:#fee2e2; color:#991b1b; padding:8px 20px; border-radius:999px; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">
        Inscrição Cancelada
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
          Olá, <strong>${participantName}</strong>!
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
                  <td style="padding:6px 0; font-size:13px; color:#64748b; width:28%;">Data:</td>
                  <td style="padding:6px 0; font-size:13px; color:#1e293b; font-weight:600;">${formattedDate}</td>
                </tr>
                ${eventTime ? `
                <tr>
                  <td style="padding:6px 0; font-size:13px; color:#64748b;">Horário:</td>
                  <td style="padding:6px 0; font-size:13px; color:#1e293b; font-weight:600;">${eventTime}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding:6px 0; font-size:13px; color:#64748b;">Local:</td>
                  <td style="padding:6px 0; font-size:13px; color:#1e293b; font-weight:600;">${eventLocation}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; font-size:13px; color:#64748b;">Formato:</td>
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
          ARKNET, Soluções de Telecomunicações e Tecnologia
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

    console.log(`[ARKNET Mailer] Email enviado para ${to} (MessageID: ${info.messageId}) [Modo: ${mode}]`)
    if (previewUrl) {
      console.log(`[ARKNET Mailer] Visualizar email no Ethereal: ${previewUrl}`)
    }

    return {
      success: true,
      message: `Email enviado com sucesso para ${to}!`,
      messageId: info.messageId,
      previewUrl: previewUrl || false,
      mode,
    }
  } catch (err: any) {
    console.error('[ARKNET Mailer] [Erro] Falha ao enviar email:', err)
    return {
      success: false,
      message: `Erro ao enviar email: ${err.message || 'Falha no servidor de correio'}`,
      mode,
      error: err.message,
    }
  }
}

/**
 * Interface para envio de newsletters em massa
 */
export interface SendNewsletterParams {
  to: string
  subject: string
  htmlBody: string
  templateType?: 'editorial' | 'classic'
  editionLabel?: string
  coverImage?: string | null
  coverImageAlt?: string | null
  coverTitle?: string
  coverSubtitle?: string
  offerBannerImage?: string | null
  offerBannerAlt?: string | null
  offerBannerLink?: string | null
  promo?: EditorialPromoData | null
  featuredProducts?: ProductBlockData[] | null
  unsubscribeEmail?: string
}

export interface NodemailerAttachment {
  filename: string
  path?: string
  content?: Buffer | string
  cid: string
  contentType?: string
}

/**
 * Processa o HTML e as Imagens dos blocos para transformar imagens locais (/uploads/...) em Inline Attachments (CID).
 */
export function processEmailAttachments(
  params: {
    rawHtml: string
    coverImage?: string | null
    offerBannerImage?: string | null
    featuredProducts?: ProductBlockData[] | null
  },
  baseUrl: string = getBaseSiteUrl()
): {
  processedHtml: string
  processedCover: string | null
  processedBanner: string | null
  processedProducts: ProductBlockData[] | null
  attachments: NodemailerAttachment[]
} {
  const attachments: NodemailerAttachment[] = []
  const publicDir = path.join(process.cwd(), 'public')
  let cidCounter = 1

  const registerLocalImage = (imgSrc: string | null | undefined): string => {
    if (!imgSrc) return ''
    const trimmed = imgSrc.trim()
    if (!trimmed) return ''

    let localRelative = ''
    if (trimmed.startsWith('/')) {
      localRelative = trimmed.replace(/^\//, '')
    } else if (trimmed.includes('uploads/')) {
      const idx = trimmed.indexOf('uploads/')
      if (idx !== -1) localRelative = trimmed.substring(idx)
    } else if (trimmed.includes('images/')) {
      const idx = trimmed.indexOf('images/')
      if (idx !== -1) localRelative = trimmed.substring(idx)
    }

    if (localRelative) {
      const cleanRel = localRelative.split('?')[0].split('#')[0]
      const fullPath = path.join(publicDir, cleanRel)

      if (fs.existsSync(fullPath)) {
        const cid = `arknet_img_${cidCounter++}_${Date.now()}`
        attachments.push({
          filename: path.basename(cleanRel),
          path: fullPath,
          cid: cid,
        })
        return `cid:${cid}`
      }
    }

    return toAbsoluteUrl(trimmed, baseUrl)
  }

  // 1. Processar Imagem de Capa
  const processedCover = params.coverImage ? registerLocalImage(params.coverImage) : null

  // 2. Processar Banner de Oferta
  const processedBanner = params.offerBannerImage ? registerLocalImage(params.offerBannerImage) : null

  // 3. Processar Imagens dos 3 Produtos Mais Pedidos
  let processedProducts: ProductBlockData[] | null = null
  if (params.featuredProducts && Array.isArray(params.featuredProducts)) {
    processedProducts = params.featuredProducts.map((p) => ({
      ...p,
      image: registerLocalImage(p.image),
    }))
  }

  // 4. Processar todas as tags <img src="..." /> no corpo HTML
  let processedHtml = params.rawHtml || ''
  processedHtml = processedHtml.replace(/<img([^>]+)src=(["'])(.*?)\2([^>]*)>/gi, (match, before, quote, src, after) => {
    const newSrc = registerLocalImage(src)
    return `<img${before}src=${quote}${newSrc}${quote}${after}>`
  })

  return {
    processedHtml,
    processedCover,
    processedBanner,
    processedProducts,
    attachments,
  }
}

/**
 * Envia um email de newsletter para um subscritor individual
 */
export async function sendNewsletterEmail(params: SendNewsletterParams): Promise<SendEmailResult> {
  const {
    to,
    subject,
    htmlBody,
    coverImage,
    coverImageAlt,
    offerBannerImage,
    offerBannerAlt,
    offerBannerLink,
    promo,
    featuredProducts,
    unsubscribeEmail,
    templateType,
    editionLabel,
    coverTitle,
    coverSubtitle,
  } = params

  const { transporter, from, mode } = await createTransporter()
  const siteUrl = getBaseSiteUrl()

  // Processar imagens locais para embutir como inline attachments (CID) garantindo exibição no Gmail/Outlook
  const {
    processedHtml,
    processedCover,
    processedBanner,
    processedProducts,
    attachments,
  } = processEmailAttachments(
    {
      rawHtml: htmlBody,
      coverImage,
      offerBannerImage,
      featuredProducts,
    },
    siteUrl
  )

  // Montar HTML com template editorial por defeito (ou clássico se solicitado)
  const html = generateFullNewsletterHtml({
    subject,
    htmlBody: processedHtml,
    templateType,
    editionLabel,
    coverImage: processedCover,
    coverImageAlt,
    coverTitle,
    coverSubtitle,
    offerBannerImage: processedBanner,
    offerBannerAlt,
    offerBannerLink,
    promo,
    featuredProducts: processedProducts,
    siteUrl,
    unsubscribeEmail,
    isPreview: false,
  })

  const text = generateNewsletterPlainText(subject, htmlBody, siteUrl, featuredProducts, templateType, promo)

  if (!transporter) {
    console.log(`[ARKNET Mailer] (Simulado) Newsletter para ${to} | Assunto: ${subject}`)
    return {
      success: true,
      message: `Newsletter registada para envio (${to}).`,
      mode: 'simulated',
    }
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: `ARKNET Newsletter: ${subject}`,
      text,
      html,
      attachments: attachments.length > 0 ? attachments : undefined,
      headers: {
        'X-Priority': '3',
        'List-Unsubscribe': `<mailto:${unsubscribeEmail || process.env.SMTP_USER || 'arknet40@gmail.com'}?subject=Cancelar%20Newsletter>`,
        'Precedence': 'bulk',
      },
    })

    console.log(`[ARKNET Mailer] Newsletter enviada para ${to} (MessageID: ${info.messageId}) [Modo: ${mode}]`)

    return {
      success: true,
      message: `Newsletter enviada para ${to}`,
      messageId: info.messageId,
      previewUrl: mode === 'ethereal_test' ? (nodemailer.getTestMessageUrl(info) as string | false) : undefined,
      mode,
    }
  } catch (err: any) {
    console.error(`[ARKNET Mailer] [Erro] Falha ao enviar newsletter para ${to}:`, err.message)
    return {
      success: false,
      message: `Erro ao enviar para ${to}: ${err.message}`,
      mode,
      error: err.message,
    }
  }
}


/**
 * Envia um email de boas-vindas / confirmação de subscrição na newsletter
 */
export async function sendNewsletterWelcomeEmail(to: string): Promise<SendEmailResult> {
  const { transporter, from, mode } = await createTransporter()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://arknet.co.ao'

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="pt">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bem-vindo à Newsletter ARKNET</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased; line-height: 1.6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
          
          <!-- Header com Gradiente -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <span style="font-size: 26px; font-weight: 800; letter-spacing: 1px; color: #ffffff;">
                      ARKNET<span style="color: #38bdf8;">.</span>
                    </span>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 4px; text-transform: uppercase; letter-spacing: 2px;">
                      Inovação & Tecnologia
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Conteúdo de Boas-Vindas -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; line-height: 1.4;">
                Bem-vindo(a) à nossa comunidade!
              </h1>
              <p style="font-size: 14px; color: #475569; margin: 0 0 16px 0; line-height: 1.7;">
                A sua subscrição na <strong>Newsletter da ARKNET</strong> foi confirmada com sucesso.
              </p>
              <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.7;">
                A partir de agora, receberá em primeira mão as nossas novidades tecnológicas, lançamentos de novos produtos e serviços, artigos técnicos exclusivos e ofertas especiais para o mercado angolano.
              </p>

              <!-- Destaques -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin: 20px 0; padding: 16px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                      O que esperar dos nossos emails:
                    </div>
                    <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.8;">
                      <li>Tendências e inovações no setor de TI e Telecomunicações em Angola</li>
                      <li>Novidades sobre os produtos, equipamentos e serviços ARKNET</li>
                      <li>Convites e descontos para cursos e workshops da ARKNET Academy</li>
                      <li>Condições exclusivas para empresas e clientes subscritores</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0 12px 0;">
                <tr>
                  <td align="center">
                    <a href="${siteUrl}" style="display: inline-block; background-color: #0284c7; color: #ffffff; font-size: 13px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 6px;">
                      Explorar o Portal ARKNET
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="padding: 16px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0 0 6px 0;">
                ARKNET Angola · Luanda · Soluções de Telecomunicações e Tecnologia
              </p>
              <p style="font-size: 10px; color: #cbd5e1; margin: 0;">
                Recebeu este email por ter subscrito a newsletter ARKNET (${to}).
                <br />
                <a href="mailto:${process.env.SMTP_USER || 'arknet40@gmail.com'}?subject=Cancelar%20Subscricao%20Newsletter&body=Pretendo%20cancelar%20a%20minha%20subscricao%20da%20newsletter%20ARKNET.%20Email:%20${encodeURIComponent(to)}" style="color: #64748b; text-decoration: underline;">Cancelar subscrição</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const text = `ARKNET - Bem-vindo à Newsletter\n\nA sua subscrição na Newsletter da ARKNET foi confirmada com sucesso (${to}).\n\nA partir de agora receberá as principais novidades tecnológicas, produtos, serviços e ofertas da ARKNET.\n\nVisite: ${siteUrl}\n\n---\nPara cancelar a subscrição, responda a este email.`

  if (!transporter) {
    console.log(`[ARKNET Mailer] (Simulado) Boas-vindas newsletter para ${to}`)
    return {
      success: true,
      message: `Email de boas-vindas registado (${to}).`,
      mode: 'simulated',
    }
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: 'Bem-vindo à Newsletter ARKNET',
      text,
      html,
    })

    console.log(`[ARKNET Mailer] Boas-vindas newsletter enviada para ${to} (MessageID: ${info.messageId}) [Modo: ${mode}]`)

    return {
      success: true,
      message: `Email de boas-vindas enviado para ${to}`,
      messageId: info.messageId,
      previewUrl: mode === 'ethereal_test' ? (nodemailer.getTestMessageUrl(info) as string | false) : undefined,
      mode,
    }
  } catch (err: any) {
    console.error(`[ARKNET Mailer] [Erro] Falha ao enviar boas-vindas newsletter para ${to}:`, err.message)
    return {
      success: false,
      message: `Erro ao enviar boas-vindas para ${to}: ${err.message}`,
      mode,
      error: err.message,
    }
  }
}

