import { prisma } from '@/lib/prisma'
import { createTransporter } from '@/lib/email-service'
import { sendWhatsAppTextMessage } from '@/lib/whatsapp/meta-api'

export interface AlertProcessResult {
  contractsChecked: number
  documentsChecked: number
  contractAlertsSent: number
  documentAlertsSent: number
  details: string[]
}

/**
 * Processador central de alertas de vencimento de contratos e documentos de RH
 * - Canal primário: E-mail corporativo
 * - WhatsApp: Mantido preparado mas desligado por configuração até aprovação de template na Meta
 * - Prevenção estrita de alertas duplicados via HrAlertLog
 */
export async function processHrExpiryAlerts(): Promise<AlertProcessResult> {
  const result: AlertProcessResult = {
    contractsChecked: 0,
    documentsChecked: 0,
    contractAlertsSent: 0,
    documentAlertsSent: 0,
    details: [],
  }

  // 1. Obter configurações de RH
  let config = await prisma.hrConfig.findUnique({ where: { id: 'global' } })
  if (!config) {
    config = await prisma.hrConfig.create({
      data: {
        id: 'global',
        contractAlertDays: 30,
        documentAlertDays: 30,
        notifyEmail: process.env.HR_SMTP_FROM || process.env.SMTP_FROM || 'rh@jmatos.co.ao',
        whatsappEnabled: false,
      },
    })
  }

  const isWhatsappActive =
    config.whatsappEnabled && process.env.HR_WHATSAPP_ENABLED === 'true'

  const now = new Date()
  const contractHorizon = new Date()
  contractHorizon.setDate(now.getDate() + config.contractAlertDays)

  const docHorizon = new Date()
  docHorizon.setDate(now.getDate() + config.documentAlertDays)

  const { transporter, from } = await createTransporter()

  // 2. Processar Contratos a expirar
  const expiringContracts = await prisma.hrContract.findMany({
    where: {
      status: 'ACTIVO',
      endDate: {
        not: null,
        lte: contractHorizon,
        gte: now,
      },
    },
    include: {
      employee: {
        include: {
          department: true,
          position: true,
        },
      },
    },
  })

  result.contractsChecked = expiringContracts.length

  for (const contract of expiringContracts) {
    // Verificar se já foi enviado alerta nos últimos dias para este contrato
    const alreadySent = await prisma.hrAlertLog.findFirst({
      where: {
        alertType: 'CONTRATO_EXPIRACAO',
        targetId: contract.id,
        sentAt: {
          gte: new Date(Date.now() - config.contractAlertDays * 24 * 60 * 60 * 1000),
        },
      },
    })

    if (alreadySent) {
      result.details.push(`Contrato ${contract.contractNumber} já alertado recentemente. Ignorado para evitar duplicidade.`)
      continue
    }

    const endDateFormatted = contract.endDate ? contract.endDate.toLocaleDateString('pt-AO') : 'N/D'
    const subject = `[J.Matos RH] Alerta de Vencimento de Contrato - ${contract.employee.fullName}`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; color: #1e293b; line-height: 1.6;">
        <div style="background-color: #0868B0; padding: 20px; color: #ffffff; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 18px;">Aviso de Vencimento de Contrato de Trabalho</h2>
        </div>
        <div style="border: 1px solid #e2e8f0; padding: 24px; border-radius: 0 0 8px 8px; background-color: #ffffff;">
          <p>Exmo.(a) Técnico(a) de Recursos Humanos,</p>
          <p>Informamos que o contrato de trabalho abaixo indicado encontra-se próximo do seu termo:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Colaborador:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${contract.employee.fullName}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">N.º Funcionário:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${contract.employee.employeeNumber}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">N.º Contrato:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${contract.contractNumber} (${contract.type})</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Departamento:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${contract.employee.department.name}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Cargo:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${contract.employee.position.title}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #b91c1c; border-bottom: 1px solid #f1f5f9;">Data de Término:</td><td style="padding: 8px; color: #b91c1c; font-weight: bold; border-bottom: 1px solid #f1f5f9;">${endDateFormatted}</td></tr>
          </table>
          <p>Por favor, aceda ao Painel de RH para decidir sobre a renovação, conversão ou rescisão contratual.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #64748b;">J.Matos Tecnologia · Recursos Humanos · Notificação Automática do Sistema</p>
        </div>
      </div>
    `

    // Enviar E-mail
    if (transporter && config.notifyEmail) {
      try {
        await transporter.sendMail({
          from: from || `${process.env.HR_MAIL_FROM_NAME || 'J.Matos Tecnologia · Recursos Humanos'} <${process.env.HR_SMTP_FROM || 'rh@jmatos.co.ao'}>`,
          to: config.notifyEmail,
          subject,
          html,
        })
      } catch (err) {
        console.error('[HR Alertas] Erro ao enviar e-mail de contrato:', err)
      }
    }

    // WhatsApp (se activo com template aprovado)
    if (isWhatsappActive && config.notifyWhatsapp) {
      // Preparado para template aprovado da Meta
      const whatsAppText = `J.Matos RH Alerta: O contrato do colaborador ${contract.employee.fullName} termina a ${endDateFormatted}. Verifique o painel de RH.`
      await sendWhatsAppTextMessage(config.notifyWhatsapp, whatsAppText).catch(() => undefined)
    }

    // Registar log para evitar envio repetido
    await prisma.hrAlertLog.create({
      data: {
        alertType: 'CONTRATO_EXPIRACAO',
        targetId: contract.id,
        channel: isWhatsappActive ? 'EMAIL_E_WHATSAPP' : 'EMAIL',
        sentTo: config.notifyEmail,
        metadata: JSON.stringify({
          employeeName: contract.employee.fullName,
          contractNumber: contract.contractNumber,
          endDate: contract.endDate,
        }),
      },
    })

    result.contractAlertsSent++
    result.details.push(`Alerta de contrato ${contract.contractNumber} (${contract.employee.fullName}) enviado com sucesso.`)
  }

  // 3. Processar Documentos a expirar
  const expiringDocs = await prisma.hrDocument.findMany({
    where: {
      status: 'ACTIVO',
      expiresAt: {
        not: null,
        lte: docHorizon,
        gte: now,
      },
    },
    include: {
      employee: true,
    },
  })

  result.documentsChecked = expiringDocs.length

  for (const doc of expiringDocs) {
    const alreadySent = await prisma.hrAlertLog.findFirst({
      where: {
        alertType: 'DOCUMENTO_EXPIRACAO',
        targetId: doc.id,
        sentAt: {
          gte: new Date(Date.now() - config.documentAlertDays * 24 * 60 * 60 * 1000),
        },
      },
    })

    if (alreadySent) {
      result.details.push(`Documento ${doc.title} (${doc.id}) já alertado recentemente.`)
      continue
    }

    const expiryFormatted = doc.expiresAt ? doc.expiresAt.toLocaleDateString('pt-AO') : 'N/D'
    const subject = `[ARKNET RH] Alerta de Documento a Expirar - ${doc.employee.fullName} (${doc.title})`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; color: #1e293b; line-height: 1.6;">
        <div style="background-color: #0f172a; padding: 20px; color: #ffffff; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 18px;">Aviso de Documento Próximo da Validade</h2>
        </div>
        <div style="border: 1px solid #e2e8f0; padding: 24px; border-radius: 0 0 8px 8px; background-color: #ffffff;">
          <p>Exmo.(a) Técnico(a) de Recursos Humanos,</p>
          <p>Informamos que o documento de um colaborador encontra-se próximo da sua data de caducidade:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Colaborador:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${doc.employee.fullName}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Documento:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${doc.title} (${doc.type})</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #b91c1c; border-bottom: 1px solid #f1f5f9;">Data de Validade:</td><td style="padding: 8px; color: #b91c1c; font-weight: bold; border-bottom: 1px solid #f1f5f9;">${expiryFormatted}</td></tr>
          </table>
          <p>Solicite a renovação atempada deste documento junto do colaborador.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #64748b;">Módulo de Recursos Humanos ARKNET Angola · Notificação Automática do Sistema</p>
        </div>
      </div>
    `

    if (transporter && config.notifyEmail) {
      try {
        await transporter.sendMail({
          from: from || 'ARKNET Recursos Humanos <rh@arknet.co.ao>',
          to: config.notifyEmail,
          subject,
          html,
        })
      } catch (err) {
        console.error('[HR Alertas] Erro ao enviar e-mail de documento:', err)
      }
    }

    await prisma.hrAlertLog.create({
      data: {
        alertType: 'DOCUMENTO_EXPIRACAO',
        targetId: doc.id,
        channel: isWhatsappActive ? 'EMAIL_E_WHATSAPP' : 'EMAIL',
        sentTo: config.notifyEmail,
        metadata: JSON.stringify({
          employeeName: doc.employee.fullName,
          documentTitle: doc.title,
          expiresAt: doc.expiresAt,
        }),
      },
    })

    result.documentAlertsSent++
    result.details.push(`Alerta de documento ${doc.title} (${doc.employee.fullName}) enviado com sucesso.`)
  }

  return result
}

/**
 * Função utilitária para envio direto de email de notificações em serviços de RH
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html?: string
  text?: string
}) {
  try {
    const { transporter, from } = await createTransporter()
    if (transporter) {
      await transporter.sendMail({
        from: from || 'ARKNET Recursos Humanos <rh@arknet.co.ao>',
        to,
        subject,
        html,
        text,
      })
    }
    return { success: true }
  } catch (err) {
    console.error('[HR EMAIL ERROR]', err)
    return { success: false, error: err }
  }
}

