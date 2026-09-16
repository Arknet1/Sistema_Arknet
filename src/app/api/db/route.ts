import { NextRequest, NextResponse } from 'next/server'
import {
  readServerDb,
  writeServerDb,
  getInitialServerDb,
  getSanitizedPublicDb,
  appendServerOrderAsync,
  appendServerReservationAsync,
  appendServerLeadAsync,
  appendServerSubscriberAsync,
  appendServerEventRegistrationAsync,
} from '@/lib/server-db'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/security-utils'

// ==========================================
// UTILITÁRIO: Verificar token de administrador
// ==========================================
function getAdminPayload(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const adminCookie = request.cookies.get('arknet_admin_token')?.value
  const token = authHeader?.replace('Bearer ', '') || adminCookie
  if (!token) return null
  const payload = verifySessionToken(token)
  if (!payload || (payload.role !== 'admin' && payload.role !== 'editor')) return null
  return payload
}

// ==========================================
// GET /api/db: Leitura de Dados
// ==========================================
// Administradores autenticados: Retorna a base de dados completa (via Prisma)
// Visitantes públicos: Retorna apenas dados públicos sanitizados (produtos, eventos, projetos, etc.)
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminPayload(request)

    // O ficheiro JSON é a fonte de verdade do painel: todas as operações CRUD
    // administrativas são gravadas nele, incluindo módulos sem tabela Prisma.
    const fullDb = readServerDb()

    if (admin) {
      // Administrador autenticado: acesso completo
      return NextResponse.json({ success: true, db: fullDb }, { status: 200 })
    }

    // Visitante público: apenas dados do site e da loja
    const publicDb = getSanitizedPublicDb(fullDb)
    return NextResponse.json({ success: true, db: publicDb }, { status: 200 })
  } catch (error) {
    console.error('[API /api/db GET] Erro:', error)
    return NextResponse.json({ success: false, message: 'Erro ao carregar dados' }, { status: 500 })
  }
}

// ==========================================
// POST /api/db: Escrita de Dados
// ==========================================
// Suporta dois modos:
// 1. Ações públicas granulares: create_order, create_lead, create_reservation, subscribe_newsletter, register_event, register_customer
// 2. Ações administrativas (requerem token): reset, substituição completa da BD, sincronização do painel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, message: 'Dados inválidos' }, { status: 400 })
    }

    const action = body.action as string | undefined

    // ── Ações Públicas Seguras (sem autenticação) ──────────────────────

    if (action === 'create_order') {
      const order = body.order
      if (!order || !order.id || !order.customerName || !order.customerEmail || !order.items) {
        return NextResponse.json({ success: false, message: 'Dados da encomenda incompletos' }, { status: 400 })
      }
      const success = await appendServerOrderAsync(order)
      if (!success) {
        return NextResponse.json({ success: false, message: 'Falha ao gravar encomenda no servidor' }, { status: 500 })
      }
      return NextResponse.json({ success: true, message: 'Encomenda registada com sucesso' }, { status: 201 })
    }

    if (action === 'create_lead') {
      const lead = body.lead
      if (!lead || !lead.name || !lead.email || !lead.service) {
        return NextResponse.json({ success: false, message: 'Dados do lead incompletos' }, { status: 400 })
      }
      const success = await appendServerLeadAsync(lead)
      if (!success) {
        return NextResponse.json({ success: false, message: 'Falha ao gravar lead no servidor' }, { status: 500 })
      }
      return NextResponse.json({ success: true, message: 'Pedido de contacto registado com sucesso' }, { status: 201 })
    }

    if (action === 'create_reservation') {
      const reservation = body.reservation
      if (!reservation || !reservation.id || !reservation.customerName || !reservation.productId) {
        return NextResponse.json({ success: false, message: 'Dados da reserva incompletos' }, { status: 400 })
      }
      const success = await appendServerReservationAsync(reservation)
      if (!success) {
        return NextResponse.json({ success: false, message: 'Falha ao gravar reserva no servidor' }, { status: 500 })
      }
      return NextResponse.json({ success: true, message: 'Reserva registada com sucesso' }, { status: 201 })
    }

    if (action === 'subscribe_newsletter') {
      const email = body.email
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return NextResponse.json({ success: false, message: 'Email inválido' }, { status: 400 })
      }
      const subscriber = {
        id: `sub-${Date.now()}`,
        email: email.toLowerCase().trim(),
        status: 'active',
        subscribedAt: new Date().toISOString(),
      }
      const success = await appendServerSubscriberAsync(subscriber)
      if (!success) {
        return NextResponse.json({ success: false, message: 'Falha ao registar subscrição' }, { status: 500 })
      }
      return NextResponse.json({ success: true, message: 'Subscrição de newsletter ativada com sucesso' }, { status: 201 })
    }

    if (action === 'register_event') {
      const registration = body.registration
      if (!registration || !registration.eventId || !registration.name || !registration.email) {
        return NextResponse.json({ success: false, message: 'Dados de inscrição incompletos' }, { status: 400 })
      }
      const success = await appendServerEventRegistrationAsync(registration)
      if (!success) {
        return NextResponse.json({ success: false, message: 'Falha ao registar inscrição' }, { status: 500 })
      }
      return NextResponse.json({ success: true, message: 'Inscrição no evento registada com sucesso' }, { status: 201 })
    }

    if (action === 'register_customer') {
      const customer = body.customer
      if (!customer || !customer.name || !customer.email || !customer.phone) {
        return NextResponse.json({ success: false, message: 'Dados do cliente incompletos' }, { status: 400 })
      }

      try {
        const existing = await prisma.customer.findUnique({
          where: { email: customer.email.toLowerCase().trim() },
        })
        if (existing) {
          return NextResponse.json({ success: false, message: 'Já existe uma conta com este email' }, { status: 409 })
        }

        const persistedCustomer = {
          ...customer,
          id: customer.id || `cli-${Date.now()}`,
          email: customer.email.toLowerCase().trim(),
        }

        await prisma.customer.create({
          data: {
            id: persistedCustomer.id,
            name: customer.name,
            email: persistedCustomer.email,
            password: customer.password || null,
            passwordHash: customer.passwordHash || null,
            phone: customer.phone,
            company: customer.company || null,
            nif: customer.nif || null,
            address: customer.address || null,
            city: customer.city || 'Luanda',
            avatar: customer.avatar || null,
            status: customer.status || 'active',
            notes: customer.notes || null,
            createdAt: customer.createdAt ? new Date(customer.createdAt) : new Date(),
          },
        })

        const current = readServerDb()
        const customers = [persistedCustomer, ...(current.customers || [])]
        writeServerDb({ customers })
      } catch (e) {
        console.error('[register_customer] Prisma fallback to JSON:', e)
        const current = readServerDb()
        const existing = (current.customers || []).find(
          (c: any) => c.email?.toLowerCase() === customer.email?.toLowerCase()
        )
        if (existing) {
          return NextResponse.json({ success: false, message: 'Já existe uma conta com este email' }, { status: 409 })
        }
        const customers = [customer, ...(current.customers || [])]
        writeServerDb({ customers })
      }

      return NextResponse.json({ success: true, message: 'Conta de cliente criada com sucesso' }, { status: 201 })
    }

    // ── Ações Administrativas (requerem autenticação) ──────────────────

    const admin = getAdminPayload(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Acesso não autorizado. Autenticação de administrador obrigatória para esta operação.' },
        { status: 401 }
      )
    }

    if (action === 'reset') {
      const initial = getInitialServerDb()
      writeServerDb(initial)
      return NextResponse.json({ success: true, message: 'Base de dados restaurada com sucesso', db: initial }, { status: 200 })
    }

    // Sincronização do painel de administração
    const dataToSave = body.db ? body.db : body
    const success = writeServerDb(dataToSave)

    if (!success) {
      return NextResponse.json({ success: false, message: 'Falha ao gravar base de dados no servidor' }, { status: 500 })
    }

    if (Array.isArray(dataToSave.categories) && Array.isArray(dataToSave.products)) {
      try {
        const categoryIds = new Set<string>()

        for (const category of dataToSave.categories) {
          if (!category?.id || !category?.name) continue
          categoryIds.add(category.id)
          await prisma.productCategory.upsert({
            where: { id: category.id },
            create: {
              id: category.id,
              name: category.name,
              icon: category.icon || 'Package',
              description: category.description || null,
              order: category.order || 0,
              hideWhenEmpty: Boolean(category.hideWhenEmpty),
            },
            update: {
              name: category.name,
              icon: category.icon || 'Package',
              description: category.description || null,
              order: category.order || 0,
              hideWhenEmpty: Boolean(category.hideWhenEmpty),
            },
          })
        }

        const productIds = dataToSave.products.filter((product: any) => product?.id).map((product: any) => product.id)

        await prisma.$transaction(async (transaction) => {
          for (const product of dataToSave.products) {
            if (!product?.id || !product?.name) continue
            const category = dataToSave.categories.find((item: any) => item.name === product.category)
            const productData = {
              name: product.name,
              description: product.description || '',
              categoryId: categoryIds.has(category?.id) ? category.id : null,
              category: product.category || 'Produtos',
              price: product.price ?? null,
              image: product.image || '',
              images: product.images ? JSON.stringify(product.images) : null,
              inStock: Boolean(product.inStock),
              quantity: Number.isFinite(product.quantity) ? product.quantity : 0,
              featured: Boolean(product.featured),
              sku: product.sku || null,
              createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
            }

            await transaction.product.upsert({
              where: { id: product.id },
              create: { id: product.id, ...productData },
              update: { ...productData, createdAt: undefined },
            })
          }

          await transaction.storeOrderItem.updateMany({
            where: { productId: { notIn: productIds } },
            data: { productId: null },
          })
          await transaction.productReservation.updateMany({
            where: { productId: { notIn: productIds } },
            data: { productId: null },
          })
          await transaction.product.deleteMany({ where: { id: { notIn: productIds } } })
        })
      } catch (productsError) {
        console.error('[API /api/db POST] Falha ao sincronizar produtos no Prisma:', productsError)
      }
    }

    if (dataToSave.settings) {
      try {
        const settings = dataToSave.settings
        await prisma.companySetting.upsert({
          where: { id: 'global' },
          create: {
            id: 'global',
            companyName: settings.companyName || 'ARKNET',
            tagline: settings.tagline || null,
            phones: JSON.stringify(settings.phones || []),
            emails: JSON.stringify(settings.emails || []),
            address: settings.address || null,
            city: settings.city || 'Luanda',
            country: settings.country || 'Angola',
            whatsappChannelUrl: settings.whatsappChannelUrl || null,
            whatsappNumber: settings.whatsappNumber || null,
            socialLinks: JSON.stringify(settings.socialLinks || {}),
            institutionalText: settings.institutionalText || null,
            presentationLetter: settings.presentationLetter || null,
            executiveTeam: JSON.stringify(settings.executiveTeam || []),
            carouselSlides: JSON.stringify(settings.carouselSlides || []),
          },
          update: {
            companyName: settings.companyName || 'ARKNET',
            tagline: settings.tagline || null,
            phones: JSON.stringify(settings.phones || []),
            emails: JSON.stringify(settings.emails || []),
            address: settings.address || null,
            city: settings.city || 'Luanda',
            country: settings.country || 'Angola',
            whatsappChannelUrl: settings.whatsappChannelUrl || null,
            whatsappNumber: settings.whatsappNumber || null,
            socialLinks: JSON.stringify(settings.socialLinks || {}),
            institutionalText: settings.institutionalText || null,
            presentationLetter: settings.presentationLetter || null,
            executiveTeam: JSON.stringify(settings.executiveTeam || []),
            carouselSlides: JSON.stringify(settings.carouselSlides || []),
          },
        })
      } catch (settingsError) {
        console.error('[API /api/db POST] Falha ao sincronizar definições no Prisma:', settingsError)
      }
    }

    return NextResponse.json({ success: true, message: 'Base de dados atualizada com sucesso' }, { status: 200 })
  } catch (error) {
    console.error('[API /api/db POST] Erro:', error)
    return NextResponse.json({ success: false, message: 'Erro ao processar requisição' }, { status: 500 })
  }
}
