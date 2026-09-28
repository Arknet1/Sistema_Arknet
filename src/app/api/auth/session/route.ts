import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { readServerDb, writeServerDb } from '@/lib/server-db'
import { validatePasswordStrength } from '@/lib/security-utils'
import { createSessionToken, hashPassword, verifySessionToken, verifyStoredPassword } from '@/lib/server-auth'

const ADMIN_COOKIE = 'arknet_admin_token'
const CUSTOMER_COOKIE = 'arknet_customer_token'
const attempts = new Map<string, { count: number; resetAt: number }>()

function safeAccount(account: any) {
  const { password: _password, passwordHash: _passwordHash, ...safe } = account
  return safe
}

function getRateLimitKey(request: NextRequest, email: string) {
  return `${request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'}:${email}`
}

export async function GET(request: NextRequest) {
  try {
    const db = readServerDb()
    const adminToken = request.cookies.get(ADMIN_COOKIE)?.value
    const customerToken = request.cookies.get(CUSTOMER_COOKIE)?.value
    const token = adminToken || customerToken
    if (!token) return NextResponse.json({ authenticated: false })

    const session = verifySessionToken(token)
    if (!session) return NextResponse.json({ authenticated: false })
    const accounts = session.role === 'admin' || session.role === 'editor' ? db.users : db.customers
    const account = (accounts || []).find((item: any) => item.id === session.userId && item.status === 'active')
    if (!account) return NextResponse.json({ authenticated: false })
    return NextResponse.json({ authenticated: true, kind: adminToken ? 'admin' : 'customer', user: safeAccount(account) })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const action = body?.action
    const db = readServerDb()

    if (action === 'change-password') {
      const token = request.cookies.get(ADMIN_COOKIE)?.value || request.cookies.get(CUSTOMER_COOKIE)?.value
      const session = token ? verifySessionToken(token) : null
      const isAdmin = session?.role === 'admin' || session?.role === 'editor'
      const accounts = isAdmin ? db.users || [] : db.customers || []
      const account = session && accounts.find((item: any) => item.id === session.userId && item.status === 'active')
      if (!account || !verifyStoredPassword(body.currentPassword || '', account.passwordHash || account.password)) {
        return NextResponse.json({ success: false, message: 'A palavra-passe atual está incorreta.' }, { status: 401 })
      }
      const validation = validatePasswordStrength(typeof body.newPassword === 'string' ? body.newPassword : '')
      if (!validation.isValid) return NextResponse.json({ success: false, message: validation.errors.join(' ') }, { status: 400 })
      const collection = isAdmin ? 'users' : 'customers'
      writeServerDb({
        [collection]: accounts.map((item: any) => item.id === account.id
          ? { ...item, password: null, passwordHash: hashPassword(body.newPassword) }
          : item),
      })
      return NextResponse.json({ success: true, message: 'Palavra-passe alterada com sucesso.' })
    }

    if (action === 'register') {
      const name = typeof body.name === 'string' ? body.name.trim() : ''
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
      const password = typeof body.password === 'string' ? body.password : ''
      const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
      if (!name || !email.includes('@') || !phone) {
        return NextResponse.json({ success: false, message: 'Preencha os dados obrigatórios.' }, { status: 400 })
      }
      const validation = validatePasswordStrength(password)
      if (!validation.isValid) return NextResponse.json({ success: false, message: validation.errors.join(' ') }, { status: 400 })
      if ((db.customers || []).some((item: any) => item.email?.toLowerCase() === email) || (db.users || []).some((item: any) => item.email?.toLowerCase() === email)) {
        return NextResponse.json({ success: false, message: 'Já existe uma conta associada a este email.' }, { status: 409 })
      }
      const customer = {
        id: `cli-${randomUUID()}`,
        name,
        email,
        passwordHash: hashPassword(password),
        phone,
        company: typeof body.company === 'string' ? body.company.trim() : undefined,
        nif: typeof body.nif === 'string' ? body.nif.trim() : undefined,
        address: typeof body.address === 'string' ? body.address.trim() : undefined,
        city: typeof body.city === 'string' ? body.city.trim() : 'Luanda',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }
      if (!writeServerDb({ customers: [...(db.customers || []), customer] })) {
        return NextResponse.json({ success: false, message: 'Não foi possível criar a conta.' }, { status: 500 })
      }
      return issueSession(customer, 'customer', body.rememberMe !== false)
    }

    if (action !== 'login') return NextResponse.json({ success: false, message: 'Pedido inválido.' }, { status: 400 })

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const kind = body.kind === 'admin' ? 'admin' : 'customer'
    if (!email || !password) return NextResponse.json({ success: false, message: 'Credenciais inválidas.' }, { status: 400 })

    const key = getRateLimitKey(request, email)
    const limit = attempts.get(key)
    if (limit && limit.resetAt > Date.now() && limit.count >= 5) {
      return NextResponse.json({ success: false, message: 'Demasiadas tentativas. Aguarde 15 minutos.' }, { status: 429 })
    }
    const accounts = kind === 'admin' ? db.users || [] : db.customers || []
    const account = accounts.find((item: any) => item.email?.toLowerCase() === email)
    if (!account || account.status !== 'active' || !verifyStoredPassword(password, account.passwordHash || account.password)) {
      const next = limit && limit.resetAt > Date.now() ? limit : { count: 0, resetAt: Date.now() + 15 * 60 * 1000 }
      next.count += 1
      attempts.set(key, next)
      return NextResponse.json({ success: false, message: 'Email ou palavra-passe inválidos.' }, { status: 401 })
    }

    attempts.delete(key)
    const updated = { ...account, passwordHash: hashPassword(password), password: null, lastLogin: new Date().toISOString() }
    const collection = kind === 'admin' ? 'users' : 'customers'
    writeServerDb({ [collection]: accounts.map((item: any) => item.id === account.id ? updated : item) })
    return issueSession(updated, kind, body.rememberMe !== false)
  } catch (error) {
    console.error('[Auth] Erro ao autenticar:', error)
    return NextResponse.json({ success: false, message: 'Não foi possível processar o pedido.' }, { status: 500 })
  }
}

function issueSession(account: any, kind: 'admin' | 'customer', rememberMe: boolean) {
  const role = kind === 'admin' ? account.role : 'customer'
  const token = createSessionToken({ userId: account.id, email: account.email, role }, rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 12)
  const response = NextResponse.json({ success: true, kind, user: safeAccount(account), message: `Bem-vindo, ${account.name}!` })
  response.cookies.set(kind === 'admin' ? ADMIN_COOKIE : CUSTOMER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 12,
  })
  response.cookies.set(kind === 'admin' ? CUSTOMER_COOKIE : ADMIN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  for (const name of [ADMIN_COOKIE, CUSTOMER_COOKIE]) {
    response.cookies.set(name, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 })
  }
  return response
}