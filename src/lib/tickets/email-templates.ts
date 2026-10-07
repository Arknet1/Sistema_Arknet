import { createTransporter } from '@/lib/email-service'
import { TICKET_TYPE_CONFIG, TICKET_CATEGORY_CONFIG } from './types'

const getSiteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000'

/**
 * Envia e-mail de confirmação ao cliente que submeteu o ticket
 */
export async function sendTicketConfirmationEmail(params: {
  to: string
  name: string
  protocol: string
  type: 'RECLAMACAO' | 'INFORMACAO'
  category: string
  subject: string
  message: string
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { transporter, from } = await createTransporter()
    if (!transporter) {
      console.log(`[SIMULATED EMAIL - TICKET CONFIRMATION] Protocol: ${params.protocol} -> To: ${params.to}`)
      return { success: true, messageId: 'simulated-ticket-confirm' }
    }

    const typeLabel = TICKET_TYPE_CONFIG[params.type]?.label || params.type
    const categoryLabel = (TICKET_CATEGORY_CONFIG as any)[params.category]?.label || params.category
    const isReclamacao = params.type === 'RECLAMACAO'

    const emailSubject = `ARKNET - Receção de ${typeLabel} [${params.protocol}]`

    const html = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px; background-color: #080e1e; border-bottom: 3px solid ${isReclamacao ? '#dc2626' : '#1e60b6'};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 22px; font-weight: 900; letter-spacing: 0.5px; color: #ffffff;">
                      ARKNET<span style="color: ${isReclamacao ? '#dc2626' : '#38bdf8'};">.</span>
                    </span>
                    <div style="font-size: 11px; color: #94a3b8; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">
                      Apoio ao Cliente & Qualidade
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: ${isReclamacao ? 'rgba(220, 38, 38, 0.2)' : 'rgba(30, 96, 182, 0.2)'}; color: ${isReclamacao ? '#f87171' : '#60a5fa'}; border: 1px solid ${isReclamacao ? '#dc2626' : '#1e60b6'}; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 6px;">
                      ${typeLabel}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="font-size: 15px; color: #334155; margin: 0 0 16px 0;">
                Olá <strong>${params.name}</strong>,
              </p>
              
              <p style="font-size: 14px; color: #475569; margin: 0 0 24px 0;">
                Confirmamos a receção do seu pedido no canal oficial da ARKNET. O processo foi registado com sucesso e encontra-se atribuído à nossa equipa de suporte e qualidade para análise prioritária.
              </p>

              <!-- Protocol Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td style="background-color: #f1f5f9; border-left: 4px solid ${isReclamacao ? '#dc2626' : '#1e60b6'}; border-radius: 6px; padding: 16px 20px;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b;">
                      Número de Protocolo
                    </div>
                    <div style="font-size: 20px; font-weight: 900; font-family: Consolas, Monaco, monospace; color: #0f172a; margin-top: 4px;">
                      ${params.protocol}
                    </div>
                    <div style="font-size: 12px; color: #475569; margin-top: 6px;">
                      <strong>Categoria:</strong> ${categoryLabel} | <strong>Assunto:</strong> ${params.subject}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- SLA Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
                <tr>
                  <td>
                    <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
                      ⏱️ Prazo Estimado de Resposta:
                    </div>
                    <div style="font-size: 13px; color: #475569;">
                      A nossa equipa compromete-se a analisar e fornecer uma resposta detalhada no prazo de <strong>24 a 48 horas úteis</strong> através do seu e-mail ou contacto telefónico/WhatsApp disponibilizado.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Resumo da Mensagem -->
              <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">
                Resumo do Conteúdo Enviado:
              </div>
              <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px 16px; font-size: 13px; color: #334155; font-style: italic; margin-bottom: 24px; white-space: pre-wrap;">
                "${params.message.slice(0, 300)}${params.message.length > 300 ? '...' : ''}"
              </div>

              <p style="font-size: 12px; color: #64748b; margin: 0;">
                Guarde este e-mail para eventuais consultas. Caso necessite de adicionar informações adicionais, pode responder diretamente a esta mensagem indicando o número de protocolo no assunto.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="font-size: 12px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">
                ARKNET TECNOLOGIA, LDA.
              </p>
              <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">
                Luanda, Angola | +244 935 208 449 / +244 947 500 000 | comercial@arknet.ao
              </p>
              <p style="font-size: 10px; color: #94a3b8; margin: 0;">
                Este é um e-mail automático gerado pelo sistema de atendimento ao cliente da ARKNET.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    const result = await transporter.sendMail({
      from,
      to: params.to,
      subject: emailSubject,
      html,
    })

    return {
      success: true,
      messageId: result.messageId,
    }
  } catch (error: any) {
    console.error('[ARKNET Mailer] Erro ao enviar e-mail de confirmação de ticket:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Envia notificação interna à equipa administrativa da ARKNET
 */
export async function sendTicketTeamAlertEmail(params: {
  protocol: string
  type: 'RECLAMACAO' | 'INFORMACAO'
  category: string
  priority: string
  name: string
  email: string
  phone?: string | null
  subject: string
  message: string
  ticketId: string
  orderNumber?: string | null
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { transporter, from } = await createTransporter()
    const notifyEmail = process.env.TICKETS_NOTIFY_EMAIL || process.env.SMTP_USER || 'comercial@arknet.ao'

    if (!transporter) {
      console.log(`[SIMULATED EMAIL - TEAM ALERT] Ticket: ${params.protocol} -> To: ${notifyEmail}`)
      return { success: true, messageId: 'simulated-team-alert' }
    }

    const typeLabel = TICKET_TYPE_CONFIG[params.type]?.label || params.type
    const categoryLabel = (TICKET_CATEGORY_CONFIG as any)[params.category]?.label || params.category
    const isReclamacao = params.type === 'RECLAMACAO'
    const adminDetailUrl = `${getSiteUrl()}/admin/reclamacoes/${params.ticketId}`

    const emailSubject = `[ARKNET ALERTA] Novo(a) ${typeLabel}: ${params.protocol} - ${params.subject}`

    const html = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <title>${emailSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden;">
          
          <tr style="background-color: ${isReclamacao ? '#991b1b' : '#1e3a8a'}; color: #ffffff;">
            <td style="padding: 20px 24px;">
              <h2 style="margin: 0; font-size: 18px; font-weight: 800;">
                🚨 Notificação de Novo Ticket de ${typeLabel}
              </h2>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #cbd5e1;">
                Protocolo: <strong>${params.protocol}</strong> | Categoria: <strong>${categoryLabel}</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px;">
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; margin-bottom: 20px;">
                <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Nome do Contacto:</strong> ${params.name}</p>
                <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>E-mail:</strong> <a href="mailto:${params.email}">${params.email}</a></p>
                <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Telefone:</strong> ${params.phone || 'Não facultado'}</p>
                ${params.orderNumber ? `<p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Nº Encomenda Relacionada:</strong> ${params.orderNumber}</p>` : ''}
                <p style="margin: 0; font-size: 13px;"><strong>Prioridade:</strong> <span style="color: ${params.priority === 'ALTA' ? '#dc2626' : '#0f172a'}; font-weight: bold;">${params.priority}</span></p>
              </div>

              <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #1e293b;">
                Assunto: ${params.subject}
              </h4>
              <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 14px; font-size: 13px; color: #334155; white-space: pre-wrap; margin-bottom: 24px;">
                ${params.message}
              </div>

              <div style="text-align: center; margin: 24px 0;">
                <a href="${adminDetailUrl}" style="display: inline-block; background-color: #1e60b6; color: #ffffff; font-size: 13px; font-weight: 800; text-decoration: none; padding: 12px 24px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Abrir Ticket no Painel Admin →
                </a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    const result = await transporter.sendMail({
      from,
      to: notifyEmail,
      subject: emailSubject,
      html,
    })

    return {
      success: true,
      messageId: result.messageId,
    }
  } catch (error: any) {
    console.error('[ARKNET Mailer] Erro ao enviar alerta interno de ticket:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Envia a resposta oficial da equipa ao cliente
 */
export async function sendTicketReplyEmail(params: {
  to: string
  name: string
  protocol: string
  subject: string
  replyContent: string
  adminName?: string | null
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { transporter, from } = await createTransporter()
    if (!transporter) {
      console.log(`[SIMULATED EMAIL - TICKET REPLY] Protocol: ${params.protocol} -> To: ${params.to}`)
      return { success: true, messageId: 'simulated-ticket-reply' }
    }

    const emailSubject = `ARKNET - Resposta ao Pedido [${params.protocol}]`

    const html = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <title>${emailSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px; background-color: #080e1e; border-bottom: 3px solid #1e60b6;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 22px; font-weight: 900; letter-spacing: 0.5px; color: #ffffff;">
                      ARKNET<span style="color: #38bdf8;">.</span>
                    </span>
                    <div style="font-size: 11px; color: #94a3b8; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">
                      Suporte & Atendimento ao Cliente
                    </div>
                  </td>
                  <td align="right">
                    <span style="font-family: Consolas, monospace; font-size: 12px; font-weight: 700; color: #38bdf8;">
                      ${params.protocol}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="font-size: 15px; color: #334155; margin: 0 0 16px 0;">
                Olá <strong>${params.name}</strong>,
              </p>

              <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0;">
                A nossa equipa técnica e comercial analisou o seu processo referente ao assunto <strong>"${params.subject}"</strong>. Segue a resposta oficial:
              </p>

              <!-- Reply Box -->
              <div style="background-color: #f1f5f9; border-left: 4px solid #1e60b6; border-radius: 8px; padding: 20px; font-size: 14px; color: #0f172a; margin-bottom: 24px; white-space: pre-wrap; line-height: 1.7;">
                ${params.replyContent}
              </div>

              ${params.adminName ? `<p style="font-size: 12px; color: #64748b; margin: 0 0 16px 0;">Atendido por: <strong>${params.adminName}</strong> (Equipa ARKNET)</p>` : ''}

              <p style="font-size: 13px; color: #475569; margin: 0;">
                Se necessitar de esclarecimentos adicionais, sinta-se à vontade para responder a esta mensagem mantendo a referência <strong>${params.protocol}</strong>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="font-size: 12px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">
                ARKNET TECNOLOGIA, LDA.
              </p>
              <p style="font-size: 11px; color: #64748b; margin: 0;">
                Luanda, Angola | +244 935 208 449 / +244 947 500 000 | comercial@arknet.ao
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    const result = await transporter.sendMail({
      from,
      to: params.to,
      subject: emailSubject,
      html,
    })

    return {
      success: true,
      messageId: result.messageId,
    }
  } catch (error: any) {
    console.error('[ARKNET Mailer] Erro ao enviar resposta ao cliente:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}
