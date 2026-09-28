import { createHash, randomInt, timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import { readServerDb, writeServerDb } from '@/lib/server-db'
import { validatePasswordStrength } from '@/lib/security-utils'
import { hashPassword } from '@/lib/server-auth'
import { sendPasswordRecoveryEmail } from '@/lib/email-service'
import { prisma } from '@/lib/prisma'

const CODE_TTL_MS = 15 * 60 * 1000
const SEND_WINDOW_MS = 15 * 60 * 1000
const MAX_SENDS = 3
const MAX_ATTEMPTS = 5

function codeHash(code: string) {
  return createHash('sha256').update(code).digest('hex')
}

function codesMatch(code: string, storedHash: string) {
  const supplied = Buffer.from(codeHash(code), 'hex')
  const expected = Buffer.from(storedHash, 'hex')
  return supplied.length === expected.length && timingSafeEqual(supplied, expected)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: 'Pedido inválido.' }, { status: 400 })
    }

    const db = readServerDb()
    let customer = (db.customers || []).find((item: any) => item.email?.toLowerCase() === email)
    let admin = (db.users || []).find((item: any) => item.email?.toLowerCase() === email)
    let customerInPrisma = false
    let adminInPrisma = false
    if (!customer) {
      try {
        customer = await prisma.customer.findUnique({ where: { email } }) as any
        customerInPrisma = Boolean(customer)
      } catch (error) {
        console.warn('[Auth recovery] Consulta do cliente no Prisma falhou.')
      }
    }
    if (!admin && !customer) {
      try {
        admin = await prisma.adminUser.findUnique({ where: { email } }) as any
        adminInPrisma = Boolean(admin)
      } catch (error) {
        console.warn('[Auth recovery] Consulta do administrador no Prisma falhou.')
      }
    }
    const entries = Array.isArray(db.recoveryTokens) ? db.recoveryTokens : []
    const now = Date.now()

    if (body.action === 'send') {
      if (!customer && !admin) {
        return NextResponse.json({ success: true, message: 'Se o endereço estiver registado, receberá instruções de recuperação.' })
      }
      const previousEntry = entries.find((entry: any) => entry.email === email)
      const sendCount = previousEntry && previousEntry.windowStartedAt > now - SEND_WINDOW_MS
        ? previousEntry.sendCount || 1
        : 0
      if (sendCount >= MAX_SENDS) {
        return NextResponse.json({ success: false, message: 'Aguarde alguns minutos antes de pedir um novo código.' }, { status: 429 })
      }

      const code = String(randomInt(100000, 1000000))
      const entry = {
        email,
        accountId: customer?.id || admin.id,
        accountType: customer ? 'customer' : 'admin',
        codeHash: codeHash(code),
        sentAt: now,
        windowStartedAt: sendCount ? previousEntry.windowStartedAt : now,
        sendCount: sendCount + 1,
        expiresAt: now + CODE_TTL_MS,
        attempts: 0,
      }
      writeServerDb({ recoveryTokens: [...entries.filter((item: any) => item.email !== email), entry] })
      const result = await sendPasswordRecoveryEmail(email, code)
      if (!result.success) {
        console.error('[Auth recovery] SMTP rejected recovery email:', result.error || result.mode)
        writeServerDb({ recoveryTokens: entries })
        return NextResponse.json({ success: false, message: 'O serviço de email não está disponível. Tente novamente mais tarde.' }, { status: 503 })
      }
      console.info('[Auth recovery] SMTP accepted recovery email:', result.messageId || 'accepted')
      const response: Record<string, unknown> = {
        success: true,
        message: result.mode === 'ethereal_test'
          ? 'Email de teste gerado. Este modo não entrega mensagens na caixa real; abra a pré-visualização abaixo.'
          : 'Se o endereço estiver registado, receberá instruções de recuperação.',
        mode: result.mode,
      }
      if (process.env.NODE_ENV !== 'production' && result.previewUrl) response.previewUrl = result.previewUrl
      return NextResponse.json(response)
    }

    if (body.action === 'reset') {
      const code = typeof body.code === 'string' ? body.code.trim() : ''
      const password = typeof body.password === 'string' ? body.password : ''
      const entryIndex = entries.findIndex((item: any) => item.email === email)
      const entry = entryIndex >= 0 ? entries[entryIndex] : null
      if (!entry || entry.expiresAt <= now || entry.attempts >= MAX_ATTEMPTS || !codesMatch(code, entry.codeHash)) {
        if (entry) {
          entries[entryIndex] = { ...entry, attempts: entry.attempts + 1 }
          writeServerDb({ recoveryTokens: entries })
        }
        return NextResponse.json({ success: false, message: 'Código inválido ou expirado.' }, { status: 400 })
      }
      const validation = validatePasswordStrength(password)
      if (!validation.isValid) return NextResponse.json({ success: false, message: validation.errors.join(' ') }, { status: 400 })

      const isCustomer = entry.accountType === 'customer'
      const accounts = isCustomer ? db.customers || [] : db.users || []
      let account = accounts.find((item: any) => item.id === entry.accountId && item.email?.toLowerCase() === email)
      const prismaAccount = isCustomer
        ? customerInPrisma ? customer : await prisma.customer.findUnique({ where: { email } }).catch(() => null)
        : adminInPrisma ? admin : await prisma.adminUser.findUnique({ where: { email } }).catch(() => null)
      account ||= prismaAccount as any
      if (!account) return NextResponse.json({ success: false, message: 'Código inválido ou expirado.' }, { status: 400 })
      const collection = isCustomer ? 'customers' : 'users'
      const updatedAccount = { ...account, password: null, passwordHash: hashPassword(password) }
      if (isCustomer && (customerInPrisma || prismaAccount)) {
        await prisma.customer.update({ where: { id: account.id }, data: { password: null, passwordHash: updatedAccount.passwordHash } })
      } else if (!isCustomer && (adminInPrisma || prismaAccount)) {
        await prisma.adminUser.update({ where: { id: account.id }, data: { password: null, passwordHash: updatedAccount.passwordHash } })
      }
      const updatedAccounts = accounts.some((item: any) => item.id === account.id)
        ? accounts.map((item: any) => item.id === account.id ? updatedAccount : item)
        : [...accounts, updatedAccount]
      const saved = writeServerDb({
        [collection]: updatedAccounts,
        recoveryTokens: entries.filter((_: any, index: number) => index !== entryIndex),
      })
      if (!saved) return NextResponse.json({ success: false, message: 'Não foi possível guardar a nova palavra-passe. Tente novamente.' }, { status: 500 })
      return NextResponse.json({ success: true, message: 'Palavra-passe alterada com sucesso.' })
    }

    return NextResponse.json({ success: false, message: 'Pedido inválido.' }, { status: 400 })
  } catch (error) {
    console.error('[Auth recovery] Erro:', error)
    return NextResponse.json({ success: false, message: 'Não foi possível processar o pedido.' }, { status: 500 })
  }
}