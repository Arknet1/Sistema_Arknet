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
      description: e.description || '',
      location: e.location || 'Luanda, Angola',
      time: e.time || '09:00 às 17:00',
      link: (e as any).link || e.fullDescription || '',
      registrationOpen: (e as any).registrationOpen !== false,
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
    // Formatar cursos
    const formattedCourses = courses.map((c) => ({
      ...c,
      modality: (c.format || 'Presencial') as any,
      image: c.icon || undefined,
      syllabus: safeJsonParse(c.skills, []),
      status: 'active' as const,
      featured: Boolean(c.isPopular),
      skills: safeJsonParse(c.skills, []),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.createdAt.toISOString(),
    }))

    // Formatar testemunhos
    const formattedTestimonials = testimonials.map((t, idx) => ({
      id: t.id,
      clientName: t.name || '',
      company: t.company || '',
      role: t.role || '',
      testimonial: t.text || '',
      rating: t.rating || 5,
      logo: t.avatar || undefined,
      order: t.order !== undefined ? t.order : idx + 1,
      active: t.active !== undefined ? t.active : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

    // Formatar parceiros
    const formattedPartners = partners.map((p, idx) => ({
      id: p.id,
      name: p.name,
      logo: p.logo,
      category: p.category || 'Parceiro Estratégico',
      website: p.website || 'https://arknet.co.ao',
      order: p.order !== undefined ? p.order : idx + 1,
      active: p.active !== undefined ? p.active : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

    // Formatar projetos
    const formattedProjects = projects.map((pr) => {
      const partnersParsed = safeJsonParse(pr.metrics, [])
      const resultsParsed = safeJsonParse(pr.results, [])
      const galleryParsed = safeJsonParse(pr.gallery, [])
      const quoteParsed = safeJsonParse(pr.testimonial, undefined)

      return {
        ...pr,
        clientName: (pr as any).clientName || pr.client || 'ARKNET',
        partnershipType: (pr as any).partnershipType || pr.sector || 'Projeto para Cliente',
        completedAt: (pr as any).completedAt || (pr.year ? String(pr.year) : '2026'),
        tagline: (pr as any).tagline || pr.fullDescription || '',
        description: pr.description || '',
        challenge: pr.challenge || '',
        solution: pr.solution || '',
        status: ((pr as any).status === 'em_curso' ? 'em_curso' : 'concluido') as 'concluido' | 'em_curso',
        partners: Array.isArray(partnersParsed) ? partnersParsed : [],
        results: Array.isArray(resultsParsed) ? resultsParsed : [],
        gallery: Array.isArray(galleryParsed) ? galleryParsed : [],
        quote: quoteParsed,
        createdAt: pr.createdAt.toISOString(),
        updatedAt: pr.createdAt.toISOString(),
      }
    })

    // Formatar atividades diárias (blog)
    const formattedDailyActivities = dailyActivities.map((d) => ({
      ...d,
      description: d.summary || '',
      content: d.content || d.summary || '',
      tags: safeJsonParse(d.tags, []),
      status: ((d as any).status || 'concluida') as 'concluida' | 'em_andamento',
      clientOrLocation: (d as any).clientOrLocation || 'Luanda, Angola',
      time: (d as any).time || '12:00',
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.createdAt.toISOString(),
    }))

    // Formatar vagas
    const formattedJobs = jobs.map((j) => ({
      ...j,
      requirements: safeJsonParse(j.requirements, []),
      responsibilities: safeJsonParse(j.responsibilities, []),
      benefits: safeJsonParse(j.responsibilities, []),
      status: (j.active ? 'aberta' : 'fechada') as 'aberta' | 'fechada' | 'pausada',
      createdAt: j.createdAt.toISOString(),
      updatedAt: j.createdAt.toISOString(),
    }))

    // Formatar candidaturas
    const formattedApplications = applications.map((a) => ({
      ...a,
      appliedAt: a.appliedAt.toISOString(),
    }))

    // Formatar reservas
    const prodMap = new Map(products.map((p) => [p.id, p]))
    const formattedReservations = reservations.map((r) => {
      const liveProd = r.productId ? prodMap.get(r.productId) : null
      return {
        ...r,
        productName: liveProd?.name || r.productName,
        productImage: liveProd?.image || r.productImage || null,
        productPrice: liveProd?.price ?? r.productPrice ?? null,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }
    })

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
          emails: safeJsonParse(settingsRecord.emails, ['info@arknet.co.ao']),
          address: settingsRecord.address || 'Luanda, Angola',
          city: settingsRecord.city || 'Luanda',
          country: settingsRecord.country || 'Angola',
          whatsappChannelUrl: settingsRecord.whatsappChannelUrl || '',
          whatsappNumber: settingsRecord.whatsappNumber || '',
          socialLinks: safeJsonParse(settingsRecord.socialLinks, {}),
          institutionalText: settingsRecord.institutionalText || '',
          presentationLetter: settingsRecord.presentationLetter || '',
          executiveTeam: safeJsonParse(settingsRecord.executiveTeam, INITIAL_DB.settings.executiveTeam),
          carouselSlides: safeJsonParse(settingsRecord.carouselSlides, INITIAL_DB.settings.carouselSlides),
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
      partners: formattedPartners as any,
      testimonials: formattedTestimonials as any,
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
    const cleanRaw = raw.replace(/^\uFEFF/, '').trim()
    if (!cleanRaw) {
      const initialData = getInitialServerDb()
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8')
      return initialData
    }

    const parsed = JSON.parse(cleanRaw)
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
/**
 * Faz merge inteligente de arrays por ID.
 * Os itens recebidos (incoming) sobrepõem os existentes pelo ID.
 * Os itens existentes que NÃO estão no incoming são PRESERVADOS (nunca apagados).
 * Excepção: se `incoming` é um array vazio, isso é tratado como "sem alterações" e o existing é mantido.
 */
function mergeArrayById(existing: any[], incoming: any[]): any[] {
  if (!Array.isArray(incoming) || incoming.length === 0) return Array.isArray(existing) ? existing : []
  if (!Array.isArray(existing) || existing.length === 0) return incoming

  const map = new Map<string, any>()
  // Primeiro carrega os existentes
  for (const item of existing) {
    if (item?.id) map.set(item.id, item)
  }
  // Depois aplica/substitui com os recebidos (incoming tem prioridade)
  for (const item of incoming) {
    if (item?.id) map.set(item.id, { ...(map.get(item.id) || {}), ...item })
  }
  return Array.from(map.values())
}

/**
 * Arrays aditivos: nunca apagam registos existentes, apenas acrescentam.
 * Utilizado para encomendas, leads, subscritores, etc.
 */
function mergeAdditiveArray(existing: any[], incoming: any[]): any[] {
  if (!Array.isArray(incoming) || incoming.length === 0) return Array.isArray(existing) ? existing : []
  if (!Array.isArray(existing) || existing.length === 0) return incoming

  const map = new Map<string, any>()
  for (const item of incoming) {
    if (item?.id) map.set(item.id, item)
  }
  // Adiciona existentes que não constam no incoming
  for (const item of existing) {
    if (item?.id && !map.has(item.id)) map.set(item.id, item)
  }
  return Array.from(map.values())
}

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

    // Sincronização inteligente: quando o array editorial é explicitamente enviado,
    // usamos o array fornecido (respeitando adições, edições e exclusões feitas pelo utilizador).
    // Se o campo não for enviado (estado parcial), mantemos o existingData.
    const mergedData = {
      ...INITIAL_DB,
      ...existingData,
      ...data,
      // Arrays editoriais: se enviados, assume a lista exata; caso contrário, mantém existentes
      projects: data.projects !== undefined ? data.projects : (existingData.projects || INITIAL_DB.projects),
      events: data.events !== undefined ? data.events : (existingData.events || INITIAL_DB.events),
      dailyActivities: data.dailyActivities !== undefined ? data.dailyActivities : (existingData.dailyActivities || []),
      partners: data.partners !== undefined ? data.partners : (existingData.partners || INITIAL_DB.partners),
      testimonials: data.testimonials !== undefined ? data.testimonials : (existingData.testimonials || INITIAL_DB.testimonials),
      courses: data.courses !== undefined ? data.courses : (existingData.courses || INITIAL_DB.courses),
      jobs: data.jobs !== undefined ? data.jobs : (existingData.jobs || []),
      products: data.products !== undefined ? data.products : (existingData.products || INITIAL_DB.products),
      categories: data.categories !== undefined ? data.categories : (existingData.categories || INITIAL_DB.categories),
      // Arrays transacionais: aditivos (nunca eliminam encomendas/leads existentes)
      orders: mergeAdditiveArray(existingData.orders || [], data.orders || []),
      leads: mergeAdditiveArray(existingData.leads || [], data.leads || []),
      subscribers: mergeAdditiveArray(existingData.subscribers || [], data.subscribers || []),
      reservations: mergeAdditiveArray(existingData.reservations || [], data.reservations || []),
      eventRegistrations: mergeAdditiveArray(existingData.eventRegistrations || [], data.eventRegistrations || []),
      applications: mergeAdditiveArray(existingData.applications || [], data.applications || []),
      // Users e customers: merge por ID
      users: data.users && data.users.length > 0
        ? mergeArrayById(existingData.users || [], data.users)
        : (existingData.users || INITIAL_DB.users),
      customers: data.customers && data.customers.length > 0
        ? mergeArrayById(existingData.customers || [], data.customers)
        : (existingData.customers || []),
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
      carouselSlides: full.settings?.carouselSlides || INITIAL_DB.settings.carouselSlides,
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

/**
 * Retorna todos os produtos do arquivo JSON com fallback para Prisma
 */
export async function getProductsServerAsync() {
  const fallbackDb = readServerDbFallback()
  if (Array.isArray(fallbackDb.products) && fallbackDb.products.length > 0) {
    return fallbackDb.products
  }

  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })
    if (products && products.length > 0) {
      return products.map((p) => ({
        ...p,
        images: safeJsonParse(p.images, undefined),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }))
    }
  } catch (err) {
    console.error('[getProductsServerAsync] Erro no Prisma:', err)
  }
  return fallbackDb.products || []
}

/**
 * Cria ou atualiza um produto no Prisma e no arknet-db.json de forma atómica e segura
 */
export async function saveProductServerAsync(productData: any) {
  const id = productData.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
  const now = new Date()

  // Buscar produto existente para nunca apagar imagens ou campos em atualizações parciais
  const current = readServerDbFallback()
  const existingProds = current.products || []
  const existingProduct = existingProds.find((p: any) => p.id === id) || {}

  const merged = {
    ...existingProduct,
    ...productData,
    id,
  }

  // 1. Resolver categoria no Prisma se aplicável
  let categoryId = merged.categoryId || null
  if (!categoryId && merged.category) {
    try {
      const cat = await prisma.productCategory.findFirst({
        where: { name: merged.category },
      })
      if (cat) categoryId = cat.id
    } catch {}
  }

  const payload = {
    name: (merged.name || 'Produto').trim(),
    description: merged.description || '',
    categoryId,
    category: merged.category || 'Produtos',
    price: typeof merged.price === 'number' ? merged.price : null,
    image: merged.image || '',
    images: Array.isArray(merged.images)
      ? JSON.stringify(merged.images)
      : (typeof merged.images === 'string' ? merged.images : null),
    inStock: merged.inStock !== undefined ? Boolean(merged.inStock) : true,
    quantity: typeof merged.quantity === 'number' ? merged.quantity : 10,
    featured: Boolean(merged.featured),
    sku: merged.sku || `ARK-${Math.floor(1000 + Math.random() * 9000)}`,
  }

  const formattedProduct = {
    id,
    ...payload,
    images: safeJsonParse(payload.images, undefined),
    createdAt: merged.createdAt || now.toISOString(),
    updatedAt: now.toISOString(),
  }

  // 1. Atualizar JSON (arknet-db.json)
  const idx = existingProds.findIndex((p: any) => p.id === id)
  let updatedProds: any[]
  if (idx >= 0) {
    updatedProds = existingProds.map((p: any) => (p.id === id ? { ...p, ...formattedProduct } : p))
  } else {
    updatedProds = [formattedProduct, ...existingProds]
  }

  writeServerDb({ products: updatedProds })

  // 2. Atualizar Prisma
  try {
    await prisma.product.upsert({
      where: { id },
      create: {
        id,
        ...payload,
        createdAt: formattedProduct.createdAt ? new Date(formattedProduct.createdAt) : now,
        updatedAt: now,
      },
      update: {
        ...payload,
        updatedAt: now,
      },
    })
  } catch (err) {
    console.error('[saveProductServerAsync] Erro Prisma:', err)
  }

  return formattedProduct
}

/**
 * Elimina um produto no Prisma e no arknet-db.json de forma atómica
 */
export async function deleteProductServerAsync(id: string) {
  try {
    await prisma.storeOrderItem.updateMany({
      where: { productId: id },
      data: { productId: null },
    })
    await prisma.productReservation.updateMany({
      where: { productId: id },
      data: { productId: null },
    })
    await prisma.product.deleteMany({
      where: { id },
    })
  } catch (err) {
    console.error('[deleteProductServerAsync] Erro Prisma:', err)
  }

  const current = readServerDbFallback()
  const updatedProds = (current.products || []).filter((p: any) => p.id !== id)
  writeServerDb({ products: updatedProds })
  return true
}

