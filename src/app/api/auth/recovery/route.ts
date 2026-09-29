import { createHash, randomInt, timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import { readServerDb, writeServerDb } from '@/lib/server-db'
import { validatePasswordStrength } from '@/lib/security-utils'
import { hashPassword } from '@/lib/server-auth'
import { sendPasswordRecoveryEmail } from '@/lib/email-service'
import { prisma } from '@/lib/prisma'

const CODE_TTL_MS = 15 * 60 * 1000 // 15 minutos
const SEND_WINDOW_MS = 15 * 60 * 1000
const MAX_SENDS = 5
const MAX_ATTEMPTS = 5

function codeHash(code: string) {
  return createHash('sha256').update(code.trim()).digest('hex')
}

function codesMatch(code: string, storedHash: string) {
  try {
    const supplied = Buffer.from(codeHash(code), 'hex')
    const expected = Buffer.from(storedHash, 'hex')
    return supplied.length === expected.length && timingSafeEqual(supplied, expected)
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: 'Introduza um endereço de email válido.' }, { status: 400 })
    }

    const db = readServerDb()
    let customer = (db.customers || []).find((item: any) => item.email?.toLowerCase() === email)
    let admin = (db.users || []).find((item: any) => item.email?.toLowerCase() === email)
    let customerInPrisma = false
    let adminInPrisma = false

    if (!customer) {
      try {
        customer = (await prisma.customer.findUnique({ where: { email } })) as any
        customerInPrisma = Boolean(customer)
      } catch (error) {
        console.warn('[Auth recovery] Consulta do cliente no Prisma falhou:', error)
      }
    }
    if (!admin && !customer) {
      try {
        admin = (await prisma.adminUser.findUnique({ where: { email } })) as any
        adminInPrisma = Boolean(admin)
      } catch (error) {
        console.warn('[Auth recovery] Consulta do administrador no Prisma falhou:', error)
      }
    }

    const rawEntries = Array.isArray(db.recoveryTokens) ? db.recoveryTokens : []
    const now = Date.now()
    // Limpar tokens expirados antigos
    const entries = rawEntries.filter((entry: any) => entry.expiresAt > now - 24 * 60 * 60 * 1000)

    // ==========================================
    // AÇÃO 1: ENVIAR CÓDIGO DE RECUPERAÇÃO
    // ==========================================
    if (body.action === 'send') {
      if (!customer && !admin) {
        // Resposta genérica para evitar enumeração de contas
        return NextResponse.json({
          success: true,
          message: 'Se o endereço estiver registado no sistema, receberá um email com o código de verificação.',
        })
      }

      const previousEntry = entries.find((entry: any) => entry.email === email)
      const sendCount =
        previousEntry && previousEntry.windowStartedAt > now - SEND_WINDOW_MS
          ? previousEntry.sendCount || 1
          : 0

      if (sendCount >= MAX_SENDS) {
        return NextResponse.json(
          { success: false, message: 'Demasiados pedidos de recuperação. Aguarde alguns minutos antes de pedir um novo código.' },
          { status: 429 }
        )
      }

      // Código criptograficamente aleatório de 6 dígitos
      const code = String(randomInt(100000, 1000000))
      const userName = customer?.name || admin?.name || ''

      const entry = {
        email,
        accountId: customer?.id || admin?.id,
        accountType: customer ? 'customer' : 'admin',
        userName,
        codeHash: codeHash(code),
        sentAt: now,
        windowStartedAt: sendCount ? previousEntry.windowStartedAt : now,
        sendCount: sendCount + 1,
        expiresAt: now + CODE_TTL_MS,
        attempts: 0,
      }

      // Salvar token no banco
      writeServerDb({ recoveryTokens: [...entries.filter((item: any) => item.email !== email), entry] })

      // Log visível no terminal do servidor para depuração imediata
      console.log(`\n======================================================`)
      console.log(`[ARKNET RECUPERAÇÃO DE PALAVRA-PASSE]`)
      console.log(`Utilizador: ${userName || 'N/A'}`)
      console.log(`Email: ${email}`)
      console.log(`CÓDIGO DE RECUPERAÇÃO: ${code}`)
      console.log(`Validade: 15 minutos (até ${new Date(entry.expiresAt).toLocaleTimeString()})`)
      console.log(`======================================================\n`)

      // Enviar email via serviço de email
      const result = await sendPasswordRecoveryEmail(email, code, userName)

      if (!result.success) {
        console.error('[Auth recovery] SMTP falhou ao enviar email:', result.error || result.mode)
        return NextResponse.json(
          {
            success: false,
            message: result.message || 'Não foi possível enviar o email com o código. Tente novamente mais tarde.',
          },
          { status: 503 }
        )
      }

      const response: Record<string, unknown> = {
        success: true,
        message: 'Código de verificação de 6 dígitos enviado com sucesso para o seu email.',
        mode: result.mode,
      }

      if (result.previewUrl) {
        response.previewUrl = result.previewUrl
      }

      return NextResponse.json(response)
    }

    // ==========================================
    // AÇÃO 2: VERIFICAR CÓDIGO (Validação rápida)
    // ==========================================
    if (body.action === 'verify') {
      const code = typeof body.code === 'string' ? body.code.trim() : ''
      const entry = entries.find((item: any) => item.email === email)

      if (!entry || entry.expiresAt <= now || entry.attempts >= MAX_ATTEMPTS || !codesMatch(code, entry.codeHash)) {
        return NextResponse.json({ success: false, message: 'Código de verificação inválido ou expirado.' }, { status: 400 })
      }

      return NextResponse.json({ success: true, message: 'Código validado com sucesso.' })
    }

    // ==========================================
    // AÇÃO 3: REDEFINIR PALAVRA-PASSE
    // ==========================================
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
        return NextResponse.json(
          { success: false, message: 'Código de verificação inválido ou expirado. Peça um novo código.' },
          { status: 400 }
        )
      }

      // Validação de segurança da palavra-passe
      const validation = validatePasswordStrength(password)
      if (!validation.isValid) {
        return NextResponse.json({ success: false, message: validation.errors.join(' ') }, { status: 400 })
      }

      const isCustomer = entry.accountType === 'customer'
      const accounts = isCustomer ? db.customers || [] : db.users || []
      let account = accounts.find((item: any) => item.email?.toLowerCase() === email)

      const prismaAccount = isCustomer
        ? customerInPrisma
          ? customer
          : await prisma.customer.findUnique({ where: { email } }).catch(() => null)
        : adminInPrisma
        ? admin
        : await prisma.adminUser.findUnique({ where: { email } }).catch(() => null)

      account ||= prismaAccount as any

      if (!account) {
        return NextResponse.json({ success: false, message: 'Conta de utilizador não encontrada.' }, { status: 400 })
      }

      const collection = isCustomer ? 'customers' : 'users'
      const newHash = hashPassword(password)
      const updatedAccount = { ...account, password: null, passwordHash: newHash }

      // 1. Atualizar no Prisma ORM
      if (isCustomer) {
        try {
          await prisma.customer.update({
            where: { email },
            data: { password: null, passwordHash: newHash },
          })
        } catch (err) {
          console.warn('[Auth recovery] Atualização Prisma customer falhou:', err)
        }
      } else {
        try {
          await prisma.adminUser.update({
            where: { email },
            data: { password: null, passwordHash: newHash },
          })
        } catch (err) {
          console.warn('[Auth recovery] Atualização Prisma adminUser falhou:', err)
        }
      }

      // 2. Atualizar no JSON Server DB e limpar o token usado
      const updatedAccounts = accounts.some((item: any) => item.email?.toLowerCase() === email)
        ? accounts.map((item: any) => (item.email?.toLowerCase() === email ? updatedAccount : item))
        : [...accounts, updatedAccount]

      const saved = writeServerDb({
        [collection]: updatedAccounts,
        recoveryTokens: entries.filter((_: any, index: number) => index !== entryIndex),
      })

      if (!saved) {
        return NextResponse.json(
          { success: false, message: 'Não foi possível guardar a nova palavra-passe. Tente novamente.' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Palavra-passe alterada com sucesso! Já pode iniciar sessão com as suas novas credenciais.',
      })
    }

    return NextResponse.json({ success: false, message: 'Ação de recuperação não suportada.' }, { status: 400 })
  } catch (error) {
    console.error('[Auth recovery] Erro:', error)
    return NextResponse.json({ success: false, message: 'Não foi possível processar o pedido de recuperação.' }, { status: 500 })
  }
}