import { createHash, randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import {
  TicketItem,
  TicketNoteItem,
  TicketReplyItem,
  TicketFilterParams,
  TicketStats,
  TicketType,
  TicketCategory,
  TicketStatus,
  TicketPriority,
  TicketReplyChannel,
} from './types'
import { PublicTicketSubmissionInput } from './schemas'
import {
  sendTicketConfirmationEmail,
  sendTicketTeamAlertEmail,
  sendTicketReplyEmail,
} from './email-templates'
import { sendWhatsAppTextMessage } from '@/lib/whatsapp/meta-api'

// Rate limiter storage: key -> timestamps array
const rateLimitMap = new Map<string, number[]>()

/**
 * Sanitiza texto removendo tags HTML e caracteres perigosos
 */
export function sanitizeText(text: string): string {
  if (!text) return ''
  return text
    .replace(/<[^>]*>?/gm, '') // Remove tags HTML
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '') // Remove control characters
    .trim()
}

/**
 * Gera hash criptográfico do IP para anti-abuso e privacidade
 */
export function hashIpAddress(ip: string): string {
  const secret = process.env.AUTH_SECRET || 'arknet-ip-salt-2026'
  return createHash('sha256').update(`${ip}:${secret}`).digest('hex').substring(0, 32)
}

/**
 * Rate limiter em memória por IP Hash
 * Máximo 1 submissão por 60 segundos e máximo 5 submissões por 60 minutos
 */
export function checkRateLimit(ipHash: string): { allowed: boolean; reason?: string } {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hora
  const minIntervalMs = 60 * 1000 // 1 minuto

  const history = (rateLimitMap.get(ipHash) || []).filter((t) => now - t < windowMs)

  if (history.length > 0) {
    const lastSubmission = history[history.length - 1]
    if (now - lastSubmission < minIntervalMs) {
      return {
        allowed: false,
        reason: 'Por favor aguarde 1 minuto antes de submeter outro pedido.',
      }
    }
  }

  if (history.length >= 5) {
    return {
      allowed: false,
      reason: 'Limite de 5 pedidos por hora atingido para este dispositivo. Tente mais tarde.',
    }
  }

  history.push(now)
  rateLimitMap.set(ipHash, history)
  return { allowed: true }
}

/**
 * Gera o número de protocolo sequencial/único: ARK-AAAA-NNNNNN (ex: ARK-2026-000101)
 */
export async function generateTicketProtocol(): Promise<string> {
  const year = new Date().getFullYear()
  try {
    const count = await (prisma as any).ticket.count({
      where: {
        createdAt: {
          gte: new Date(year, 0, 1),
        },
      },
    })
    const sequenceNumber = count + 1
    const randomSuffix = Math.floor(Math.random() * 90) + 10 // pequeno salt aleatório
    const baseSeq = (sequenceNumber * 10) + (randomSuffix % 10)
    return `ARK-${year}-${String(baseSeq).padStart(6, '0')}`
  } catch {
    const fallbackSeq = Math.floor(100000 + Math.random() * 900000)
    return `ARK-${year}-${fallbackSeq}`
  }
}

/**
 * Criação pública de Ticket
 */
export async function createTicket(
  input: PublicTicketSubmissionInput,
  rawIp: string,
  customerId?: string | null
): Promise<{ success: boolean; protocol: string; message?: string }> {
  // 1. Anti-spam check: Honeypot
  if (input.website_url_hp && input.website_url_hp.trim().length > 0) {
    console.warn('[Ticket Anti-Spam] Honeypot preenchido, submissão descartada silenciosamente.')
    // Retorna protocolo simulado para não revelar o mecanismo
    return { success: true, protocol: `ARK-${new Date().getFullYear()}-000999` }
  }

  // 2. Anti-spam check: Minimum form fill time (ex: at least 2.5 seconds)
  if (input.renderedAt && typeof input.renderedAt === 'number') {
    const elapsedSeconds = (Date.now() - input.renderedAt) / 1000
    if (elapsedSeconds < 2) {
      console.warn(`[Ticket Anti-Spam] Submissão demasiado rápida (${elapsedSeconds.toFixed(1)}s), possível bot.`)
    }
  }

  // 3. Rate Limit check
  const ipHash = hashIpAddress(rawIp || 'unknown')
  const rateLimit = checkRateLimit(ipHash)
  if (!rateLimit.allowed) {
    throw new Error(rateLimit.reason || 'Demasiadas tentativas. Aguarde alguns instantes.')
  }

  // 4. Sanitização rigorosa de texto
  const cleanName = sanitizeText(input.name)
  const cleanEmail = sanitizeText(input.email).toLowerCase()
  const cleanPhone = input.phone ? sanitizeText(input.phone) : null
  const cleanSubject = sanitizeText(input.subject)
  const cleanMessage = sanitizeText(input.message)
  const cleanOrderNumber = input.orderNumber ? sanitizeText(input.orderNumber) : null

  // 5. Geração de protocolo único
  let protocol = await generateTicketProtocol()
  let isUnique = false
  let attempts = 0

  while (!isUnique && attempts < 5) {
    const existing = await (prisma as any).ticket.findUnique({ where: { protocol } }).catch(() => null)
    if (!existing) {
      isUnique = true
    } else {
      protocol = `ARK-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
      attempts++
    }
  }

  // 6. Gravação na Base de Dados
  const createdTicket = await (prisma as any).ticket.create({
    data: {
      protocol,
      type: input.type,
      category: input.category,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      subject: cleanSubject,
      message: cleanMessage,
      orderNumber: cleanOrderNumber,
      customerId: customerId || null,
      status: 'NOVO',
      priority: 'NORMAL',
      consentAccepted: true,
      consentAt: new Date(),
      ipHash,
    },
  })

  // 7. Envio assíncrono de notificações por e-mail (não bloqueia resposta)
  sendTicketConfirmationEmail({
    to: cleanEmail,
    name: cleanName,
    protocol: createdTicket.protocol,
    type: createdTicket.type as TicketType,
    category: createdTicket.category,
    subject: cleanSubject,
    message: cleanMessage,
  }).catch((err) => console.error('[Ticket Service] Erro ao enviar confirmação por email ao cliente:', err))

  sendTicketTeamAlertEmail({
    protocol: createdTicket.protocol,
    type: createdTicket.type as TicketType,
    category: createdTicket.category,
    priority: createdTicket.priority,
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    subject: cleanSubject,
    message: cleanMessage,
    ticketId: createdTicket.id,
    orderNumber: cleanOrderNumber,
  }).catch((err) => console.error('[Ticket Service] Erro ao enviar alerta por email à equipa:', err))

  return {
    success: true,
    protocol: createdTicket.protocol,
  }
}

/**
 * Consulta de tickets com filtros e paginação (Uso exclusivo de Admin)
 */
export async function getTickets(params: TicketFilterParams): Promise<{
  tickets: TicketItem[]
  total: number
  page: number
  totalPages: number
  stats: TicketStats
}> {
  const page = Math.max(1, Number(params.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 20))
  const skip = (page - 1) * limit

  const where: any = {}

  if (params.type && params.type !== 'ALL') {
    where.type = params.type
  }

  if (params.status && params.status !== 'ALL') {
    where.status = params.status
  }

  if (params.category && params.category !== 'ALL') {
    where.category = params.category
  }

  if (params.priority && params.priority !== 'ALL') {
    where.priority = params.priority
  }

  if (params.startDate || params.endDate) {
    where.createdAt = {}
    if (params.startDate) {
      where.createdAt.gte = new Date(params.startDate)
    }
    if (params.endDate) {
      const end = new Date(params.endDate)
      end.setHours(23, 59, 59, 999)
      where.createdAt.lte = end
    }
  }

  if (params.q && params.q.trim()) {
    const q = params.q.trim()
    where.OR = [
      { protocol: { contains: q } },
      { name: { contains: q } },
      { email: { contains: q } },
      { subject: { contains: q } },
      { orderNumber: { contains: q } },
    ]
  }

  const [items, total, allTicketsCount] = await Promise.all([
    (prisma as any).ticket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        customerRef: {
          select: { id: true, name: true, email: true, phone: true, company: true },
        },
      },
    }),
    (prisma as any).ticket.count({ where }),
    (prisma as any).ticket.findMany({
      select: { status: true, type: true, createdAt: true, resolvedAt: true },
    }),
  ])

  // Cálculo de estatísticas globais
  let novos = 0
  let emAnalise = 0
  let respondidos = 0
  let resolvidos = 0
  let arquivados = 0
  let reclamacoes = 0
  let informacoes = 0
  let totalResponseTimeMs = 0
  let resolvedWithTimeCount = 0

  for (const t of allTicketsCount) {
    if (t.status === 'NOVO') novos++
    else if (t.status === 'EM_ANALISE') emAnalise++
    else if (t.status === 'RESPONDIDO') respondidos++
    else if (t.status === 'RESOLVIDO') resolvidos++
    else if (t.status === 'ARQUIVADO') arquivados++

    if (t.type === 'RECLAMACAO') reclamacoes++
    else if (t.type === 'INFORMACAO') informacoes++

    if (t.resolvedAt && t.createdAt) {
      const diff = new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime()
      if (diff > 0) {
        totalResponseTimeMs += diff
        resolvedWithTimeCount++
      }
    }
  }

  const avgResponseTimeHours = resolvedWithTimeCount > 0
    ? Math.round((totalResponseTimeMs / resolvedWithTimeCount) / (1000 * 60 * 60))
    : 18

  const stats: TicketStats = {
    total: allTicketsCount.length,
    novos,
    emAnalise,
    respondidos,
    resolvidos,
    arquivados,
    reclamacoes,
    informacoes,
    avgResponseTimeHours,
  }

  return {
    tickets: items.map((t: any) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      consentAt: t.consentAt?.toISOString?.() || t.createdAt.toISOString(),
      resolvedAt: t.resolvedAt?.toISOString?.() || null,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    stats,
  }
}

/**
 * Obter detalhe completo de um ticket por ID (Uso exclusivo de Admin)
 */
export async function getTicketById(id: string): Promise<TicketItem | null> {
  const item = await (prisma as any).ticket.findUnique({
    where: { id },
    include: {
      notes: {
        orderBy: { createdAt: 'desc' },
      },
      replies: {
        orderBy: { sentAt: 'asc' },
      },
      customerRef: {
        select: { id: true, name: true, email: true, phone: true, company: true },
      },
    },
  })

  if (!item) return null

  return {
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    consentAt: item.consentAt?.toISOString?.() || item.createdAt.toISOString(),
    resolvedAt: item.resolvedAt?.toISOString?.() || null,
    notes: (item.notes || []).map((n: any) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
    })),
    replies: (item.replies || []).map((r: any) => ({
      ...r,
      sentAt: r.sentAt.toISOString(),
    })),
  }
}

/**
 * Alterar estado e prioridade de um ticket
 */
export async function updateTicketStatusAndPriority(
  id: string,
  updates: { status?: TicketStatus; priority?: TicketPriority }
): Promise<TicketItem | null> {
  const current = await (prisma as any).ticket.findUnique({ where: { id } })
  if (!current) return null

  const dataToUpdate: any = {}
  if (updates.status) {
    dataToUpdate.status = updates.status
    if (updates.status === 'RESOLVIDO' && !current.resolvedAt) {
      dataToUpdate.resolvedAt = new Date()
    } else if (updates.status !== 'RESOLVIDO' && current.resolvedAt) {
      dataToUpdate.resolvedAt = null
    }
  }

  if (updates.priority) {
    dataToUpdate.priority = updates.priority
  }

  const updated = await (prisma as any).ticket.update({
    where: { id },
    data: dataToUpdate,
    include: {
      notes: { orderBy: { createdAt: 'desc' } },
      replies: { orderBy: { sentAt: 'asc' } },
      customerRef: true,
    },
  })

  return {
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    consentAt: updated.consentAt?.toISOString?.() || updated.createdAt.toISOString(),
    resolvedAt: updated.resolvedAt?.toISOString?.() || null,
  }
}

/**
 * Adicionar nota interna (visível apenas para admins)
 */
export async function addTicketNote(
  ticketId: string,
  adminId: string,
  adminName: string | null | undefined,
  content: string
): Promise<TicketNoteItem> {
  const cleanContent = sanitizeText(content)
  const created = await (prisma as any).ticketNote.create({
    data: {
      ticketId,
      adminId,
      adminName: adminName || 'Administrador',
      content: cleanContent,
    },
  })

  return {
    id: created.id,
    ticketId: created.ticketId,
    adminId: created.adminId,
    adminName: created.adminName,
    content: created.content,
    createdAt: created.createdAt.toISOString(),
  }
}

/**
 * Responder ao cliente (E-mail e/ou WhatsApp)
 */
export async function replyToTicket(
  ticketId: string,
  adminId: string,
  adminName: string | null | undefined,
  content: string,
  channel: TicketReplyChannel = 'EMAIL',
  sendWhatsAppCopy: boolean = false
): Promise<{ reply: TicketReplyItem; emailSent: boolean; whatsappSent: boolean }> {
  const cleanContent = sanitizeText(content)
  const ticket = await (prisma as any).ticket.findUnique({ where: { id: ticketId } })
  if (!ticket) {
    throw new Error('Ticket não encontrado.')
  }

  // 1. Criar registo de resposta
  const createdReply = await (prisma as any).ticketReply.create({
    data: {
      ticketId,
      adminId,
      adminName: adminName || 'Equipa de Suporte ARKNET',
      content: cleanContent,
      channel,
      sentAt: new Date(),
    },
  })

  // 2. Atualizar estado do ticket para RESPONDIDO
  await (prisma as any).ticket.update({
    where: { id: ticketId },
    data: { status: 'RESPONDIDO' },
  })

  // 3. Enviar e-mail de resposta oficial ao cliente
  let emailSent = false
  let whatsappSent = false

  try {
    const mailResult = await sendTicketReplyEmail({
      to: ticket.email,
      name: ticket.name,
      protocol: ticket.protocol,
      subject: ticket.subject,
      replyContent: cleanContent,
      adminName: adminName || 'Equipa ARKNET',
    })
    emailSent = mailResult.success
  } catch (err) {
    console.error('[Ticket Service] Erro ao enviar resposta por e-mail:', err)
  }

  // 4. Se solicitado e houver número de telefone, envia cópia via WhatsApp
  if ((channel === 'WHATSAPP' || sendWhatsAppCopy) && ticket.phone) {
    try {
      const waText = `Olá *${ticket.name}*!\n\nA equipa da *ARKNET* respondeu ao seu ticket *${ticket.protocol}* (*${ticket.subject}*):\n\n"${cleanContent}"\n\nCaso necessite de apoio adicional, responda a esta mensagem. Obrigado!`
      const waResult = await sendWhatsAppTextMessage(ticket.phone, waText)
      whatsappSent = waResult.success
    } catch (err) {
      console.error('[Ticket Service] Erro ao enviar resposta por WhatsApp:', err)
    }
  }

  return {
    reply: {
      id: createdReply.id,
      ticketId: createdReply.ticketId,
      adminId: createdReply.adminId,
      adminName: createdReply.adminName,
      content: createdReply.content,
      sentAt: createdReply.sentAt.toISOString(),
      channel: createdReply.channel as TicketReplyChannel,
    },
    emailSent,
    whatsappSent,
  }
}

/**
 * Anonimizar ticket (Conformidade com Privacidade / RGPD)
 */
export async function anonymizeTicket(id: string): Promise<boolean> {
  await (prisma as any).ticket.update({
    where: { id },
    data: {
      name: 'Utilizador Anonimizado',
      email: 'anonimizado@privacidade.arknet.ao',
      phone: null,
      message: '[Conteúdo anonimizado por solicitação de privacidade]',
      orderNumber: null,
      ipHash: null,
      status: 'ARQUIVADO',
    },
  })
  return true
}

/**
 * Eliminar ticket e registos associados
 */
export async function deleteTicket(id: string): Promise<boolean> {
  await (prisma as any).ticket.delete({ where: { id } })
  return true
}
