import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNewsletterWelcomeEmail } from '@/lib/email-service'

/**
 * POST /api/newsletter/subscribe
 * Regista um novo subscritor e envia email de confirmação/boas-vindas
 */
export async function POST(request: NextRequest) {
  try {
    let body: any = {}
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, message: 'Formato de pedido inválido (JSON esperado).' },
        { status: 400 }
      )
    }

    const { email } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Endereço de email inválido.' },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()

    // Registar ou reativar na base de dados Prisma
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: cleanEmail },
    })

    let subscriber
    if (existing) {
      subscriber = await prisma.newsletterSubscriber.update({
        where: { email: cleanEmail },
        data: { status: 'active' },
      })
    } else {
      subscriber = await prisma.newsletterSubscriber.create({
        data: {
          email: cleanEmail,
          status: 'active',
          subscribedAt: new Date(),
        },
      })
    }

    // Enviar email de boas-vindas assincronamente (sem travar se falhar)
    try {
      await sendNewsletterWelcomeEmail(cleanEmail)
    } catch (mailErr: any) {
      console.error('[Newsletter Subscribe] Erro ao enviar email de boas-vindas:', mailErr.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Subscrição confirmada com sucesso! Verifique a sua caixa de entrada.',
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        status: subscriber.status,
        subscribedAt: subscriber.subscribedAt.toISOString(),
      },
    })
  } catch (err: any) {
    console.error('[Newsletter Subscribe API] Erro:', err)
    return NextResponse.json(
      { success: false, message: 'Ocorreu um erro ao processar a subscrição.' },
      { status: 500 }
    )
  }
}
