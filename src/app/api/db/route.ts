import { NextRequest, NextResponse } from 'next/server'
import {
  readServerDb,
  writeServerDb,
  getInitialServerDb,
  getSanitizedPublicDb,
  appendServerOrder,
  appendServerReservation,
  appendServerLead,
  appendServerSubscriber,
  appendServerEventRegistration,
} from '@/lib/server-db'
import { verifySessionToken } from '@/lib/security-utils'

// ==========================================
// UTILITÁRIO: Verificar token de administrador
// ==========================================
function getAdminPayload(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const adminCookie = request.cookies.get('arknet_admin_token')?.value
  const token = authHeader?.replace('Bearer ', '') || adminCookie
  if (!token) return null
  const payload = verifySessionToken(token)
  if (!payload || (payload.role !== 'admin' && payload.role !== 'editor')) return null
  return payload
}

// ==========================================
// GET /api/db — Leitura de Dados
// ==========================================
// Administradores autenticados: Retorna a base de dados completa
// Visitantes públicos: Retorna apenas dados públicos sanitizados (produtos, eventos, projetos, etc.)
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminPayload(request)

    if (admin) {
      // Administrador autenticado: acesso completo
      const db = readServerDb()
      return NextResponse.json({ success: true, db }, { status: 200 })
    }

    // Visitante público: apenas dados do site e da loja (sem utilizadores, encomendas, leads, etc.)
    const publicDb = getSanitizedPublicDb()
    return NextResponse.json({ success: true, db: publicDb }, { status: 200 })
  } catch (error) {
    console.error('[API /api/db GET] Erro:', error)
    return NextResponse.json({ success: false, message: 'Erro ao carregar dados' }, { status: 500 })
  }
}

// ==========================================
// POST /api/db — Escrita de Dados
// ==========================================
// Suporta dois modos:
// 1. Ações públicas granulares: create_order, create_lead, create_reservation, subscribe_newsletter, register_event, register_customer
// 2. Ações administrativas (requerem token): reset, substituição completa da BD, sincronização do painel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, message: 'Dados inválidos' }, { status: 400 })
    }

    const action = body.action as string | undefined

    // ── Ações Públicas Seguras (sem autenticação) ──────────────────────

    if (action === 'create_order') {
      const order = body.order
      if (!order || !order.id || !order.customerName || !order.customerEmail || !order.items) {
        return NextResponse.json({ success: false, message: 'Dados da encomenda incompletos' }, { status: 400 })
      }
      const success = appendServerOrder(order)
      if (!success) {
        return NextResponse.json({ success: false, message: 'Falha ao gravar encomenda no servidor' }, { status: 500 })
      }
      return NextResponse.json({ success: true, message: 'Encomenda registada com sucesso' }, { status: 201 })
    }

    if (action === 'create_lead') {
      const lead = body.lead
      if (!lead || !lead.name || !lead.email || !lead.service) {
        return NextResponse.json({ success: false, message: 'Dados do lead incompletos' }, { status: 400 })
      }
      const success = appendServerLead(lead)
      if (!success) {
        return NextResponse.json({ success: false, message: 'Falha ao gravar lead no servidor' }, { status: 500 })
      }
      return NextResponse.json({ success: true, message: 'Pedido de contacto registado com sucesso' }, { status: 201 })
    }

    if (action === 'create_reservation') {
      const reservation = body.reservation
      if (!reservation || !reservation.id || !reservation.customerName || !reservation.productId) {
        return NextResponse.json({ success: false, message: 'Dados da reserva incompletos' }, { status: 400 })
      }
      const success = appendServerReservation(reservation)
      if (!success) {
        return NextResponse.json({ success: false, message: 'Falha ao gravar reserva no servidor' }, { status: 500 })
      }
      return NextResponse.json({ success: true, message: 'Reserva registada com sucesso' }, { status: 201 })
    }

    if (action === 'subscribe_newsletter') {
      const email = body.email
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return NextResponse.json({ success: false, message: 'Email inválido' }, { status: 400 })
      }
      const subscriber = {
        id: `sub-${Date.now()}`,
        email: email.toLowerCase().trim(),
        status: 'active',
        subscribedAt: new Date().toISOString(),
      }
      const success = appendServerSubscriber(subscriber)
      if (!success) {
        return NextResponse.json({ success: false, message: 'Falha ao registar subscrição' }, { status: 500 })
      }
      return NextResponse.json({ success: true, message: 'Subscrição de newsletter ativada com sucesso' }, { status: 201 })
    }

    if (action === 'register_event') {
      const registration = body.registration
      if (!registration || !registration.eventId || !registration.name || !registration.email) {
        return NextResponse.json({ success: false, message: 'Dados de inscrição incompletos' }, { status: 400 })
      }
      const success = appendServerEventRegistration(registration)
      if (!success) {
        return NextResponse.json({ success: false, message: 'Falha ao registar inscrição' }, { status: 500 })
      }
      return NextResponse.json({ success: true, message: 'Inscrição no evento registada com sucesso' }, { status: 201 })
    }

    if (action === 'register_customer') {
      const customer = body.customer
      if (!customer || !customer.name || !customer.email || !customer.phone) {
        return NextResponse.json({ success: false, message: 'Dados do cliente incompletos' }, { status: 400 })
      }
      const current = readServerDb()
      const existing = (current.customers || []).find(
        (c: any) => c.email?.toLowerCase() === customer.email?.toLowerCase()
      )
      if (existing) {
        return NextResponse.json({ success: false, message: 'Já existe uma conta com este email' }, { status: 409 })
      }
      const customers = [customer, ...(current.customers || [])]
      const success = writeServerDb({ customers })
      if (!success) {
        return NextResponse.json({ success: false, message: 'Falha ao registar cliente' }, { status: 500 })
      }
      return NextResponse.json({ success: true, message: 'Conta de cliente criada com sucesso' }, { status: 201 })
    }

    // ── Ações Administrativas (requerem autenticação) ──────────────────

    const admin = getAdminPayload(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Acesso não autorizado. Autenticação de administrador obrigatória para esta operação.' },
        { status: 401 }
      )
    }

    if (action === 'reset') {
      const initial = getInitialServerDb()
      writeServerDb(initial)
      return NextResponse.json({ success: true, message: 'Base de dados restaurada com sucesso', db: initial }, { status: 200 })
    }

    // Sincronização completa do painel de administração
    const dataToSave = body.db ? body.db : body
    const success = writeServerDb(dataToSave)

    if (!success) {
      return NextResponse.json({ success: false, message: 'Falha ao gravar base de dados no servidor' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Base de dados atualizada com sucesso' }, { status: 200 })
  } catch (error) {
    console.error('[API /api/db POST] Erro:', error)
    return NextResponse.json({ success: false, message: 'Erro ao processar requisição' }, { status: 500 })
  }
}

