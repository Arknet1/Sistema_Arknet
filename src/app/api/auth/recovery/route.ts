import { NextResponse } from 'next/server'
import { randomInt } from 'crypto'
import { readServerDb, writeServerDb } from '@/lib/server-db'
import { hashPasswordSync, validatePasswordStrength } from '@/lib/security-utils'
import { sendPasswordRecoveryEmail } from '@/lib/email-service'

type RecoveryEntry = { email: string; code: string; expiresAt: number; attempts: number }
const recoveryStore = new Map<string, RecoveryEntry>()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const action = body.action
    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, message: 'Pedido inválido.' }, { status: 400 })
    }

    const db = readServerDb()
    const customer = (db.customers || []).find((item: any) => item.email?.toLowerCase() === email)
    const admin = (db.users || []).find((item: any) => item.email?.toLowerCase() === email)

    if (action === 'send') {
      // Resposta uniforme para não revelar se um endereço está registado.
      if (!customer && !admin) {
        return NextResponse.json({ success: true, message: 'Se o endereço estiver registado, receberá instruções de recuperação.' })
      }
      const previous = recoveryStore.get(email)
      if (previous && previous.expiresAt > Date.now() && previous.attempts >= 3) {
        return NextResponse.json({ success: false, message: 'Aguarde alguns minutos antes de pedir um novo código.' }, { status: 429 })
      }
      const code = String(randomInt(100000, 1000000))
      recoveryStore.set(email, { email, code, expiresAt: Date.now() + 15 * 60 * 1000, attempts: 0 })
      const result = await sendPasswordRecoveryEmail(email, code)
      if (!result.success) return NextResponse.json({ success: false, message: result.message }, { status: 503 })
      return NextResponse.json({ success: true, message: 'Se o endereço estiver registado, receberá instruções de recuperação.' })
    }

    if (action === 'reset') {
      const code = typeof body.code === 'string' ? body.code.trim() : ''
      const password = typeof body.password === 'string' ? body.password : ''
      const entry = recoveryStore.get(email)
      if (!entry || entry.expiresAt < Date.now() || entry.code !== code || entry.attempts >= 5) {
        if (entry) entry.attempts += 1
        return NextResponse.json({ success: false, message: 'Código inválido ou expirado.' }, { status: 400 })
      }
      const validation = validatePasswordStrength(password)
      if (!validation.isValid) return NextResponse.json({ success: false, message: validation.errors.join(' ') }, { status: 400 })
      if (customer) {
        writeServerDb({ customers: (db.customers || []).map((item: any) => item.email?.toLowerCase() === email ? { ...item, password: password, passwordHash: hashPasswordSync(password) } : item) })
      } else if (admin) {
        writeServerDb({ users: (db.users || []).map((item: any) => item.email?.toLowerCase() === email ? { ...item, password: password, passwordHash: hashPasswordSync(password) } : item) })
      }
      recoveryStore.delete(email)
      return NextResponse.json({ success: true, message: 'Palavra-passe alterada com sucesso.' })
    }

    return NextResponse.json({ success: false, message: 'Pedido inválido.' }, { status: 400 })
  } catch {
    return NextResponse.json({ success: false, message: 'Não foi possível processar o pedido.' }, { status: 500 })
  }
}