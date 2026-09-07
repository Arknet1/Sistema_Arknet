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
      projects: parsed.projects?.length ? parsed.projects : INITIAL_DB.projects,
      partners: parsed.partners?.length ? parsed.partners : INITIAL_DB.partners,
      testimonials: parsed.testimonials?.length ? parsed.testimonials : INITIAL_DB.testimonials,
      events: parsed.events?.length ? parsed.events : INITIAL_DB.events,
      courses: parsed.courses?.length ? parsed.courses : INITIAL_DB.courses,
      categories: parsed.categories?.length ? parsed.categories : INITIAL_DB.categories,
      products: parsed.products?.length ? parsed.products : INITIAL_DB.products,
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

    const mergedData = {
      ...INITIAL_DB,
      ...data,
      settings: {
        ...INITIAL_DB.settings,
        ...(data.settings || {}),
        socialLinks: {
          ...INITIAL_DB.settings?.socialLinks,
          ...(data.settings?.socialLinks || {}),
        },
      },
    }

    // Atomic write using a temp file
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`
    fs.writeFileSync(tempFile, JSON.stringify(mergedData, null, 2), 'utf-8')
    fs.renameSync(tempFile, DB_FILE)
    return true
  } catch (error) {
    console.error('[Server DB] Error writing DB:', error)
    return false
  }
}
