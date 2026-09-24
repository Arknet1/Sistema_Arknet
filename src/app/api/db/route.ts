import { NextRequest, NextResponse } from 'next/server'
import {
  readServerDb,
  readServerDbFromPrisma,
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
  if (!token) {
    if (process.env.NODE_ENV === 'development') {
      return { userId: 'admin-dev', email: 'admin@arknet.co.ao', role: 'admin', exp: Date.now() + 86400000 }
    }
    return null
  }
  const payload = verifySessionToken(token)
  if (!payload || (payload.role !== 'admin' && payload.role !== 'editor')) {
    if (process.env.NODE_ENV === 'development') {
      return { userId: 'admin-dev', email: 'admin@arknet.co.ao', role: 'admin', exp: Date.now() + 86400000 }
    }
    return null
  }
  return payload
}

// ==========================================
// GET /api/db: Leitura de Dados
// ==========================================
// Administradores autenticados: Retorna a base de dados completa e íntegra
// Visitantes públicos: Retorna apenas dados públicos sanitizados (produtos, eventos, projetos, etc.)
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminPayload(request)

    if (admin) {
      // Para administradores: lê os dados completos de arknet-db.json
      // NUNCA executa escritas destrutivas durante a leitura (GET).
      const fullDb = readServerDb()
      return NextResponse.json({ success: true, db: fullDb }, { status: 200 })
    }

    // Visitante público: apenas dados do site e da loja
    const fullDb = readServerDb()
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
          // Desvincular relações e eliminar produtos que foram removidos pelo administrador
          if (productIds.length > 0) {
            await transaction.storeOrderItem.updateMany({
              where: { productId: { notIn: productIds } },
              data: { productId: null },
            })
            await transaction.productReservation.updateMany({
              where: { productId: { notIn: productIds } },
              data: { productId: null },
            })
            await transaction.product.deleteMany({
              where: { id: { notIn: productIds } },
            })
          }

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
        })
      } catch (productsError) {
        console.error('[API /api/db POST] Falha ao sincronizar produtos no Prisma:', productsError)
      }
    }

    if (Array.isArray(dataToSave.projects) && dataToSave.projects.length > 0) {
      try {
        for (const project of dataToSave.projects) {
          if (!project?.id || !project?.title) continue
          const baseSlug =
            project.slug ||
            project.title
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '') ||
            `proj-${project.id}`

          const projectData = {
            title: project.title,
            slug: baseSlug,
            client: project.clientName || project.client || 'ARKNET',
            category: project.category || 'Engenharia & TI',
            sector: project.partnershipType || null,
            year: project.completedAt ? parseInt(project.completedAt, 10) || 2026 : 2026,
            description: project.description || '',
            fullDescription: project.tagline || null,
            metrics: project.partners ? JSON.stringify(project.partners) : null,
            challenge: project.challenge || null,
            solution: project.solution || null,
            results: project.results ? JSON.stringify(project.results) : null,
            testimonial: project.quote ? JSON.stringify(project.quote) : null,
            image: project.image || null,
            gallery: project.gallery ? JSON.stringify(project.gallery) : null,
            featured: Boolean(project.featured),
            order: 0,
            createdAt: project.createdAt ? new Date(project.createdAt) : new Date(),
          }

          try {
            await prisma.project.upsert({
              where: { id: project.id },
              create: { id: project.id, ...projectData },
              update: { ...projectData, createdAt: undefined },
            })
          } catch (slugErr) {
            // Se houver colisão de slug único, garante slug único associando o ID
            const safeSlug = `${baseSlug}-${project.id}`
            await prisma.project.upsert({
              where: { id: project.id },
              create: { id: project.id, ...projectData, slug: safeSlug },
              update: { ...projectData, slug: safeSlug, createdAt: undefined },
            }).catch((err) => console.warn('[Prisma Project Upsert Fallback]:', err))
          }
        }
        // NOTA: Não fazemos deleteMany para não perder projetos que o browser não conhece
      } catch (projectsError) {
        console.error('[API /api/db POST] Falha ao sincronizar projetos no Prisma:', projectsError)
      }
    }

    if (Array.isArray(dataToSave.events) && dataToSave.events.length > 0) {
      try {
        for (const evt of dataToSave.events) {
          if (!evt?.id || !evt?.title) continue
          const baseSlug =
            evt.slug ||
            evt.title
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '') ||
            `evt-${evt.id}`

          const eventData = {
            title: evt.title,
            slug: baseSlug,
            date: evt.date || new Date().toISOString().split('T')[0],
            time: evt.time || null,
            location: evt.location || 'Luanda, Angola',
            format: evt.format || 'Presencial',
            description: evt.description || '',
            fullDescription: evt.link || null,
            image: evt.image || null,
            capacity: typeof evt.capacity === 'number' ? evt.capacity : evt.capacity ? parseInt(evt.capacity, 10) : null,
            status: evt.status || 'agendado',
            speakers: null,
            schedule: null,
            createdAt: evt.createdAt ? new Date(evt.createdAt) : new Date(),
            updatedAt: evt.updatedAt ? new Date(evt.updatedAt) : new Date(),
          }

          try {
            await prisma.event.upsert({
              where: { id: evt.id },
              create: { id: evt.id, ...eventData },
              update: { ...eventData, createdAt: undefined },
            })
          } catch (slugErr) {
            const safeSlug = `${baseSlug}-${evt.id}`
            await prisma.event.upsert({
              where: { id: evt.id },
              create: { id: evt.id, ...eventData, slug: safeSlug },
              update: { ...eventData, slug: safeSlug, createdAt: undefined },
            }).catch((err) => console.warn('[Prisma Event Upsert Fallback]:', err))
          }
        }
        // NOTA: Não fazemos deleteMany para não perder eventos que o browser não conhece
      } catch (eventsError) {
        console.error('[API /api/db POST] Falha ao sincronizar eventos no Prisma:', eventsError)
      }
    }

    if (Array.isArray(dataToSave.dailyActivities) && dataToSave.dailyActivities.length > 0) {
      try {
        for (const act of dataToSave.dailyActivities) {
          if (!act?.id || !act?.title) continue
          const baseSlug =
            act.slug ||
            act.title
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '') ||
            `d-act-${act.id}`

          const actData = {
            title: act.title,
            slug: baseSlug,
            date: act.date || new Date().toISOString().split('T')[0],
            category: act.category || 'Institucional',
            summary: act.description || '',
            content: act.content || act.description || '',
            author: act.author || null,
            image: act.image || null,
            readTime: act.readTime || null,
            tags: Array.isArray(act.tags) ? JSON.stringify(act.tags) : JSON.stringify([]),
            featured: Boolean(act.featured),
            views: 0,
            createdAt: act.createdAt ? new Date(act.createdAt) : new Date(),
          }

          try {
            await prisma.dailyActivity.upsert({
              where: { id: act.id },
              create: { id: act.id, ...actData },
              update: { ...actData, createdAt: undefined },
            })
          } catch (slugErr) {
            const safeSlug = `${baseSlug}-${act.id}`
            await prisma.dailyActivity.upsert({
              where: { id: act.id },
              create: { id: act.id, ...actData, slug: safeSlug },
              update: { ...actData, slug: safeSlug, createdAt: undefined },
            }).catch((err) => console.warn('[Prisma DailyActivity Upsert Fallback]:', err))
          }
        }
        // NOTA: Não fazemos deleteMany para não perder atividades que o browser não conhece
      } catch (actError) {
        console.error('[API /api/db POST] Falha ao sincronizar atividades no Prisma:', actError)
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

    if (Array.isArray(dataToSave.partners) && dataToSave.partners.length > 0) {
      try {
        for (let i = 0; i < dataToSave.partners.length; i++) {
          const part = dataToSave.partners[i]
          if (!part?.id || !part?.name) continue
          const partData = {
            name: part.name,
            logo: part.logo || `/uploads/vendor-${i + 1}.jpg`,
            website: part.website || null,
            category: part.category || null,
            order: part.order !== undefined ? part.order : i,
            active: part.active !== undefined ? Boolean(part.active) : true,
          }
          await prisma.partner.upsert({
            where: { id: part.id },
            create: { id: part.id, ...partData },
            update: partData,
          })
        }
      } catch (partnersError) {
        console.error('[API /api/db POST] Falha ao sincronizar parceiros no Prisma:', partnersError)
      }
    }

    if (Array.isArray(dataToSave.testimonials) && dataToSave.testimonials.length > 0) {
      try {
        for (let i = 0; i < dataToSave.testimonials.length; i++) {
          const test = dataToSave.testimonials[i]
          const testName = test?.clientName || test?.name
          if (!test?.id || !testName) continue
          const testData = {
            name: testName,
            role: test.role || '',
            company: test.company || '',
            avatar: test.logo || test.avatar || null,
            text: test.testimonial || test.text || '',
            rating: typeof test.rating === 'number' ? test.rating : 5,
            active: test.active !== undefined ? Boolean(test.active) : true,
            order: test.order !== undefined ? test.order : i,
          }
          await prisma.testimonial.upsert({
            where: { id: test.id },
            create: { id: test.id, ...testData },
            update: testData,
          })
        }
      } catch (testimonialsError) {
        console.error('[API /api/db POST] Falha ao sincronizar testemunhos no Prisma:', testimonialsError)
      }
    }

    if (Array.isArray(dataToSave.courses) && dataToSave.courses.length > 0) {
      try {
        for (const course of dataToSave.courses) {
          if (!course?.id || !course?.title) continue
          const courseData = {
            title: course.title,
            category: course.category || 'Geral',
            duration: course.duration || '40h',
            level: course.level || 'Iniciante',
            format: course.format || 'Presencial',
            description: course.description || '',
            price: typeof course.price === 'number' ? course.price : null,
            icon: course.icon || null,
            skills: Array.isArray(course.skills) ? JSON.stringify(course.skills) : null,
            isPopular: Boolean(course.isPopular),
            createdAt: course.createdAt ? new Date(course.createdAt) : new Date(),
          }
          await prisma.course.upsert({
            where: { id: course.id },
            create: { id: course.id, ...courseData },
            update: { ...courseData, createdAt: undefined },
          })
        }
      } catch (coursesError) {
        console.error('[API /api/db POST] Falha ao sincronizar cursos no Prisma:', coursesError)
      }
    }

    if (Array.isArray(dataToSave.jobs) && dataToSave.jobs.length > 0) {
      try {
        for (const job of dataToSave.jobs) {
          if (!job?.id || !job?.title) continue
          const jobData = {
            title: job.title,
            department: job.department || 'Geral',
            location: job.location || 'Luanda',
            type: job.type || 'Tempo Inteiro',
            description: job.description || '',
            requirements: Array.isArray(job.requirements) ? JSON.stringify(job.requirements) : null,
            responsibilities: Array.isArray(job.responsibilities) ? JSON.stringify(job.responsibilities) : null,
            active: job.active !== undefined ? Boolean(job.active) : true,
            createdAt: job.createdAt ? new Date(job.createdAt) : new Date(),
          }
          await prisma.job.upsert({
            where: { id: job.id },
            create: { id: job.id, ...jobData },
            update: { ...jobData, createdAt: undefined },
          })
        }
      } catch (jobsError) {
        console.error('[API /api/db POST] Falha ao sincronizar vagas no Prisma:', jobsError)
      }
    }

    return NextResponse.json({ success: true, message: 'Base de dados atualizada com sucesso' }, { status: 200 })
  } catch (error) {
    console.error('[API /api/db POST] Erro:', error)
    return NextResponse.json({ success: false, message: 'Erro ao processar requisição' }, { status: 500 })
  }
}
