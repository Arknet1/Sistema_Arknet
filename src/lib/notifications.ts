import nodemailer from 'nodemailer'
import { formatCurrencyAOA } from './newsletter-template'

/**
 * Cria o transportador SMTP para envio de notificações automáticas
 */
async function getMailer() {
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
        tls: { rejectUnauthorized: false, minVersion: 'TLSv1.2' },
      }),
      from: process.env.SMTP_FROM || `"ARKNET Sistema" <${user}>`,
      adminEmail: user || 'arknet40@gmail.com',
    }
  }

  // Modo de teste Ethereal ou Simulado
  try {
    const testAccount = await nodemailer.createTestAccount()
    return {
      transporter: nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      }),
      from: '"ARKNET Notificações (Teste)" <arknet40@gmail.com>',
      adminEmail: 'arknet40@gmail.com',
    }
  } catch {
    return {
      transporter: null,
      from: '"ARKNET" <arknet40@gmail.com>',
      adminEmail: 'arknet40@gmail.com',
    }
  }
}

/**
 * Notifica o cliente e a equipa comercial de uma nova encomenda na loja
 */
export async function notifyNewOrder(order: any) {
  try {
    const { transporter, from, adminEmail } = await getMailer()
    if (!transporter) return

    const itemsHtml = (order.items || [])
      .map(
        (it: any) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #1e293b;">
          <strong>${it.productName}</strong> ${it.variantLabel ? `<br /><span style="font-size: 11px; color: #64748b;">${it.variantLabel}</span>` : ''}
        </td>
        <td align="center" style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #475569;">
          ${it.quantity}
        </td>
        <td align="right" style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #0f172a;">
          ${formatCurrencyAOA(it.price ? it.price * (it.quantity || 1) : null)}
        </td>
      </tr>`
      )
      .join('')

    const totalText = formatCurrencyAOA(order.total)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://arknet.co.ao'

    const emailHtml = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <title>Encomenda ${order.orderNumber || order.id} - ARKNET</title>
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
    <tr>
      <td style="background: #0f172a; padding: 24px 32px; text-align: center;">
        <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 1px;">ARKNET<span style="color: #38bdf8;">.</span></span>
        <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; margin-top: 4px;">Confirmação de Encomenda</div>
      </td>
    </tr>
    <tr>
      <td style="padding: 28px 32px;">
        <h2 style="font-size: 18px; color: #0f172a; margin: 0 0 12px 0;">Olá, ${order.customerName}!</h2>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
          Recebemos com sucesso a sua encomenda número <strong>${order.orderNumber || order.id}</strong>. A nossa equipa já está a preparar o seu pedido.
        </p>

        <!-- Tabela de Itens -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 6px; margin: 0 0 20px 0;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th align="left" style="padding: 10px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569;">Item</th>
              <th align="center" style="padding: 10px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569;">Qtd</th>
              <th align="right" style="padding: 10px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr style="background-color: #f8fafc;">
              <td colspan="2" align="right" style="padding: 12px; font-size: 13px; font-weight: 700; color: #0f172a;">Total Geral:</td>
              <td align="right" style="padding: 12px; font-size: 16px; font-weight: 800; color: #0284c7;">${totalText}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Detalhes do Cliente -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin-bottom: 20px; font-size: 12px; color: #475569; line-height: 1.6;">
          <p style="margin: 0 0 4px 0;"><strong>Contacto:</strong> ${order.customerPhone || 'Não especificado'}</p>
          <p style="margin: 0 0 4px 0;"><strong>Local de Entrega:</strong> ${order.customerAddress || ''} ${order.customerCity ? `(${order.customerCity})` : ''}</p>
          ${order.customerNif ? `<p style="margin: 0;"><strong>NIF:</strong> ${order.customerNif}</p>` : ''}
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0;">
          Para acompanhar o estado ou esclarecer dúvidas, contacte-nos pelo WhatsApp ou responda a esta mensagem.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 16px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8;">
        ARKNET Angola · Luanda · <a href="${siteUrl}" style="color: #0284c7; text-decoration: none;">www.arknet.co.ao</a>
      </td>
    </tr>
  </table>
</body>
</html>`

    // 1. Enviar para o cliente
    if (order.customerEmail) {
      await transporter.sendMail({
        from,
        to: order.customerEmail,
        subject: `ARKNET - Confirmação de Encomenda ${order.orderNumber || order.id}`,
        html: emailHtml,
      })
    }

    // 2. Alerta para a equipa comercial
    await transporter.sendMail({
      from,
      to: adminEmail,
      subject: `[Nova Encomenda Loja] ${order.orderNumber || order.id} - ${order.customerName} (${totalText})`,
      html: emailHtml,
    })

    console.log(`[Notificação] Emails de encomenda ${order.orderNumber || order.id} enviados com sucesso.`)
  } catch (err: any) {
    console.warn('[Notificação Encomenda] Erro não bloqueante:', err.message)
  }
}

/**
 * Notifica a equipa comercial sobre um novo pedido de cotação / Lead
 */
export async function notifyNewLead(lead: any) {
  try {
    const { transporter, from, adminEmail } = await getMailer()
    if (!transporter) return

    const html = `<!DOCTYPE html>
<html lang="pt">
<body style="font-family: sans-serif; background: #f8fafc; padding: 20px;">
  <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
    <h3 style="color: #0f172a; margin-top: 0;">Novo Pedido de Contacto / Lead Comercial</h3>
    <table width="100%" style="font-size: 13px; color: #334155; line-height: 1.8;">
      <tr><td><strong>Nome:</strong></td><td>${lead.name}</td></tr>
      <tr><td><strong>Email:</strong></td><td><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
      <tr><td><strong>Telefone:</strong></td><td><a href="tel:${lead.phone}">${lead.phone}</a></td></tr>
      <tr><td><strong>Serviço Solicitado:</strong></td><td><strong style="color: #0284c7;">${lead.service}</strong></td></tr>
      <tr><td valign="top"><strong>Mensagem:</strong></td><td style="background: #f1f5f9; padding: 10px; border-radius: 4px;">${lead.message || 'Sem mensagem'}</td></tr>
    </table>
    <div style="margin-top: 20px; text-align: center;">
      <a href="https://wa.me/${(lead.phone || '').replace(/[^0-9]/g, '')}" style="display: inline-block; background: #22c55e; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 13px;">
        Contactar via WhatsApp
      </a>
    </div>
  </div>
</body>
</html>`

    await transporter.sendMail({
      from,
      to: adminEmail,
      subject: `[Novo Lead] ${lead.name} solicitou "${lead.service}"`,
      html,
    })
  } catch (err: any) {
    console.warn('[Notificação Lead] Erro não bloqueante:', err.message)
  }
}
