import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/server-auth'
import { sendNewsletterEmail } from '@/lib/email-service'

/**
 * Verificar se o utilizador é admin
 */
function getAdminPayload(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const adminCookie = request.cookies.get('arknet_admin_token')?.value
  const token = authHeader?.replace('Bearer ', '') || adminCookie
  if (!token) return null
  const payload = verifySessionToken(token)
  if (!payload || (payload.role !== 'admin' && payload.role !== 'editor')) {
    return null
  }
  return payload
}

/**
 * POST /api/newsletter/send
 * Envia uma newsletter para todos os subscritores ativos
 */
export async function POST(request: NextRequest) {
  const admin = getAdminPayload(request)
  if (!admin) {
    return NextResponse.json(
      { success: false, message: 'Acesso restrito. Autenticação de administrador necessária.' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const {
      subject,
      editionLabel,
      htmlBody,
      coverImage,
      coverImageAlt,
      offerBannerImage,
      offerBannerAlt,
      offerBannerLink,
      featuredProducts,
      testEmail,
    } = body

    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { success: false, message: 'O assunto da newsletter é obrigatório.' },
        { status: 400 }
      )
    }

    if (!htmlBody || !htmlBody.trim()) {
      return NextResponse.json(
        { success: false, message: 'O conteúdo da newsletter é obrigatório.' },
        { status: 400 }
      )
    }

    // Modo de teste: enviar apenas para um email específico
    if (testEmail) {
      const result = await sendNewsletterEmail({
        to: testEmail,
        subject: subject.trim(),
        editionLabel: editionLabel ? String(editionLabel).trim() : undefined,
        htmlBody: htmlBody.trim(),
        coverImage: coverImage ? String(coverImage).trim() : null,
        coverImageAlt: coverImageAlt ? String(coverImageAlt).trim() : null,
        offerBannerImage: offerBannerImage ? String(offerBannerImage).trim() : null,
        offerBannerAlt: offerBannerAlt ? String(offerBannerAlt).trim() : null,
        offerBannerLink: offerBannerLink ? String(offerBannerLink).trim() : null,
        featuredProducts: Array.isArray(featuredProducts) ? featuredProducts : null,
      })

      return NextResponse.json({
        success: result.success,
        message: result.success
          ? `Email de teste enviado com sucesso para ${testEmail}`
          : `Falha ao enviar email de teste: ${result.error || result.message}`,
        mode: result.mode,
      })
    }

    // Buscar subscritores ativos
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { status: 'active' },
      select: { email: true },
    })

    if (subscribers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Nenhum subscritor ativo encontrado para envio.' },
        { status: 400 }
      )
    }

    // Criar registo da campanha com todas as URLs e Alt texts das imagens
    const campaign = await prisma.newsletterCampaign.create({
      data: {
        subject: subject.trim(),
        body: htmlBody.trim(),
        coverImage: coverImage ? String(coverImage).trim() : null,
        coverImageAlt: coverImageAlt ? String(coverImageAlt).trim() : null,
        offerBannerImage: offerBannerImage ? String(offerBannerImage).trim() : null,
        offerBannerAlt: offerBannerAlt ? String(offerBannerAlt).trim() : null,
        offerBannerLink: offerBannerLink ? String(offerBannerLink).trim() : null,
        featuredProducts: Array.isArray(featuredProducts) ? JSON.stringify(featuredProducts) : null,
        recipientCount: subscribers.length,
        status: 'a_enviar',
        sentBy: admin.email || 'Admin',
        sentAt: new Date(),
      },
    })

    // Enviar emails sequencialmente com delay para evitar rate limiting
    let successCount = 0
    let failCount = 0
    const errors: string[] = []

    for (const sub of subscribers) {
      try {
        const result = await sendNewsletterEmail({
          to: sub.email,
          subject: subject.trim(),
          editionLabel: editionLabel ? String(editionLabel).trim() : undefined,
          htmlBody: htmlBody.trim(),
          coverImage: coverImage ? String(coverImage).trim() : null,
          coverImageAlt: coverImageAlt ? String(coverImageAlt).trim() : null,
          offerBannerImage: offerBannerImage ? String(offerBannerImage).trim() : null,
          offerBannerAlt: offerBannerAlt ? String(offerBannerAlt).trim() : null,
          offerBannerLink: offerBannerLink ? String(offerBannerLink).trim() : null,
          featuredProducts: Array.isArray(featuredProducts) ? featuredProducts : null,
        })

        if (result.success) {
          successCount++
        } else {
          failCount++
          errors.push(`${sub.email}: ${result.error || result.message}`)
        }

        // Delay de 1.5s entre emails para evitar bloqueio do Gmail
        if (subscribers.indexOf(sub) < subscribers.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1500))
        }
      } catch (err: any) {
        failCount++
        errors.push(`${sub.email}: ${err.message}`)
      }
    }


    // Atualizar campanha com resultados
    await prisma.newsletterCampaign.update({
      where: { id: campaign.id },
      data: {
        successCount,
        failCount,
        status: failCount === subscribers.length ? 'erro' : 'enviada',
      },
    })

    // Log de auditoria
    try {
      await prisma.auditActivity.create({
        data: {
          userId: admin.userId || null,
          userName: admin.email || 'Admin',
          action: 'newsletter_enviada',
          target: 'NewsletterCampaign',
          targetId: campaign.id,
          details: JSON.stringify({
            subject: subject.trim(),
            recipientCount: subscribers.length,
            successCount,
            failCount,
          }),
        },
      })
    } catch {
      // Auditoria não crítica
    }

    return NextResponse.json({
      success: true,
      message: `Newsletter enviada! ${successCount} de ${subscribers.length} emails entregues com sucesso.`,
      campaignId: campaign.id,
      stats: {
        total: subscribers.length,
        success: successCount,
        fail: failCount,
        errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
      },
    })
  } catch (err: any) {
    console.error('[Newsletter API] Erro:', err)
    return NextResponse.json(
      { success: false, message: `Erro interno: ${err.message}` },
      { status: 500 }
    )
  }
}

/**
 * GET /api/newsletter/send
 * Retorna o histórico de campanhas enviadas
 */
export async function GET(request: NextRequest) {
  const admin = getAdminPayload(request)
  if (!admin) {
    return NextResponse.json(
      { success: false, message: 'Acesso restrito.' },
      { status: 401 }
    )
  }

  try {
    const campaigns = await prisma.newsletterCampaign.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ success: true, campaigns })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
