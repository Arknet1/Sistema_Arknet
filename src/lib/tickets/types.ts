export type TicketType = 'RECLAMACAO' | 'INFORMACAO'

export type TicketCategory =
  | 'PRODUTO'
  | 'ENTREGA'
  | 'PAGAMENTO'
  | 'ATENDIMENTO'
  | 'SERVICO_TECNICO'
  | 'OUTRO'

export type TicketStatus =
  | 'NOVO'
  | 'EM_ANALISE'
  | 'RESPONDIDO'
  | 'RESOLVIDO'
  | 'ARQUIVADO'

export type TicketPriority = 'BAIXA' | 'NORMAL' | 'ALTA'

export type TicketReplyChannel = 'EMAIL' | 'WHATSAPP'

export interface TicketNoteItem {
  id: string
  ticketId: string
  adminId: string
  adminName?: string | null
  content: string
  createdAt: string
}

export interface TicketReplyItem {
  id: string
  ticketId: string
  adminId: string
  adminName?: string | null
  content: string
  sentAt: string
  channel: TicketReplyChannel
}

export interface TicketItem {
  id: string
  protocol: string
  type: TicketType
  category: TicketCategory
  name: string
  email: string
  phone?: string | null
  subject: string
  message: string
  orderNumber?: string | null
  customerId?: string | null
  status: TicketStatus
  priority: TicketPriority
  consentAccepted: boolean
  consentAt: string
  ipHash?: string | null
  createdAt: string
  updatedAt: string
  resolvedAt?: string | null
  notes?: TicketNoteItem[]
  replies?: TicketReplyItem[]
  customerRef?: {
    id: string
    name: string
    email: string
    phone?: string
    company?: string | null
  } | null
}

export interface TicketFilterParams {
  type?: string
  status?: string
  category?: string
  priority?: string
  q?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface TicketStats {
  total: number
  novos: number
  emAnalise: number
  respondidos: number
  resolvidos: number
  arquivados: number
  reclamacoes: number
  informacoes: number
  avgResponseTimeHours: number
}

export const TICKET_TYPE_CONFIG: Record<
  TicketType,
  { label: string; description: string; badgeColor: string; bgSoft: string; textColor: string; borderColor: string }
> = {
  RECLAMACAO: {
    label: 'Reclamação',
    description: 'Reportar anomalia, insatisfação ou problema de serviço',
    badgeColor: 'bg-rose-600 text-white',
    bgSoft: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
  },
  INFORMACAO: {
    label: 'Pedido de Informação',
    description: 'Dúvidas gerais, esclarecimentos técnicos ou orçamentos',
    badgeColor: 'bg-primary text-white',
    bgSoft: 'bg-blue-50',
    textColor: 'text-primary',
    borderColor: 'border-blue-200',
  },
}

export const TICKET_CATEGORY_CONFIG: Record<
  TicketCategory,
  { label: string; icon: string; description: string }
> = {
  PRODUTO: {
    label: 'Produto / Equipamento',
    icon: 'Package',
    description: 'Dúvidas, defeito ou avaria de equipamento',
  },
  ENTREGA: {
    label: 'Prazos & Envio',
    icon: 'Truck',
    description: 'Estado da entrega, estafeta ou atrasos',
  },
  PAGAMENTO: {
    label: 'Faturação & Pagamento',
    icon: 'CreditCard',
    description: 'Multicaixa Express, faturas proforma ou recibos',
  },
  ATENDIMENTO: {
    label: 'Atendimento Comercial',
    icon: 'Users',
    description: 'Qualidade do suporte, resposta ou postura comercial',
  },
  SERVICO_TECNICO: {
    label: 'Suporte & Assistência Técnica',
    icon: 'Wrench',
    description: 'Instalação de redes, servidores, fibra ou reparação',
  },
  OUTRO: {
    label: 'Outro Assunto',
    icon: 'HelpCircle',
    description: 'Assuntos gerais não categorizados acima',
  },
}

export const TICKET_STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; badgeColor: string; bgSoft: string; textColor: string; borderColor: string; dotColor: string }
> = {
  NOVO: {
    label: 'Novo / Pendente',
    badgeColor: 'bg-amber-500 text-white animate-pulse',
    bgSoft: 'bg-amber-50',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-300',
    dotColor: 'bg-amber-500',
  },
  EM_ANALISE: {
    label: 'Em Análise',
    badgeColor: 'bg-blue-600 text-white',
    bgSoft: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
    dotColor: 'bg-blue-500',
  },
  RESPONDIDO: {
    label: 'Respondido',
    badgeColor: 'bg-purple-600 text-white',
    bgSoft: 'bg-purple-50',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-300',
    dotColor: 'bg-purple-500',
  },
  RESOLVIDO: {
    label: 'Resolvido',
    badgeColor: 'bg-emerald-600 text-white',
    bgSoft: 'bg-emerald-50',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-300',
    dotColor: 'bg-emerald-500',
  },
  ARQUIVADO: {
    label: 'Arquivado',
    badgeColor: 'bg-slate-600 text-white',
    bgSoft: 'bg-slate-100',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-300',
    dotColor: 'bg-slate-400',
  },
}

export const TICKET_PRIORITY_CONFIG: Record<
  TicketPriority,
  { label: string; badgeColor: string; bgSoft: string; textColor: string; borderColor: string }
> = {
  ALTA: {
    label: 'Alta',
    badgeColor: 'bg-rose-600 text-white',
    bgSoft: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-300',
  },
  NORMAL: {
    label: 'Normal',
    badgeColor: 'bg-slate-700 text-white',
    bgSoft: 'bg-slate-100',
    textColor: 'text-slate-800',
    borderColor: 'border-slate-200',
  },
  BAIXA: {
    label: 'Baixa',
    badgeColor: 'bg-slate-400 text-white',
    bgSoft: 'bg-slate-50',
    textColor: 'text-slate-600',
    borderColor: 'border-slate-200',
  },
}
