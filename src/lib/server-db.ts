import fs from 'fs'
import path from 'path'
import { INITIAL_DB } from './data-store'
import { prisma } from './prisma'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'arknet-db.json')

export function getInitialServerDb() {
  return JSON.parse(JSON.stringify(INITIAL_DB))
}

function safeJsonParse(val: any, fallback: any = null) {
  if (!val) return fallback
  if (typeof val === 'object') return val
  try {
    return JSON.parse(val)
  } catch {
    return fallback
  }
}

/**
 * Lê todos os dados a partir do Prisma ORM relacional.
 * Transforma registos relacionais para a interface unificada ArknetDatabase.
 */
export async function readServerDbFromPrisma() {
  try {
    const [
      users,
      customers,
      categories,
      products,
      orders,
      reservations,
      leads,
      subscribers,
      events,
      eventRegistrations,
      courses,
      projects,
      dailyActivities,
      partners,
      testimonials,
      jobs,
      applications,
      settingsRecord,
      activities,
    ] = await Promise.all([
      prisma.adminUser.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.customer.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.productCategory.findMany({ orderBy: { order: 'asc' } }),
      prisma.product.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.storeOrder.findMany({
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.productReservation.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.serviceLead.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.newsletterSubscriber.findMany({ orderBy: { subscribedAt: 'desc' } }),
      prisma.event.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.eventRegistration.findMany({ orderBy: { registeredAt: 'desc' } }),
      prisma.course.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.project.findMany({ orderBy: { order: 'asc' } }),
      prisma.dailyActivity.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.partner.findMany({ orderBy: { order: 'asc' } }),
      prisma.testimonial.findMany({ orderBy: { order: 'asc' } }),
      prisma.job.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.jobApplication.findMany({ orderBy: { appliedAt: 'desc' } }),
      prisma.companySetting.findFirst({ where: { id: 'global' } }),
      prisma.auditActivity.findMany({ orderBy: { timestamp: 'desc' }, take: 100 }),
    ])

    // Formatar produtos
    const formattedProducts = products.map((p) => ({
      ...p,
      images: safeJsonParse(p.images, undefined),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }))

    // Formatar encomendas com itens e histórico
    const formattedOrders = orders.map((o) => ({
      ...o,
      items: o.items.map((it) => ({
        productId: it.productId || '',
        productName: it.productName,
        price: it.price,
        quantity: it.quantity,
        image: it.image || undefined,
      })),
      conversationHistory: safeJsonParse(o.conversationHistory, undefined),
      receiptReceivedAt: o.receiptReceivedAt ? o.receiptReceivedAt.toISOString() : undefined,
      confirmedAt: o.confirmedAt ? o.confirmedAt.toISOString() : undefined,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }))

    // Formatar eventos
    const formattedEvents = events.map((e) => ({
      ...e,
      speakers: safeJsonParse(e.speakers, undefined),
      schedule: safeJsonParse(e.schedule, undefined),
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }))

    // Formatar inscrições em eventos
    const formattedEventRegs = eventRegistrations.map((r) => ({
      ...r,
      registeredAt: r.registeredAt.toISOString(),
    }))

    // Formatar cursos
    const formattedCourses = courses.map((c) => ({
      ...c,
      skills: safeJsonParse(c.skills, []),
      createdAt: c.createdAt.toISOString(),
    }))

    // Formatar projetos
    const formattedProjects = projects.map((pr) => ({
      ...pr,
      metrics: safeJsonParse(pr.metrics, undefined),
      results: safeJsonParse(pr.results, undefined),
      testimonial: safeJsonParse(pr.testimonial, undefined),
      gallery: safeJsonParse(pr.gallery, undefined),
      createdAt: pr.createdAt.toISOString(),
    }))

    // Formatar atividades diárias (blog)
    const formattedDailyActivities = dailyActivities.map((d) => ({
      ...d,
      tags: safeJsonParse(d.tags, []),
      createdAt: d.createdAt.toISOString(),
    }))

    // Formatar vagas
    const formattedJobs = jobs.map((j) => ({
      ...j,
      requirements: safeJsonParse(j.requirements, []),
      responsibilities: safeJsonParse(j.responsibilities, []),
      createdAt: j.createdAt.toISOString(),
    }))

    // Formatar candidaturas
    const formattedApplications = applications.map((a) => ({
      ...a,
      appliedAt: a.appliedAt.toISOString(),
    }))

    // Formatar reservas
    const formattedReservations = reservations.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }))

    // Formatar leads
    const formattedLeads = leads.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    }))

    // Formatar subscritores
    const formattedSubscribers = subscribers.map((s) => ({
      ...s,
      subscribedAt: s.subscribedAt.toISOString(),
    }))

    // Formatar configurações
    const settings = settingsRecord
      ? {
          companyName: settingsRecord.companyName || 'ARKNET',
          tagline: settingsRecord.tagline || '',
          phones: safeJsonParse(settingsRecord.phones, ['+244 923 000 000']),
          emails: safeJsonParse(settingsRecord.emails, ['comercial@arknet.co.ao']),
          address: settingsRecord.address || 'Luanda, Angola',
          city: settingsRecord.city || 'Luanda',
          country: settingsRecord.country || 'Angola',
          whatsappChannelUrl: settingsRecord.whatsappChannelUrl || '',
          whatsappNumber: settingsRecord.whatsappNumber || '',
          socialLinks: safeJsonParse(settingsRecord.socialLinks, {}),
          institutionalText: settingsRecord.institutionalText || '',
          presentationLetter: settingsRecord.presentationLetter || '',
          updatedAt: settingsRecord.updatedAt.toISOString(),
        }
      : INITIAL_DB.settings

    return {
      users: users.map((u) => ({
        ...u,
        role: u.role as any,
        status: u.status as any,
        createdAt: u.createdAt.toISOString(),
        lastLogin: u.lastLogin ? u.lastLogin.toISOString() : undefined,
      })),
      customers: customers.map((c) => ({
        ...c,
        status: c.status as any,
        createdAt: c.createdAt.toISOString(),
        lastLogin: c.lastLogin ? c.lastLogin.toISOString() : undefined,
      })),
      categories,
      products: formattedProducts as any,
      orders: formattedOrders as any,
      reservations: formattedReservations as any,
      leads: formattedLeads as any,
      subscribers: formattedSubscribers as any,
      events: formattedEvents as any,
      eventRegistrations: formattedEventRegs as any,
      courses: formattedCourses as any,
      projects: formattedProjects as any,
      dailyActivities: formattedDailyActivities as any,
      partners: partners as any,
      testimonials: testimonials as any,
      jobs: formattedJobs as any,
      applications: formattedApplications as any,
      settings: settings as any,
      activities: activities.map((a) => ({
        ...a,
        timestamp: a.timestamp.toISOString(),
      })),
      version: 3,
    }
  } catch (error) {
    console.error('[Server DB] Erro ao consultar Prisma, recorrendo a fallback local:', error)
    return readServerDbFallback()
  }
}

/**
 * Leitura síncrona / fallback via JSON
 */
function readServerDbFallback() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }

    if (!fs.existsSync(DB_FILE)) {
      const initialData = getInitialServerDb()
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8')
      return initialData
    }

    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    if (!raw.trim()) {
      const initialData = getInitialServerDb()
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8')
      return initialData
    }

    const parsed = JSON.parse(raw)
    return {
      ...INITIAL_DB,
      ...parsed,
      settings: {
        ...INITIAL_DB.settings,
        ...(parsed.settings || {}),
        socialLinks: {
          ...INITIAL_DB.settings?.socialLinks,
          ...(parsed.settings?.socialLinks || {}),
        },
      },
      users: Array.isArray(parsed.users) ? parsed.users : INITIAL_DB.users,
      customers: Array.isArray(parsed.customers) ? parsed.customers : INITIAL_DB.customers,
      projects: Array.isArray(parsed.projects) ? parsed.projects : INITIAL_DB.projects,
      partners: Array.isArray(parsed.partners) ? parsed.partners : INITIAL_DB.partners,
      testimonials: Array.isArray(parsed.testimonials) ? parsed.testimonials : INITIAL_DB.testimonials,
      events: Array.isArray(parsed.events) ? parsed.events : INITIAL_DB.events,
      eventRegistrations: Array.isArray(parsed.eventRegistrations) ? parsed.eventRegistrations : INITIAL_DB.eventRegistrations || [],
      courses: Array.isArray(parsed.courses) ? parsed.courses : INITIAL_DB.courses,
      categories: Array.isArray(parsed.categories) ? parsed.categories : INITIAL_DB.categories,
      products: Array.isArray(parsed.products) ? parsed.products : INITIAL_DB.products,
      reservations: Array.isArray(parsed.reservations) ? parsed.reservations : INITIAL_DB.reservations || [],
      dailyActivities: Array.isArray(parsed.dailyActivities) ? parsed.dailyActivities : INITIAL_DB.dailyActivities || [],
      leads: Array.isArray(parsed.leads) ? parsed.leads : INITIAL_DB.leads || [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : INITIAL_DB.orders || [],
      subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : INITIAL_DB.subscribers || [],
      jobs: Array.isArray(parsed.jobs) ? parsed.jobs : INITIAL_DB.jobs || [],
      applications: Array.isArray(parsed.applications) ? parsed.applications : INITIAL_DB.applications || [],
      activities: Array.isArray(parsed.activities) ? parsed.activities : INITIAL_DB.activities || [],
    }
  } catch (error) {
    console.error('[Server DB] Error reading DB fallback:', error)
    return getInitialServerDb()
  }
}

/**
 * Método de leitura unificado (síncrono por compatibilidade retroativa)
 */
export function readServerDb() {
  return readServerDbFallback()
}

/**
 * Gravação de backup em JSON e sincronização no ficheiro
 */
export function writeServerDb(data: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }

    let existingData: any = {}
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8')
        if (raw.trim()) {
          existingData = JSON.parse(raw)
        }
      } catch {
        existingData = {}
      }
    }

    const mergedData = {
      ...INITIAL_DB,
      ...existingData,
      ...data,
      settings: {
        ...INITIAL_DB.settings,
        ...(existingData.settings || {}),
        ...(data.settings || {}),
        socialLinks: {
          ...INITIAL_DB.settings?.socialLinks,
          ...(existingData.settings?.socialLinks || {}),
          ...(data.settings?.socialLinks || {}),
        },
      },
    }

    fs.writeFileSync(DB_FILE, JSON.stringify(mergedData, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('[Server DB] Error writing DB:', error)
    return false
  }
}

/**
 * Retorna dados públicos seguros
 */
export function getSanitizedPublicDb(fullData?: any) {
  const full = fullData || readServerDbFallback()
  return {
    products: full.products || [],
    categories: full.categories || [],
    projects: full.projects || [],
    dailyActivities: full.dailyActivities || [],
    events: full.events || [],
    courses: full.courses || [],
    jobs: full.jobs || [],
    testimonials: full.testimonials || [],
    partners: full.partners || [],
    settings: {
      companyName: full.settings?.companyName || 'ARKNET',
      tagline: full.settings?.tagline || '',
      phones: full.settings?.phones || [],
      emails: full.settings?.emails || [],
      address: full.settings?.address || '',
      city: full.settings?.city || 'Luanda',
      country: full.settings?.country || 'Angola',
      whatsappChannelUrl: full.settings?.whatsappChannelUrl || '',
      whatsappNumber: full.settings?.whatsappNumber || '',
      socialLinks: full.settings?.socialLinks || {},
      institutionalText: full.settings?.institutionalText || '',
      presentationLetter: full.settings?.presentationLetter || '',
      updatedAt: full.settings?.updatedAt || new Date().toISOString(),
    },
    version: full.version || 3,
  }
}

/**
 * Adiciona uma nova encomenda de forma atómica no Prisma e backup JSON
 */
export async function appendServerOrderAsync(order: any) {
  try {
    // 1. Gravação no Prisma ORM
    const created = await prisma.storeOrder.create({
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone || '',
        customerCompany: order.customerCompany || null,
        customerNif: order.customerNif || null,
        customerCity: order.customerCity || 'Luanda',
        customerAddress: order.customerAddress || null,
        deliveryMethod: order.deliveryMethod || 'entrega_luanda',
        paymentMethod: order.paymentMethod || 'transferencia',
        total: typeof order.total === 'number' ? order.total : null,
        status: order.status || 'novo',
        notes: order.notes || null,
        whatsappPhone: order.whatsappPhone || null,
        botStatus: order.botStatus || 'bot_active',
        receiptUrl: order.receiptUrl || null,
        receiptFilename: order.receiptFilename || null,
        conversationHistory: order.conversationHistory ? JSON.stringify(order.conversationHistory) : null,
        createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
        updatedAt: new Date(),
        items: {
          create: (order.items || []).map((it: any, idx: number) => ({
            id: `item-${order.id}-${idx}-${Date.now()}`,
            productId: it.productId || null,
            productName: it.productName || 'Produto',
            price: typeof it.price === 'number' ? it.price : null,
            quantity: typeof it.quantity === 'number' ? it.quantity : 1,
            image: it.image || null,
          })),
        },
      },
    })

    // 2. Backup no JSON
    appendServerOrder(order)
    return !!created
  } catch (err) {
    console.error('[Prisma appendServerOrderAsync] Erro ao gravar encomenda:', err)
    return appendServerOrder(order)
  }
}

export function appendServerOrder(order: any) {
  const current = readServerDbFallback()
  const orders = [order, ...(current.orders || [])]
  return writeServerDb({ orders })
}

/**
 * Adiciona uma nova reserva de produto no Prisma e backup JSON
 */
export async function appendServerReservationAsync(reservation: any) {
  try {
    const created = await prisma.productReservation.create({
      data: {
        id: reservation.id,
        reservationNumber: reservation.reservationNumber,
        productId: reservation.productId || null,
        productName: reservation.productName,
        productImage: reservation.productImage || null,
        productPrice: typeof reservation.productPrice === 'number' ? reservation.productPrice : null,
        customerName: reservation.customerName,
        customerEmail: reservation.customerEmail,
        customerPhone: reservation.customerPhone,
        customerCompany: reservation.customerCompany || null,
        quantity: typeof reservation.quantity === 'number' ? reservation.quantity : 1,
        notes: reservation.notes || null,
        status: reservation.status || 'pendente',
        createdAt: reservation.createdAt ? new Date(reservation.createdAt) : new Date(),
        updatedAt: new Date(),
      },
    })
    appendServerReservation(reservation)
    return !!created
  } catch (err) {
    console.error('[Prisma appendServerReservationAsync] Erro ao gravar reserva:', err)
    return appendServerReservation(reservation)
  }
}

export function appendServerReservation(reservation: any) {
  const current = readServerDbFallback()
  const reservations = [reservation, ...(current.reservations || [])]
  return writeServerDb({ reservations })
}

/**
 * Adiciona um novo lead de serviço no Prisma e backup JSON
 */
export async function appendServerLeadAsync(lead: any) {
  try {
    const created = await prisma.serviceLead.create({
      data: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        service: lead.service,
        message: lead.message || '',
        status: lead.status || 'novo',
        notes: lead.notes || null,
        source: lead.source || 'site_quote',
        createdAt: lead.createdAt ? new Date(lead.createdAt) : new Date(),
        updatedAt: new Date(),
      },
    })
    appendServerLead(lead)
    return !!created
  } catch (err) {
    console.error('[Prisma appendServerLeadAsync] Erro ao gravar lead:', err)
    return appendServerLead(lead)
  }
}

export function appendServerLead(lead: any) {
  const current = readServerDbFallback()
  const leads = [lead, ...(current.leads || [])]
  return writeServerDb({ leads })
}

/**
 * Adiciona uma nova subscrição de newsletter no Prisma e backup JSON
 */
export async function appendServerSubscriberAsync(subscriber: any) {
  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: subscriber.email.toLowerCase().trim() },
      update: { status: 'active' },
      create: {
        id: subscriber.id,
        email: subscriber.email.toLowerCase().trim(),
        status: 'active',
        subscribedAt: subscriber.subscribedAt ? new Date(subscriber.subscribedAt) : new Date(),
      },
    })
    appendServerSubscriber(subscriber)
    return true
  } catch (err) {
    console.error('[Prisma appendServerSubscriberAsync] Erro:', err)
    return appendServerSubscriber(subscriber)
  }
}

export function appendServerSubscriber(subscriber: any) {
  const current = readServerDbFallback()
  const existing = (current.subscribers || []).find((s: any) => s.email?.toLowerCase() === subscriber.email?.toLowerCase())
  if (existing) return true
  const subscribers = [subscriber, ...(current.subscribers || [])]
  return writeServerDb({ subscribers })
}

/**
 * Adiciona uma nova inscrição em evento no Prisma e backup JSON
 */
export async function appendServerEventRegistrationAsync(registration: any) {
  try {
    const created = await prisma.eventRegistration.create({
      data: {
        id: registration.id,
        eventId: registration.eventId,
        name: registration.name,
        email: registration.email,
        phone: registration.phone || null,
        company: registration.company || null,
        position: registration.position || null,
        status: registration.status || 'pendente',
        ticketCode: registration.ticketCode || null,
        registeredAt: registration.registeredAt ? new Date(registration.registeredAt) : new Date(),
      },
    })
    appendServerEventRegistration(registration)
    return !!created
  } catch (err) {
    console.error('[Prisma appendServerEventRegistrationAsync] Erro:', err)
    return appendServerEventRegistration(registration)
  }
}

export function appendServerEventRegistration(registration: any) {
  const current = readServerDbFallback()
  const eventRegistrations = [registration, ...(current.eventRegistrations || [])]
  return writeServerDb({ eventRegistrations })
}
