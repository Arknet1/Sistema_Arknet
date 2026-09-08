import fs from 'fs'
import path from 'path'
import { INITIAL_DB } from './data-store'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'arknet-db.json')

export function getInitialServerDb() {
  return JSON.parse(JSON.stringify(INITIAL_DB))
}

export function readServerDb() {
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
    // Merge com INITIAL_DB para garantir que todas as chaves ricas existam
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
      projects: Array.isArray(parsed.projects) && parsed.projects.length ? parsed.projects : INITIAL_DB.projects,
      partners: Array.isArray(parsed.partners) && parsed.partners.length ? parsed.partners : INITIAL_DB.partners,
      testimonials: Array.isArray(parsed.testimonials) && parsed.testimonials.length ? parsed.testimonials : INITIAL_DB.testimonials,
      events: Array.isArray(parsed.events) && parsed.events.length ? parsed.events : INITIAL_DB.events,
      courses: Array.isArray(parsed.courses) && parsed.courses.length ? parsed.courses : INITIAL_DB.courses,
      categories: Array.isArray(parsed.categories) && parsed.categories.length ? parsed.categories : INITIAL_DB.categories,
      products: Array.isArray(parsed.products) && parsed.products.length ? parsed.products : INITIAL_DB.products,
      reservations: Array.isArray(parsed.reservations) ? parsed.reservations : INITIAL_DB.reservations || [],
      dailyActivities: Array.isArray(parsed.dailyActivities) && parsed.dailyActivities.length ? parsed.dailyActivities : INITIAL_DB.dailyActivities || [],
    }
  } catch (error) {
    console.error('[Server DB] Error reading DB:', error)
    return getInitialServerDb()
  }
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
      users: data.users !== undefined ? data.users : (existingData.users || INITIAL_DB.users),
      customers: data.customers !== undefined ? data.customers : (existingData.customers || INITIAL_DB.customers),
      projects: data.projects !== undefined ? data.projects : (existingData.projects || INITIAL_DB.projects),
      dailyActivities: data.dailyActivities !== undefined ? data.dailyActivities : (existingData.dailyActivities || INITIAL_DB.dailyActivities || []),
      events: data.events !== undefined ? data.events : (existingData.events || INITIAL_DB.events),
      eventRegistrations: data.eventRegistrations !== undefined ? data.eventRegistrations : (existingData.eventRegistrations || INITIAL_DB.eventRegistrations || []),
      products: data.products !== undefined ? data.products : (existingData.products || INITIAL_DB.products),
      reservations: data.reservations !== undefined ? data.reservations : (existingData.reservations || INITIAL_DB.reservations || []),
      categories: data.categories !== undefined ? data.categories : (existingData.categories || INITIAL_DB.categories),
      courses: data.courses !== undefined ? data.courses : (existingData.courses || INITIAL_DB.courses),
      jobs: data.jobs !== undefined ? data.jobs : (existingData.jobs || INITIAL_DB.jobs || []),
      applications: data.applications !== undefined ? data.applications : (existingData.applications || INITIAL_DB.applications || []),
      partners: data.partners !== undefined ? data.partners : (existingData.partners || INITIAL_DB.partners),
      testimonials: data.testimonials !== undefined ? data.testimonials : (existingData.testimonials || INITIAL_DB.testimonials),
      leads: data.leads !== undefined ? data.leads : (existingData.leads || INITIAL_DB.leads),
      subscribers: data.subscribers !== undefined ? data.subscribers : (existingData.subscribers || INITIAL_DB.subscribers || []),
      orders: data.orders !== undefined ? data.orders : (existingData.orders || INITIAL_DB.orders),
      activities: data.activities !== undefined ? data.activities : (existingData.activities || INITIAL_DB.activities || []),
    }

    fs.writeFileSync(DB_FILE, JSON.stringify(mergedData, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('[Server DB] Error writing DB:', error)
    return false
  }
}

/**
 * Retorna uma versão segura da base de dados contendo apenas dados públicos da loja e site institucional.
 * Omite deliberadamente utilizadores administrativos, credenciais, contas de clientes, encomendas,
 * leads comerciais confidenciais e logs internos.
 */
export function getSanitizedPublicDb() {
  const full = readServerDb()
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
    version: full.version || 2,
  }
}

/**
 * Adiciona uma nova encomenda de forma atómica e segura no servidor
 */
export function appendServerOrder(order: any) {
  const current = readServerDb()
  const orders = [order, ...(current.orders || [])]
  return writeServerDb({ orders })
}

/**
 * Adiciona uma nova reserva de produto de forma atómica e segura no servidor
 */
export function appendServerReservation(reservation: any) {
  const current = readServerDb()
  const reservations = [reservation, ...(current.reservations || [])]
  return writeServerDb({ reservations })
}

/**
 * Adiciona um novo lead de serviço de forma atómica e segura no servidor
 */
export function appendServerLead(lead: any) {
  const current = readServerDb()
  const leads = [lead, ...(current.leads || [])]
  return writeServerDb({ leads })
}

/**
 * Adiciona uma nova subscrição de newsletter de forma atómica e segura no servidor
 */
export function appendServerSubscriber(subscriber: any) {
  const current = readServerDb()
  const existing = (current.subscribers || []).find((s: any) => s.email?.toLowerCase() === subscriber.email?.toLowerCase())
  if (existing) return true
  const subscribers = [subscriber, ...(current.subscribers || [])]
  return writeServerDb({ subscribers })
}

/**
 * Adiciona uma nova inscrição em evento de forma atómica e segura no servidor
 */
export function appendServerEventRegistration(registration: any) {
  const current = readServerDb()
  const eventRegistrations = [registration, ...(current.eventRegistrations || [])]
  return writeServerDb({ eventRegistrations })
}

