import fs from 'fs'
import path from 'path'
import { INITIAL_DB } from './data-store'
import { prisma } from './prisma'
import { guessColorHex, isColorOption } from './color-utils'

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

export function generateProductSlug(name: string): string {
  if (!name) return `prod-${Date.now()}`
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `prod-${Date.now()}`
}

export function formatPrismaProduct(p: any) {
  if (!p) return null
  const variants = Array.isArray(p.variants)
    ? p.variants.map((v: any) => ({
        id: v.id,
        productId: v.productId || p.id,
        sku: v.sku || `ARK-${v.id}`,
        price: typeof v.price === 'number' ? v.price : null,
        stock: typeof v.stock === 'number' ? v.stock : 0,
        active: v.active !== false,
        order: typeof v.order === 'number' ? v.order : 0,
        images: safeJsonParse(v.images, Array.isArray(v.images) ? v.images : []),
        specs: safeJsonParse(v.specs, typeof v.specs === 'object' && v.specs !== null ? v.specs : {}),
        options: Array.isArray(v.options)
          ? v.options.map((optRel: any) => {
              if (optRel.optionValueRef) {
                const optName = optRel.optionValueRef.optionRef?.name || ''
                const val = optRel.optionValueRef.value || ''
                const isCol = isColorOption(optName)
                return {
                  optionId: optRel.optionValueRef.optionRef?.id || optRel.optionValueRef.optionId || '',
                  optionName: optName,
                  optionValueId: optRel.optionValueRef.id || '',
                  value: val,
                  hex: optRel.optionValueRef.hex || (isCol ? guessColorHex(val) : null),
                }
              }
              const optName = optRel.optionName || ''
              const val = optRel.value || ''
              const isCol = isColorOption(optName)
              return {
                optionId: optRel.optionId || '',
                optionName: optName,
                optionValueId: optRel.optionValueId || '',
                value: val,
                hex: optRel.hex || (isCol ? guessColorHex(val) : null),
              }
            })
          : (Array.isArray(v.options) ? v.options : []),
        createdAt: typeof v.createdAt === 'string' ? v.createdAt : (v.createdAt?.toISOString?.() || undefined),
        updatedAt: typeof v.updatedAt === 'string' ? v.updatedAt : (v.updatedAt?.toISOString?.() || undefined),
      }))
    : (Array.isArray(p.variants) ? p.variants : [])

  // Reconstruir ou normalizar lista de opções disponíveis para o produto
  let options = Array.isArray(p.options) && p.options.length > 0 ? p.options : undefined

  if (options) {
    // Normalizar hex de opções existentes
    options = options.map((opt: any) => {
      const isCol = isColorOption(opt.name)
      return {
        id: opt.id || `opt-${opt.name.trim().toLowerCase().replace(/\s+/g, '-')}`,
        name: opt.name,
        order: typeof opt.order === 'number' ? opt.order : 0,
        values: Array.isArray(opt.values)
          ? opt.values.map((v: any) => ({
              id: v.id || `val-${opt.name}-${v.value}`,
              value: v.value,
              hex: v.hex || (isCol ? guessColorHex(v.value) : null),
              order: typeof v.order === 'number' ? v.order : 0,
            }))
          : [],
      }
    })
  } else if (variants.length > 0) {
    const optMap = new Map<string, { id: string; name: string; order: number; values: Map<string, { id: string; value: string; hex?: string | null; order: number }> }>()
    for (const v of variants) {
      for (const opt of v.options || []) {
        if (!opt.optionName || !opt.value) continue
        const optKey = opt.optionName.trim().toLowerCase()
        if (!optMap.has(optKey)) {
          optMap.set(optKey, {
            id: opt.optionId || `opt-${optKey}`,
            name: opt.optionName.trim(),
            order: 0,
            values: new Map(),
          })
        }
        const valMap = optMap.get(optKey)!.values
        const valKey = opt.value.trim().toLowerCase()
        const isCol = isColorOption(opt.optionName)
        if (!valMap.has(valKey)) {
          valMap.set(valKey, {
            id: opt.optionValueId || `val-${valKey}`,
            value: opt.value.trim(),
            hex: opt.hex || (isCol ? guessColorHex(opt.value) : null),
            order: 0,
          })
        }
      }
    }
    options = Array.from(optMap.values()).map(o => ({
      id: o.id,
      name: o.name,
      order: o.order,
      values: Array.from(o.values.values()),
    }))
  }

  const imagesParsed = safeJsonParse(p.images, Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []))

  return {
    id: p.id,
    name: p.name,
    slug: p.slug || generateProductSlug(p.name),
    description: p.description || '',
    category: p.category || 'Produtos',
    categoryId: p.categoryId || null,
    brand: p.brand || null,
    price: typeof p.price === 'number' ? p.price : null,
    image: p.image || (Array.isArray(imagesParsed) && imagesParsed[0]) || '',
    images: Array.isArray(imagesParsed) ? imagesParsed : [],
    inStock: p.inStock !== false,
    quantity: typeof p.quantity === 'number' ? p.quantity : 0,
    featured: Boolean(p.featured),
    sku: p.sku || `ARK-${p.id}`,
    baseSpecs: safeJsonParse(p.baseSpecs, typeof p.baseSpecs === 'object' ? p.baseSpecs : null),
    options: options || [],
    variants: variants || [],
    createdAt: typeof p.createdAt === 'string' ? p.createdAt : (p.createdAt?.toISOString?.() || new Date().toISOString()),
    updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : (p.updatedAt?.toISOString?.() || new Date().toISOString()),
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
      prisma.product.findMany({
        include: {
          variants: {
            include: {
              options: {
                include: {
                  optionValueRef: {
                    include: {
                      optionRef: true,
                    },
                  },
                },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
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
    const formattedProducts = products.map((p) => formatPrismaProduct(p))

    // Formatar encomendas com itens e histórico
    const formattedOrders = orders.map((o) => ({
      ...o,
      items: o.items.map((it) => ({
        productId: it.productId || '',
        variantId: (it as any).variantId || undefined,
        variantSku: (it as any).variantSku || undefined,
        variantLabel: (it as any).variantLabel || undefined,
        productName: it.productName,
        price: it.price,
        quantity: it.quantity,
        image: (it as any).image || undefined,
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
      recoveryTokens: Array.isArray(parsed.recoveryTokens) ? parsed.recoveryTokens : [],
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
      recoveryTokens: data.recoveryTokens !== undefined
        ? data.recoveryTokens
        : (existingData.recoveryTokens || []),
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
  // 1. Backup no JSON (sempre funciona)
  appendServerOrder(order)

  try {
    // 2. Verificar que os productIds referenciam produtos existentes no Prisma
    const validProductIds = new Set<string>()
    const rawProductIds = (order.items || []).map((it: any) => it.productId).filter(Boolean)
    if (rawProductIds.length > 0) {
      try {
        const existingProducts = await prisma.product.findMany({
          where: { id: { in: rawProductIds } },
          select: { id: true },
        })
        for (const p of existingProducts) validProductIds.add(p.id)
      } catch { /* ignora erros de consulta */ }
    }

    // 3. Gravação no Prisma ORM com productId seguro
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
            productId: (it.productId && validProductIds.has(it.productId)) ? it.productId : null,
            variantId: it.variantId || (it.variant && it.variant.id) || null,
            variantSku: it.variantSku || (it.variant && it.variant.sku) || null,
            variantLabel: it.variantLabel || null,
            productName: it.productName || 'Produto',
            price: typeof it.price === 'number' ? it.price : null,
            quantity: typeof it.quantity === 'number' ? it.quantity : 1,
            image: it.image || null,
          })),
        },
      },
    })

    return !!created
  } catch (err) {
    console.error('[Prisma appendServerOrderAsync] Erro ao gravar encomenda (JSON backup já feito):', err)
    return true // JSON backup já foi salvo acima
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
  appendServerReservation(reservation)

  try {
    // Verificar que productId existe no Prisma
    let safeProductId: string | null = null
    if (reservation.productId) {
      try {
        const prod = await prisma.product.findUnique({ where: { id: reservation.productId }, select: { id: true } })
        if (prod) safeProductId = prod.id
      } catch { /* ignora */ }
    }

    const created = await prisma.productReservation.create({
      data: {
        id: reservation.id,
        reservationNumber: reservation.reservationNumber,
        productId: safeProductId,
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
    return !!created
  } catch (err) {
    console.error('[Prisma appendServerReservationAsync] Erro (JSON backup já feito):', err)
    return true
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
 * Retorna todos os produtos formatados a partir do Prisma ou fallback JSON
 */
export async function getProductsServerAsync() {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: {
          include: {
            options: {
              include: {
                optionValueRef: {
                  include: {
                    optionRef: true,
                  },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    if (products && products.length > 0) {
      return products.map((p) => formatPrismaProduct(p))
    }
  } catch (err) {
    console.error('[getProductsServerAsync] Erro no Prisma:', err)
  }

  const fallbackDb = readServerDbFallback()
  if (Array.isArray(fallbackDb.products) && fallbackDb.products.length > 0) {
    return fallbackDb.products.map((p: any) => formatPrismaProduct(p))
  }
  return []
}

/**
 * Cria ou atualiza um produto no Prisma e no arknet-db.json com suporte a variantes
 */
export async function saveProductServerAsync(productData: any) {
  const id = productData.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
  const now = new Date()

  // Buscar produto existente para nunca apagar campos em atualizações parciais
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

  const slug = (merged.slug || generateProductSlug(merged.name || 'produto')).trim()
  const brand = merged.brand ? String(merged.brand).trim() : null
  const baseSpecsStr = merged.baseSpecs
    ? (typeof merged.baseSpecs === 'string' ? merged.baseSpecs : JSON.stringify(merged.baseSpecs))
    : null

  const payload = {
    name: (merged.name || 'Produto').trim(),
    slug,
    brand,
    description: merged.description || '',
    categoryId,
    category: merged.category || 'Produtos',
    price: typeof merged.price === 'number' ? merged.price : null,
    image: merged.image || '',
    images: Array.isArray(merged.images)
      ? JSON.stringify(merged.images)
      : (typeof merged.images === 'string' ? merged.images : (merged.image ? JSON.stringify([merged.image]) : null)),
    inStock: merged.inStock !== undefined ? Boolean(merged.inStock) : true,
    quantity: typeof merged.quantity === 'number' ? merged.quantity : 10,
    featured: Boolean(merged.featured),
    sku: merged.sku || `ARK-${Math.floor(1000 + Math.random() * 9000)}`,
    baseSpecs: baseSpecsStr,
  }

  // Normalizar opções do produto (garantindo códigos de cor hex)
  const rawOptions: any[] = Array.isArray(merged.options) ? merged.options : []
  const normalizedOptions = rawOptions.map((opt: any, optIdx: number) => {
    const isCol = isColorOption(opt.name)
    const optId = opt.id || `opt-${opt.name.trim().toLowerCase().replace(/\s+/g, '-')}`
    const values = Array.isArray(opt.values)
      ? opt.values.map((v: any, vIdx: number) => ({
          id: v.id || `val-${optId}-${v.value.trim().toLowerCase().replace(/\s+/g, '-')}`,
          value: v.value,
          hex: v.hex || (isCol ? guessColorHex(v.value) : null),
          order: typeof v.order === 'number' ? v.order : vIdx,
        }))
      : []
    return {
      id: optId,
      name: opt.name,
      order: typeof opt.order === 'number' ? opt.order : optIdx,
      values,
    }
  })

  // Se o utilizador configurou opções (ex: Cor) mas não clicou "Gerar Combinações", gerar automaticamente!
  let rawVariants: any[] = Array.isArray(merged.variants) ? merged.variants : []
  if (rawVariants.length === 0 && normalizedOptions.length > 0) {
    const validOpts = normalizedOptions.filter((o) => o.values.length > 0)
    if (validOpts.length > 0) {
      function cartesian(arrays: any[][]): any[][] {
        return arrays.reduce((acc, curr) => acc.flatMap((d) => curr.map((e) => [...d, e])), [[]])
      }
      const valArrays = validOpts.map((opt) =>
        opt.values.map((val: any) => ({
          optionId: opt.id,
          optionName: opt.name,
          optionValueId: val.id,
          value: val.value,
          hex: val.hex || (isColorOption(opt.name) ? guessColorHex(val.value) : null),
        }))
      )
      const combos = cartesian(valArrays)
      rawVariants = combos.map((combo: any, index: number) => {
        const skuSuffix = combo.map((c: any) => c.value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4)).join('-')
        return {
          id: `var-${id}-${index + 1}-${Math.random().toString(36).substring(2, 5)}`,
          sku: `${payload.sku}-${skuSuffix || index + 1}`,
          price: payload.price,
          stock: payload.quantity > 0 ? Math.ceil(payload.quantity / combos.length) : 10,
          images: payload.image ? [payload.image] : [],
          active: true,
          order: index,
          options: combo,
        }
      })
    }
  }

  // Formatar variantes para resposta e backup JSON
  const formattedVariants = rawVariants.map((v: any, index: number) => {
    const vId = v.id || `var-${id}-${index + 1}-${Math.random().toString(36).substring(2, 5)}`
    const vOptions = Array.isArray(v.options)
      ? v.options.map((o: any) => ({
          optionId: o.optionId || '',
          optionName: o.optionName || '',
          optionValueId: o.optionValueId || '',
          value: o.value || '',
          hex: o.hex || (isColorOption(o.optionName) ? guessColorHex(o.value) : null),
        }))
      : []

    return {
      id: vId,
      productId: id,
      sku: v.sku || `${payload.sku}-V${index + 1}`,
      price: typeof v.price === 'number' ? v.price : null,
      stock: typeof v.stock === 'number' ? v.stock : 0,
      images: Array.isArray(v.images) ? v.images : (v.image ? [v.image] : []),
      specs: typeof v.specs === 'object' && v.specs !== null ? v.specs : safeJsonParse(v.specs, {}),
      active: v.active !== false,
      order: typeof v.order === 'number' ? v.order : index,
      options: vOptions,
      createdAt: v.createdAt || now.toISOString(),
      updatedAt: now.toISOString(),
    }
  })

  const formattedProduct = {
    id,
    ...payload,
    baseSpecs: safeJsonParse(payload.baseSpecs, null),
    images: safeJsonParse(payload.images, payload.image ? [payload.image] : []),
    options: normalizedOptions,
    variants: formattedVariants,
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

    // Sincronizar opções no Prisma
    const optionValueIdMap = new Map<string, string>()

    for (const opt of normalizedOptions) {
      if (!opt.name) continue
      try {
        const optRecord = await prisma.productOption.upsert({
          where: { name: opt.name.trim() },
          create: {
            id: opt.id || `opt-${opt.name.trim().toLowerCase().replace(/\s+/g, '-')}`,
            name: opt.name.trim(),
            order: opt.order || 0,
          },
          update: {},
        })

        for (const val of opt.values || []) {
          if (!val.value) continue
          const key = `${opt.name.trim().toLowerCase()}::${val.value.trim().toLowerCase()}`
          const isCol = isColorOption(opt.name)
          const hex = val.hex || (isCol ? guessColorHex(val.value) : null)

          const valRecord = await prisma.productOptionValue.upsert({
            where: {
              optionId_value: {
                optionId: optRecord.id,
                value: val.value.trim(),
              },
            },
            create: {
              id: val.id || `val-${optRecord.id}-${val.value.trim().toLowerCase().replace(/\s+/g, '-')}`,
              optionId: optRecord.id,
              value: val.value.trim(),
              hex,
            },
            update: {
              hex: hex || undefined,
            },
          })

          optionValueIdMap.set(key, valRecord.id)
        }
      } catch (e) {
        console.warn('[saveProductServerAsync] Erro ao sincronizar option/value:', e)
      }
    }

    // Sincronizar variantes no Prisma
    if (formattedVariants.length > 0) {
      for (const variant of formattedVariants) {
        const vImagesStr = variant.images && variant.images.length > 0 ? JSON.stringify(variant.images) : null
        const vSpecsStr = variant.specs ? JSON.stringify(variant.specs) : null

        try {
          const createdVariant = await prisma.productVariant.upsert({
            where: { sku: variant.sku },
            create: {
              id: variant.id,
              productId: id,
              sku: variant.sku,
              price: variant.price,
              stock: variant.stock,
              images: vImagesStr,
              specs: vSpecsStr,
              active: variant.active,
              order: variant.order,
            },
            update: {
              productId: id,
              price: variant.price,
              stock: variant.stock,
              images: vImagesStr,
              specs: vSpecsStr,
              active: variant.active,
              order: variant.order,
            },
          })

          for (const opt of variant.options || []) {
            const key = `${opt.optionName?.trim().toLowerCase()}::${opt.value?.trim().toLowerCase()}`
            let valId = optionValueIdMap.get(key)
            if (!valId && opt.optionName && opt.value) {
              try {
                const optRecord = await prisma.productOption.upsert({
                  where: { name: opt.optionName.trim() },
                  create: {
                    id: opt.optionId || `opt-${opt.optionName.trim().toLowerCase().replace(/\s+/g, '-')}`,
                    name: opt.optionName.trim(),
                    order: 0,
                  },
                  update: {},
                })
                const isCol = isColorOption(opt.optionName)
                const valRecord = await prisma.productOptionValue.upsert({
                  where: {
                    optionId_value: {
                      optionId: optRecord.id,
                      value: opt.value.trim(),
                    },
                  },
                  create: {
                    id: opt.optionValueId || `val-${optRecord.id}-${opt.value.trim().toLowerCase().replace(/\s+/g, '-')}`,
                    optionId: optRecord.id,
                    value: opt.value.trim(),
                    hex: opt.hex || (isCol ? guessColorHex(opt.value) : null),
                  },
                  update: {},
                })
                valId = valRecord.id
                optionValueIdMap.set(key, valId)
              } catch {}
            }

            if (valId) {
              try {
                await prisma.productVariantOption.upsert({
                  where: {
                    variantId_optionValueId: {
                      variantId: createdVariant.id,
                      optionValueId: valId,
                    },
                  },
                  create: {
                    id: `pvo-${createdVariant.id}-${valId}`,
                    variantId: createdVariant.id,
                    optionValueId: valId,
                  },
                  update: {},
                })
              } catch {}
            }
          }
        } catch (e) {
          console.warn('[saveProductServerAsync] Erro ao gravar variante:', e)
        }
      }
    }
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

/**
 * Adiciona uma nova candidatura a vaga no Prisma e backup JSON
 */
export async function appendServerApplicationAsync(application: any) {
  try {
    const created = await prisma.jobApplication.create({
      data: {
        id: application.id,
        jobId: application.jobId || null,
        jobTitle: application.jobTitle || null,
        name: application.candidateName || application.name,
        email: application.email,
        phone: application.phone || '',
        resumeUrl: application.resumeUrl || null,
        message: application.notes || application.message || '',
        status: application.status || 'recebida',
        appliedAt: application.createdAt ? new Date(application.createdAt) : new Date(),
      },
    })
    appendServerApplication(application)
    return !!created
  } catch (err) {
    console.error('[Prisma appendServerApplicationAsync] Erro:', err)
    return appendServerApplication(application)
  }
}

export function appendServerApplication(application: any) {
  const current = readServerDbFallback()
  const applications = [application, ...(current.applications || [])]
  return writeServerDb({ applications })
}

