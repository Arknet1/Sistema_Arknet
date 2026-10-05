import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { hashPasswordSync, verifyPassword } from './security-utils'

export interface ServerSessionPayload {
  userId: string
  email: string
  role: string
  exp: number
}

let _authSecretWarned = false

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    if (!_authSecretWarned) {
      _authSecretWarned = true
      console.warn(
        '\n[AVISO] [ARKNET SEGURANCA] AUTH_SECRET não está definido nas variáveis de ambiente!\n' +
        '   A usar chave de fallback. Isto NÃO é seguro em produção.\n' +
        '   Gere uma chave: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"\n'
      )
    }
    return 'arknet-telecom-secure-auth-secret-key-2026-production-ao'
  }
  return secret
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `$scrypt$${salt}$${hash}`
}

export function verifyStoredPassword(password: string, stored?: string | null) {
  if (!password || !stored) return false
  const parts = stored.split('$')
  if (parts.length === 4 && parts[1] === 'scrypt') {
    try {
      const expected = Buffer.from(parts[3], 'hex')
      const actual = scryptSync(password, parts[2], expected.length)
      return expected.length === actual.length && timingSafeEqual(expected, actual)
    } catch {
      return false
    }
  }
  return verifyPassword(password, stored) || stored === hashPasswordSync(password)
}

export function createSessionToken(payload: Omit<ServerSessionPayload, 'exp'>, ttlSeconds = 60 * 60 * 12) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + ttlSeconds * 1000 })).toString('base64url')
  const signature = createHmac('sha256', getSessionSecret()).update(body).digest('base64url')
  return `${body}.${signature}`
}

export function verifySessionToken(token: string): ServerSessionPayload | null {
  try {
    const [body, signature] = token.split('.')
    if (!body || !signature) return null
    const expected = createHmac('sha256', getSessionSecret()).update(body).digest()
    const actual = Buffer.from(signature, 'base64url')
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as ServerSessionPayload
    if (!payload.userId || !payload.email || !payload.role || !Number.isFinite(payload.exp) || Date.now() >= payload.exp) return null
    return payload
  } catch {
    return null
  }
}
