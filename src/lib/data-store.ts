/**
 * ARKNET Central Data Store & Persistence Layer
 * Centraliza o estado de toda a aplicação (Loja, Leads, Newsletter, Academia, Eventos, Carreiras, etc.)
 * Suporta persistência em LocalStorage, sincronização em tempo real entre abas e operações CRUD tipadas.
 */

import { mockProducts, mockCategories, mockContactInfo, mockServices, mockTrainingCourses, mockEventsInfo, mockCareersInfo, mockTestimonials, mockPartners, mockSocialProfiles, mockWhyChooseUs } from './mock-data'
import { hashPasswordSync } from './security-utils'

// ==========================================
// 1. TIPOS DE DADOS
// ==========================================

export type UserRole = 'admin' | 'editor'

export interface AdminUser {
  id: string
  name: string
  email: string
  password?: string
  passwordHash?: string // Simulado
  role: UserRole
  avatar?: string
  status: 'active' | 'inactive'
  createdAt: string
  lastLogin?: string
}

export interface StoreProduct {
  id: string
  name: string
  description: string
  category: string
  price: number | null // null = Sob consulta
  image: string
  inStock: boolean
  featured?: boolean
  sku?: string
  createdAt: string
  updatedAt: string
}

export interface ProductCategory {
  id: string
  name: string
  icon: string
  description?: string
  order: number
  hideWhenEmpty?: boolean
}

export type OrderStatus = 'novo' | 'em_contacto' | 'fechado' | 'cancelado'

export type WhatsAppBotStatus =
  | 'bot_active'
  | 'waiting_receipt'
  | 'receipt_received'
  | 'needs_human'
  | 'confirmed'

export type WhatsAppMessageSender = 'bot' | 'customer' | 'agent'

export interface WhatsAppMessageMedia {
  url: string
  type: 'image' | 'document' | 'audio' | 'video'
  filename?: string
  mimeType?: string
  fileSize?: number
}

export interface WhatsAppChatMessage {
  id: string
  sender: WhatsAppMessageSender
  senderName?: string
  text: string
  media?: WhatsAppMessageMedia
  timestamp: string
  status?: 'sent' | 'delivered' | 'read'
}

export interface StoreOrderItem {
  productId: string
  productName: string
  price: number | null
  quantity: number
  image?: string
}

export interface StoreOrder {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerCompany?: string
  customerNif?: string
  customerCity?: string
  customerAddress?: string
  deliveryMethod?: string
  paymentMethod?: string
  items: StoreOrderItem[]
  total: number | null
  status: OrderStatus
  notes?: string
  whatsappPhone?: string
  botStatus?: WhatsAppBotStatus
  receiptUrl?: string
  receiptFilename?: string
  receiptReceivedAt?: string
  conversationHistory?: WhatsAppChatMessage[]
  confirmedAt?: string
  createdAt: string
  updatedAt: string
}

export type LeadStatus = 'novo' | 'contactado' | 'convertido' | 'arquivado'

export interface ServiceLead {
  id: string
  name: string
  email: string
  phone: string
  service: string
  message: string
  status: LeadStatus
  notes?: string
  source?: string
  createdAt: string
  updatedAt: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  status: 'active' | 'inactive'
  subscribedAt: string
}

export interface CourseItem {
  id: string
  title: string
  description: string
  category?: string
  modality: 'Presencial' | 'Online' | 'Híbrida' | 'Workshop' | 'Corporativa'
  duration: string // ex: '30 dias', '40 horas'
  icon?: string
  image?: string
  syllabus?: string[]
  status: 'active' | 'inactive'
  featured?: boolean
  createdAt: string
  updatedAt: string
}

export type EventStatus = 'agendado' | 'decorrer' | 'passado' | 'cancelado'

export interface EventItem {
  id: string
  title: string
  description: string
  date: string // ISO ou data formatada
  time?: string
  location: string
  format: 'Presencial' | 'Online' | 'Híbrido'
  image?: string
  status: EventStatus
  capacity?: number
  link?: string
  createdAt: string
  updatedAt: string
}

export interface JobPosition {
  id: string
  title: string
  department: string
  location: string
  type: 'Full-time' | 'Part-time' | 'Estágio' | 'Remoto'
  description: string
  requirements: string[]
  benefits?: string[]
  status: 'aberta' | 'fechada' | 'pausada'
  createdAt: string
  updatedAt: string
}

export type ApplicationStatus = 'recebida' | 'em_analise' | 'entrevista' | 'aceite' | 'rejeitada'

export interface JobApplication {
  id: string
  jobId?: string // ou null se espontânea
  jobTitle: string
  candidateName: string
  candidateEmail: string
  candidatePhone: string
  message?: string
  cvFileName?: string
  cvUrl?: string
  status: ApplicationStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface TestimonialItem {
  id: string
  clientName: string
  company: string
  role?: string
  testimonial: string
  rating: number // 1 a 5
  logo?: string
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface PartnerItem {
  id: string
  name: string
  logo: string
  category?: string
  website?: string
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface ProjectPartnerRef {
  partnerId: string
  partnerName: string
  partnerLogo?: string
  partnerWebsite?: string
  role?: string // ex: "Fornecimento de Equipamentos", "Consultoria Técnica Conjunta", "Integração de Software"
}

export interface ProjectResultHighlight {
  label: string // ex: "Postos Certificados", "SLA Garantido", "Redução de Latência"
  value: string // ex: "+350", "99.99%", "-45%"
}

export interface ProjectItem {
  id: string
  title: string
  slug: string
  clientName: string
  category: string // 'Internet Empresarial' | 'Cibersegurança' | 'Computação em Nuvem' | 'CFTV e Segurança' | 'Cabeamento Estruturado' | 'Consultoria & TI'
  partnershipType: string // 'Projeto para Cliente' | 'Colaboração Técnica' | 'Patrocínio' | 'Evento Conjunto' | 'Fornecimento de Equipamento'
  status: 'concluido' | 'em_curso'
  tagline: string
  description: string
  challenge?: string
  solution?: string
  image: string
  gallery?: string[]
  partners?: ProjectPartnerRef[]
  results?: ProjectResultHighlight[]
  featured?: boolean
  completedAt?: string
  readTime?: string
  newsCategory?: string
  quote?: {
    text: string
    author: string
    role: string
  }
  createdAt: string
  updatedAt: string
}

export interface CompanySettings {
  id: string
  companyName: string
  tagline: string
  phones: string[]
  emails: string[]
  address: string
  city: string
  country: string
  zipCode?: string
  whatsappChannelUrl: string
  whatsappNumber: string
  socialLinks: {
    facebook?: string
    linkedin?: string
    instagram?: string
    twitter?: string
    youtube?: string
    github?: string
  }
  institutionalText: string
  presentationLetter: string
  updatedAt: string
}

export interface ActivityLog {
  id: string
  userId: string
  userName: string
  action: string // ex: 'Criou produto "Cabo de Rede"', 'Alterou estado do lead #12'
  module: string // 'produtos' | 'leads' | 'newsletter' | 'pedidos' | 'academia' | etc.
  timestamp: string
}

export interface CustomerAccount {
  id: string
  name: string
  email: string
  password?: string
  passwordHash?: string
  phone: string
  company?: string
  nif?: string
  address?: string
  city?: string
  avatar?: string
  status: 'active' | 'inactive' | 'pending'
  notes?: string
  createdAt: string
  lastLogin?: string
  updatedAt?: string
}

export interface ArknetDatabase {
  users: AdminUser[]
  customers: CustomerAccount[]
  products: StoreProduct[]
  categories: ProductCategory[]
  orders: StoreOrder[]
  leads: ServiceLead[]
  subscribers: NewsletterSubscriber[]
  courses: CourseItem[]
  events: EventItem[]
  jobs: JobPosition[]
  applications: JobApplication[]
  testimonials: TestimonialItem[]
  partners: PartnerItem[]
  projects: ProjectItem[]
  settings: CompanySettings
  activities: ActivityLog[]
  version: number
}

// ==========================================
// 2. SEED INICIAL (DADOS INICIAIS DA ARKNET)
// ==========================================

const DEFAULT_USERS: AdminUser[] = [
  {
    id: 'user-admin',
    name: 'Administrador ARKNET',
    email: 'admin@arknet.co.ao',
    password: 'Admin123!',
    passwordHash: hashPasswordSync('Admin123!'),
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'user-editor',
    name: 'Editor de Conteúdo',
    email: 'editor@arknet.co.ao',
    password: 'Admin123!',
    passwordHash: hashPasswordSync('Admin123!'),
    role: 'editor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-01-10T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
]

const DEFAULT_CUSTOMERS: CustomerAccount[] = [
  {
    id: 'cli-1',
    name: 'Eng. Manuel Domingos',
    email: 'manuel.domingos@petroangola.ao',
    password: 'Password123!',
    phone: '+244 923 456 789',
    company: 'PetroAngola E.P.',
    nif: '5412987654',
    address: 'Rua Principal de Talatona, Edifício Kilamba, 4º Andar',
    city: 'Luanda',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    notes: 'Cliente corporativo VIP de telecomunicações e links dedicados.',
    createdAt: '2026-01-15T10:00:00Z',
    lastLogin: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
  },
  {
    id: 'cli-2',
    name: 'Dra. Teresa Van-Dúnem',
    email: 'teresa.vdunem@bancocomerce.co.ao',
    password: 'Password123!',
    phone: '+244 912 345 678',
    company: 'Banco Comercial Angolano',
    nif: '5401876543',
    address: 'Avenida 4 de Fevereiro, Marginal de Luanda',
    city: 'Luanda',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    notes: 'Contrato ativo de segurança cibernética e consultoria.',
    createdAt: '2026-01-20T14:30:00Z',
    lastLogin: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
  },
  {
    id: 'cli-3',
    name: 'Carlos Alberto Ferreira',
    email: 'carlos.ferreira@gmail.com',
    password: 'Password123!',
    phone: '+244 933 112 233',
    company: 'Independente / Particular',
    nif: '006789123LA042',
    address: 'Condomínio Vila Flor, Casa 12',
    city: 'Luanda',
    status: 'active',
    notes: 'Cliente de equipamentos da loja online.',
    createdAt: '2026-02-01T09:15:00Z',
    lastLogin: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
  },
]

const DEFAULT_CATEGORIES: ProductCategory[] = mockCategories.map((c, i) => ({
  id: `cat-${i + 1}`,
  name: c.name,
  icon: c.icon,
  order: i + 1,
  hideWhenEmpty: false,
}))

const DEFAULT_PRODUCTS: StoreProduct[] = mockProducts.map((p, i) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  category: p.category,
  price: p.price,
  image: p.image,
  inStock: p.inStock,
  featured: i < 6,
  sku: `ARK-${String(i + 1).padStart(4, '0')}`,
  createdAt: '2026-01-15T00:00:00Z',
  updatedAt: '2026-01-15T00:00:00Z',
}))

const DEFAULT_LEADS: ServiceLead[] = [
  {
    id: 'lead-1',
    name: 'Eng. Manuel Domingos',
    email: 'manuel.domingos@petroangola.ao',
    phone: '+244 923 456 789',
    service: 'Internet Empresarial',
    message: 'Precisamos de uma ligação dedicada simétrica de 100Mbps com redundância para os nossos escritórios em Talatona.',
    status: 'novo',
    notes: 'Prioridade alta. Cliente corporativo do sector petrolífero.',
    source: 'Website - Formulário de Cotação',
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
  },
  {
    id: 'lead-2',
    name: 'Dra. Teresa Van-Dúnem',
    email: 'teresa.vdunem@bancocomerce.co.ao',
    phone: '+244 912 345 678',
    service: 'Cibersegurança',
    message: 'Solicitamos auditoria de pentest e reforço de segurança perimetral para 3 agências bancárias.',
    status: 'contactado',
    notes: 'Reunião preliminar agendada para sexta-feira às 10h.',
    source: 'Website - Formulário de Cotação',
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
  },
  {
    id: 'lead-3',
    name: 'Carlos Alberto Ferreira',
    email: 'carlos.ferreira@logistica-sul.ao',
    phone: '+244 934 567 890',
    service: 'CFTV e Segurança',
    message: 'Orçamento para sistema de vigilância IP com 32 câmaras e gravação em nuvem para centro de distribuição.',
    status: 'convertido',
    notes: 'Proposta adjudicada. Projecto em fase de planeamento e instalação.',
    source: 'Website - Formulário de Cotação',
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
  },
  {
    id: 'lead-4',
    name: 'Joaquim Silva Santos',
    email: 'jsilva@construtora-luanda.com',
    phone: '+244 945 678 901',
    service: 'Cabeamento Estruturado',
    message: 'Instalação de rede Cat6A para edifício comercial de 4 pisos em Luanda Sul.',
    status: 'novo',
    notes: '',
    source: 'Website - Formulário de Cotação',
    createdAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
  },
]

const DEFAULT_ORDERS: StoreOrder[] = [
  {
    id: 'order-1',
    orderNumber: 'PED-2026-0042',
    customerName: 'Afonso Mário Ribeiro',
    customerEmail: 'afonso.mario@empresa.ao',
    customerPhone: '+244 923 111 222',
    whatsappPhone: '244923111222',
    customerAddress: 'Av. 4 de Fevereiro, Luanda',
    items: [
      {
        productId: DEFAULT_PRODUCTS[0]?.id || 'p-1',
        productName: DEFAULT_PRODUCTS[0]?.name || 'Equipamento de Rede',
        price: DEFAULT_PRODUCTS[0]?.price ?? 45000,
        quantity: 2,
        image: DEFAULT_PRODUCTS[0]?.image,
      },
      {
        productId: DEFAULT_PRODUCTS[1]?.id || 'p-2',
        productName: DEFAULT_PRODUCTS[1]?.name || 'Switch Gigabit',
        price: DEFAULT_PRODUCTS[1]?.price ?? 120000,
        quantity: 1,
        image: DEFAULT_PRODUCTS[1]?.image,
      },
    ],
    total: 210000,
    status: 'em_contacto',
    botStatus: 'receipt_received',
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    receiptFilename: 'comprovativo_mcx_afonso.jpg',
    receiptReceivedAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
    notes: 'Comprovativo de Multicaixa Express recebido via bot. Aguarda confirmação de 1 clique.',
    conversationHistory: [
      {
        id: 'msg-1',
        sender: 'customer',
        senderName: 'Afonso Mário',
        text: 'Olá ARKNET! Acabei de registar o pedido *PED-2026-0042* no valor de *210.000,00 Kz* na loja online.',
        timestamp: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      },
      {
        id: 'msg-2',
        sender: 'bot',
        senderName: 'ARKNET Bot',
        text: 'Olá Afonso Mário Ribeiro! 👋 Recebemos o seu pedido *#PED-2026-0042* no valor total de *210.000,00 Kz*.\n\n📦 *Resumo da Encomenda:*\n• 2x Equipamento de Rede\n• 1x Switch Gigabit\n\n🔹 *Opções de Pagamento:*\n• *Multicaixa Express:* 935 208 449\n• *BAI:* AO06 0040 0000 1234 5678 9012 3\n• *Titular:* ARKNET TECNOLOGIA LDA\n\n📎 Por favor, envie a foto ou PDF do comprovativo aqui nesta conversa para validação.',
        timestamp: new Date(Date.now() - 3600 * 1000 * 2 + 1000).toISOString(),
      },
      {
        id: 'msg-3',
        sender: 'customer',
        senderName: 'Afonso Mário',
        text: 'Segue o comprovativo da transferência via Multicaixa Express.',
        media: {
          url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
          type: 'image',
          filename: 'comprovativo_mcx_afonso.jpg',
        },
        timestamp: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
      },
      {
        id: 'msg-4',
        sender: 'bot',
        senderName: 'ARKNET Bot',
        text: '✅ *Comprovativo recebido com sucesso!*\n\nO seu documento foi encaminhado para a fila de validação da nossa equipa financeira. Assim que conferido, enviaremos a confirmação oficial por aqui.',
        timestamp: new Date(Date.now() - 3600 * 1000 * 1 + 2000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
  },
  {
    id: 'order-2',
    orderNumber: 'PED-2026-0041',
    customerName: 'Beatriz Costa',
    customerEmail: 'beatriz.costa@techhub.ao',
    customerPhone: '+244 917 888 999',
    whatsappPhone: '244917888999',
    customerAddress: 'Vila Alice, Luanda',
    items: [
      {
        productId: DEFAULT_PRODUCTS[2]?.id || 'p-3',
        productName: DEFAULT_PRODUCTS[2]?.name || 'Roteador Wi-Fi 6',
        price: DEFAULT_PRODUCTS[2]?.price ?? 85000,
        quantity: 1,
        image: DEFAULT_PRODUCTS[2]?.image,
      },
    ],
    total: 85000,
    status: 'fechado',
    botStatus: 'confirmed',
    notes: 'Pagamento confirmado e fatura emitida via WhatsApp.',
    confirmedAt: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
    conversationHistory: [
      {
        id: 'msg-201',
        sender: 'customer',
        senderName: 'Beatriz Costa',
        text: 'Olá ARKNET! Pedido #PED-2026-0041',
        timestamp: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
      },
      {
        id: 'msg-202',
        sender: 'bot',
        senderName: 'ARKNET Bot',
        text: 'Olá Beatriz Costa! 👋 Recebemos o seu pedido *#PED-2026-0041* no valor de *85.000,00 Kz*.',
        timestamp: new Date(Date.now() - 3600 * 1000 * 12 + 1000).toISOString(),
      },
      {
        id: 'msg-203',
        sender: 'bot',
        senderName: 'ARKNET Bot',
        text: '🎉 *Pagamento Confirmado!*\n\nO seu pedido *#PED-2026-0041* foi aprovado com sucesso. Prazo de entrega: 24h a 48h úteis. A fatura oficial está disponível no seu Perfil de Cliente. Obrigado!',
        timestamp: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 3600 * 1000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
  },
  {
    id: 'order-3',
    orderNumber: 'PED-2026-0040',
    customerName: 'Dr. Valdemar Pascoal',
    customerEmail: 'v.pascoal@clinicasaude.co.ao',
    customerPhone: '+244 944 555 666',
    whatsappPhone: '244944555666',
    customerAddress: 'Talatona, Luanda',
    items: [
      {
        productId: DEFAULT_PRODUCTS[0]?.id || 'p-1',
        productName: DEFAULT_PRODUCTS[0]?.name || 'Equipamento de Rede',
        price: DEFAULT_PRODUCTS[0]?.price ?? 45000,
        quantity: 3,
        image: DEFAULT_PRODUCTS[0]?.image,
      },
    ],
    total: 135000,
    status: 'em_contacto',
    botStatus: 'needs_human',
    notes: 'Cliente perguntou se há desconto para faturamento a 30 dias. Requer atendimento humano.',
    conversationHistory: [
      {
        id: 'msg-301',
        sender: 'customer',
        senderName: 'Dr. Valdemar Pascoal',
        text: 'Boa tarde, consigo emitir fatura proforma para pagar a 30 dias com desconto institucional para a clínica?',
        timestamp: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
      },
      {
        id: 'msg-302',
        sender: 'bot',
        senderName: 'ARKNET Bot',
        text: 'Obrigado pela sua mensagem. 👨‍💼 Transferi o seu atendimento para um consultor comercial da nossa equipa, que responderá em breve por esta conversa.',
        timestamp: new Date(Date.now() - 3600 * 1000 * 3 + 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 3600 * 1000 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
  },
]

const DEFAULT_SUBSCRIBERS: NewsletterSubscriber[] = [
  { id: 'sub-1', email: 'director.ti@sonangol.co.ao', status: 'active', subscribedAt: '2026-01-10T11:20:00Z' },
  { id: 'sub-2', email: 'geral@infrasul.ao', status: 'active', subscribedAt: '2026-01-14T09:45:00Z' },
  { id: 'sub-3', email: 'compras@hospitalcentral.ao', status: 'active', subscribedAt: '2026-01-20T16:15:00Z' },
  { id: 'sub-4', email: 'redes@universidade-luanda.ao', status: 'active', subscribedAt: '2026-02-02T14:30:00Z' },
  { id: 'sub-5', email: 'inovacao@startuangola.com', status: 'active', subscribedAt: '2026-02-18T10:00:00Z' },
]

const DEFAULT_COURSES: CourseItem[] = mockTrainingCourses.map((c, i) => ({
  id: c.id,
  title: c.title,
  description: c.description,
  modality: (i % 2 === 0 ? 'Presencial' : 'Online') as CourseItem['modality'],
  duration: i % 2 === 0 ? '30 dias (60h)' : '4 semanas (40h)',
  icon: c.icon,
  syllabus: [
    'Fundamentos e Arquitetura Teórica',
    'Configuração Prática em Laboratório',
    'Segurança e Boas Práticas',
    'Projeto Final Integrador e Certificação',
  ],
  status: 'active',
  featured: i < 3,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}))

const DEFAULT_EVENTS: EventItem[] = [
  {
    id: 'evt-1',
    title: 'Arknet Tech Summit 2026 — Transformação Digital em Angola',
    description: 'Encontro anual de líderes de telecomunicações, cibersegurança e infraestruturas para debater o futuro da conectividade nacional.',
    date: '2026-09-18',
    time: '09:00 - 17:00',
    location: 'Hotel Epic Sana, Luanda',
    format: 'Presencial',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80',
    status: 'agendado',
    capacity: 250,
    link: '#inscricao-evento',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'evt-2',
    title: 'Workshop Prático: Defesa Perimetral e Resposta a Incidentes',
    description: 'Sessão técnica imersiva para administradores de sistemas e analistas de segurança com laboratórios reais de mitigação de ataques.',
    date: '2026-10-05',
    time: '14:00 - 18:00',
    location: 'Academia ARKNET, Luanda',
    format: 'Híbrido',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
    status: 'agendado',
    capacity: 40,
    link: '#inscricao-evento',
    createdAt: '2026-02-05T00:00:00Z',
    updatedAt: '2026-02-05T00:00:00Z',
  },
]

const DEFAULT_JOBS: JobPosition[] = [
  {
    id: 'job-1',
    title: 'Engenheiro de Redes & Telecomunicações Sénior',
    department: 'Engenharia & Infraestruturas',
    location: 'Luanda, Angola',
    type: 'Full-time',
    description: 'Buscamos engenheiro experiente para liderar projetos de implementação de backbones de fibra, roteamento BGP/OSPF e infraestruturas core para clientes corporativos.',
    requirements: [
      'Licenciatura em Engenharia de Telecomunicações, Informática ou áreas afins',
      'Certificação Cisco CCNP ou Huawei HCIP (obrigatório)',
      'Mínimo de 4 anos de experiência em redes corporativas',
      'Domínio de protocolos de roteamento, switching e firewalls Fortinet/Mikrotik',
    ],
    benefits: [
      'Salário altamente competitivo no mercado angolano',
      'Plano de saúde extensível ao agregado familiar',
      'Formações e certificações custeadas pela empresa',
      'Bónus de desempenho anual',
    ],
    status: 'aberta',
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'job-2',
    title: 'Especialista em Cibersegurança & SOC Analyst',
    department: 'Segurança da Informação',
    location: 'Luanda, Angola',
    type: 'Full-time',
    description: 'Profissional responsável por monitorização contínua de segurança, análise de vulnerabilidades, auditorias de segurança e resposta a incidentes.',
    requirements: [
      'Experiência comprovada em ferramentas SIEM e análise de tráfego de rede',
      'Conhecimento de frameworks de segurança (ISO 27001, NIST, CIS)',
      'Certificações como CompTIA Security+, CEH ou similares serão valorizadas',
      'Capacidade de elaboração de relatórios técnicos e executivos',
    ],
    benefits: [
      'Ambiente de trabalho moderno com equipamentos de topo',
      'Seguro de saúde',
      'Acesso livre a cursos da Academia ARKNET',
    ],
    status: 'aberta',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'job-3',
    title: 'Técnico de Instalação de Redes e CFTV',
    department: 'Operações de Campo',
    location: 'Luanda, Angola',
    type: 'Full-time',
    description: 'Instalação de cabeamento estruturado Cat6/Cat6A, fusão de fibra óptica, montagem de bastidores e sistemas de vigilância IP.',
    requirements: [
      'Ensino Médio Técnico em Informática, Telecomunicações ou Eletrónica',
      'Experiência de campo em instalação e testes de infraestruturas',
      'Carta de condução válida',
    ],
    benefits: ['Subsídio de alimentação e transporte', 'Equipamento de proteção e ferramentas profissionais'],
    status: 'aberta',
    createdAt: '2026-02-10T00:00:00Z',
    updatedAt: '2026-02-10T00:00:00Z',
  },
]

const DEFAULT_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-1',
    jobId: 'job-1',
    jobTitle: 'Engenheiro de Redes & Telecomunicações Sénior',
    candidateName: 'Eduardo Ndala',
    candidateEmail: 'eduardo.ndala@gmail.com',
    candidatePhone: '+244 923 888 111',
    message: 'Tenho 6 anos de experiência em redes IP e certificação CCNP Enterprise ativa. Gostaria de integrar a equipa ARKNET.',
    cvFileName: 'CV_Eduardo_Ndala_2026.pdf',
    status: 'em_analise',
    notes: 'Perfil muito alinhado. Convidar para entrevista técnica.',
    createdAt: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
  },
  {
    id: 'app-2',
    jobTitle: 'Candidatura Espontânea — Gestão Comercial',
    candidateName: 'Mariana Kiala',
    candidateEmail: 'mariana.kiala@hotmail.com',
    candidatePhone: '+244 912 777 333',
    message: 'Experiência de 4 anos em prospeção e fecho de negócios B2B em soluções de TI.',
    cvFileName: 'Curriculo_Mariana_Kiala.pdf',
    status: 'recebida',
    notes: '',
    createdAt: new Date(Date.now() - 3600 * 1000 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 45).toISOString(),
  },
]

const DEFAULT_TESTIMONIALS: TestimonialItem[] = mockTestimonials.map((t, i) => ({
  id: t.id,
  clientName: t.clientName,
  company: t.clientName,
  role: t.type,
  testimonial: t.testimonial,
  rating: 5,
  logo: t.logo,
  order: i + 1,
  active: true,
  createdAt: t.createdAt,
  updatedAt: t.updatedAt,
}))

const PARTNER_CATEGORIES: Record<string, string> = {
  'AnyConnect': 'Tecnologia & Redes',
  'Tecnimed': 'Saúde & Equipamento Hospitalar',
  'Igreja Universal': 'Institucional & Mídia',
  'Macon': 'Transportes & Logística',
  'Tribunal Supremo': 'Governo & Justiça',
  'Mota-Engil': 'Construção & Engenharia',
  'Record TV Africa': 'Comunicação & Mídia',
  'ANPG': 'Petróleo, Gás & Energia',
  'Huambo Expresso': 'Transportes & Logística',
  'Vernon': 'Consultoria & Gestão',
  'Neptec': 'Soluções Tecnológicas',
  'Comando MGA': 'Defesa & Segurança',
  'Power House': 'Energia & Infraestruturas',
  'A Mundial Seguros': 'Banca & Seguros',
}

const DEFAULT_PARTNERS: PartnerItem[] = mockPartners.map((p, i) => ({
  id: p.id,
  name: p.name,
  logo: p.logo,
  category: PARTNER_CATEGORIES[p.name] || 'Parceiro Estratégico',
  website: 'https://arknet.co.ao',
  order: i + 1,
  active: true,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
}))

const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-1',
    title: 'Modernização de Rede & Data Center — Tribunal Supremo',
    slug: 'infraestrutura-rede-tribunal-supremo',
    clientName: 'Tribunal Supremo de Angola',
    category: 'Cabeamento Estruturado',
    partnershipType: 'Projeto para Cliente',
    status: 'concluido',
    tagline: 'Infraestrutura de rede estruturada Cat6A de alta densidade e interligação de salas de audiência.',
    description: 'Projeto de modernização integral da infraestrutura tecnológica do Tribunal Supremo em Luanda, contemplando a instalação de rede de dados de alta velocidade, reorganização dos bastidores principais e garantia de conectividade estável e cifrada para os sistemas judiciais.',
    challenge: 'O Tribunal operava com infraestrutura legada e frequentes oscilações de rede que afetavam o andamento das sessões e a consulta célere aos autos de processos judiciais de alta relevância.',
    solution: 'A ARKNET, em parceria com fornecedores de hardware e segurança, executou a reformulação total do cabeamento estruturado de 4 pisos, implantou switches gerenciáveis em stack com redundância de fibra e certificou cada ponto de rede sob rigorosas normas internacionais.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1520869562399-e772f312f722?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    ],
    partners: [
      { partnerId: 'partner-5', partnerName: 'Tribunal Supremo', role: 'Instituição Beneficiária / Cliente', partnerWebsite: 'https://arknet.co.ao' },
      { partnerId: 'partner-11', partnerName: 'Neptec', role: 'Fornecimento de Bastidores & Equipamentos de Rede', partnerWebsite: 'https://arknet.co.ao' },
      { partnerId: 'partner-13', partnerName: 'Power House', role: 'Sistemas de Energia Ininterrupta (UPS)', partnerWebsite: 'https://arknet.co.ao' },
    ],
    results: [
      { label: 'Pontos Certificados', value: '+350' },
      { label: 'Disponibilidade SLA', value: '99.99%' },
      { label: 'Velocidade Backbone', value: '10 Gbps' },
    ],
    featured: true,
    completedAt: '2025',
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z',
  },
  {
    id: 'proj-2',
    title: 'Cibersegurança e Proteção Perimetral — Mota-Engil',
    slug: 'ciberseguranca-mota-engil',
    clientName: 'Mota-Engil Angola',
    category: 'Cibersegurança',
    partnershipType: 'Colaboração Técnica',
    status: 'concluido',
    tagline: 'Implementação de Firewalls de Próxima Geração (NGFW), VPNs corporativas e monitorização 24/7.',
    description: 'Arquitetura e implementação de segurança perimetral para interligar os estaleiros de construção civil e a sede corporativa em Luanda com túneis cifrados, proteção anti-malware e políticas rigorosas de acesso.',
    challenge: 'Com dezenas de estaleiros remotos distribuídos por várias províncias de Angola, a empresa necessitava de blindar a comunicação entre estaleiros e servidores centrais contra ataques de ransomware e acessos indevidos.',
    solution: 'Implementação de cluster de firewalls UTM redundantes, autenticação multifator para colaboradores remotos e monitorização contínua com alertas automáticos de intrusão.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    ],
    partners: [
      { partnerId: 'partner-6', partnerName: 'Mota-Engil', role: 'Cliente Principal / Empreitada', partnerWebsite: 'https://arknet.co.ao' },
      { partnerId: 'partner-10', partnerName: 'Vernon', role: 'Consultoria de Políticas de Acesso e Auditoria', partnerWebsite: 'https://arknet.co.ao' },
    ],
    results: [
      { label: 'Estaleiros Interligados', value: '18' },
      { label: 'Ameaças Bloqueadas', value: '100%' },
      { label: 'Tempo de Resposta', value: '< 5 min' },
    ],
    featured: true,
    completedAt: '2025',
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'proj-3',
    title: 'Link Dedicado para Transmissão HD — Record TV Africa',
    slug: 'internet-dedicada-record-tv',
    clientName: 'Record TV Africa',
    category: 'Internet Empresarial',
    partnershipType: 'Projeto para Cliente',
    status: 'concluido',
    tagline: 'Internet 100% simétrica de ultra-baixa latência para transmissão de sinal televisivo e streaming.',
    description: 'Fornecimento e gestão de conectividade empresarial de alta capacidade com fibra óptica dedicada e redundância por rádio digital para suporte às emissões em direto e envio de ficheiros pesados de áudio e vídeo.',
    challenge: 'As transmissões ao vivo e a subida de conteúdos para satélite exigiam largura de banda garantida sem qualquer oscilação de jitter ou perda de pacotes em horários de pico.',
    solution: 'Desenho de topologia com anel de fibra óptica redundante, endereço IP estático dedicado e monitorização de tráfego 24 horas por dia com engenharia de suporte dedicada.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
    ],
    partners: [
      { partnerId: 'partner-7', partnerName: 'Record TV Africa', role: 'Emissora de Televisão / Cliente', partnerWebsite: 'https://arknet.co.ao' },
      { partnerId: 'partner-13', partnerName: 'Power House', role: 'Infraestrutura de Energia e Nobreaks', partnerWebsite: 'https://arknet.co.ao' },
    ],
    results: [
      { label: 'Largura de Banda', value: '500 Mbps' },
      { label: 'Disponibilidade Uptime', value: '99.98%' },
      { label: 'Perda de Pacotes', value: '0%' },
    ],
    featured: true,
    completedAt: '2026',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'proj-4',
    title: 'CFTV Inteligente & Vigilância — Estação Central Macon',
    slug: 'cftv-vigilancia-macon',
    clientName: 'Macon Transportes',
    category: 'CFTV e Segurança',
    partnershipType: 'Projeto para Cliente',
    status: 'concluido',
    tagline: 'Vigilância eletrónica de alta definição com mais de 120 câmaras IP e gravação centralizada.',
    description: 'Instalação de circuito fechado de televisão para monitorização de plataformas de embarque, bilheteiras, armazéns de encomendas e parque de viaturas no principal terminal rodoviário da Macon em Luanda.',
    challenge: 'Necessidade de controlar o fluxo diário de milhares de passageiros, prevenir perdas de bagagens e otimizar a segurança patrimonial e operacional em tempo real.',
    solution: 'Implementação de câmaras dome antivandalismo e câmaras PTZ de longo alcance com análise inteligente de vídeo, visão noturna e central de controlo operacional.',
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80',
    ],
    partners: [
      { partnerId: 'partner-4', partnerName: 'Macon', role: 'Operador Rodoviário / Cliente', partnerWebsite: 'https://arknet.co.ao' },
      { partnerId: 'partner-14', partnerName: 'A Mundial Seguros', role: 'Consultoria de Salvaguarda de Risco', partnerWebsite: 'https://arknet.co.ao' },
    ],
    results: [
      { label: 'Câmaras Instaladas', value: '128' },
      { label: 'Área Coberta', value: '25.000 m²' },
      { label: 'Redução de Ocorrências', value: '-65%' },
    ],
    featured: false,
    completedAt: '2025',
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'proj-5',
    title: 'Migração para Cloud e DRP — ANPG',
    slug: 'cloud-disaster-recovery-anpg',
    clientName: 'Agência Nacional de Petróleo, Gás e Biocombustíveis (ANPG)',
    category: 'Computação em Nuvem',
    partnershipType: 'Colaboração Técnica',
    status: 'em_curso',
    tagline: 'Arquitetura híbrida na nuvem com planos de Disaster Recovery (DRP) e replicação de dados.',
    description: 'Projeto estratégico de transição dos sistemas de dados geológicos e cadastros de concessões petrolíferas para ambiente cloud de alta disponibilidade com backups encriptados.',
    challenge: 'Garantir conformidade regulatória rigorosa do sector de hidrocarbonetos, preservando dados críticos de exploração com disponibilidade ininterrupta mesmo em caso de falhas físicas no centro de dados local.',
    solution: 'Implementação de infraestrutura híbrida com replicação síncrona de base de dados, encriptação AES-256 e testes periódicos automatizados de failover.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
    ],
    partners: [
      { partnerId: 'partner-8', partnerName: 'ANPG', role: 'Entidade Reguladora / Cliente', partnerWebsite: 'https://arknet.co.ao' },
      { partnerId: 'partner-11', partnerName: 'Neptec', role: 'Infraestrutura de Virtualização & Servidores', partnerWebsite: 'https://arknet.co.ao' },
    ],
    results: [
      { label: 'Dados Migrados', value: '+80 TB' },
      { label: 'RPO (Ponto Recuperação)', value: '< 15 seg' },
      { label: 'RTO (Tempo Retoma)', value: '< 10 min' },
    ],
    featured: true,
    completedAt: 'Em Curso',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'proj-6',
    title: 'Interligação de Agências & Bilhética — Huambo Expresso',
    slug: 'conectividade-huambo-expresso',
    clientName: 'Huambo Expresso',
    category: 'Consultoria & TI',
    partnershipType: 'Colaboração Técnica',
    status: 'em_curso',
    tagline: 'Rede WAN corporativa interligando agências de Luanda, Huambo e Benguela.',
    description: 'Interligação de agências de bilhética em tempo real através de VPNs multiponto e fornecimento de infraestrutura de conectividade de dados para telemetria de autocarros.',
    challenge: 'Agências isoladas com vendas offline que causavam duplicação de lugares vendidos e falta de visão centralizada de receitas em tempo real.',
    solution: 'Estruturação de rede SD-WAN com failover automático 4G e sincronização de bilhética em microssegundos.',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1520869562399-e772f312f722?w=800&auto=format&fit=crop&q=80',
    ],
    partners: [
      { partnerId: 'partner-9', partnerName: 'Huambo Expresso', role: 'Empresa de Transporte / Cliente', partnerWebsite: 'https://arknet.co.ao' },
      { partnerId: 'partner-10', partnerName: 'Vernon', role: 'Integração de Software de Bilhética', partnerWebsite: 'https://arknet.co.ao' },
    ],
    results: [
      { label: 'Agências Conectadas', value: '12' },
      { label: 'Duplicação de Vendas', value: '0%' },
      { label: 'Sincronização', value: 'Tempo Real' },
    ],
    featured: false,
    completedAt: 'Em Curso',
    createdAt: '2026-02-10T00:00:00Z',
    updatedAt: '2026-02-10T00:00:00Z',
  },
]

const DEFAULT_SETTINGS: CompanySettings = {
  id: 'settings-global',
  companyName: 'ARKNET — Soluções Tecnológicas & Telecomunicações',
  tagline: 'Transformando o Futuro Digital de Angola',
  phones: mockContactInfo.phones || ['+244 935 208 449'],
  emails: mockContactInfo.emails || ['info@arknet.co.ao', 'negocios@arknet.co.ao'],
  address: mockContactInfo.address || 'Rua Directa do Kero, Casa Nº32 R/C, Kilamba, Luanda',
  city: mockContactInfo.city || 'Luanda',
  country: mockContactInfo.country || 'Angola',
  zipCode: mockContactInfo.zipCode || '1000',
  whatsappChannelUrl: mockContactInfo.whatsappChannel?.url || 'https://whatsapp.com/channel/0029VbCsWdsLo4hhX7FJ2e0A',
  whatsappNumber: '+244935208449',
  socialLinks: {
    facebook: 'https://www.facebook.com/jmatostecnologias',
    linkedin: 'https://www.linkedin.com/jmatostecnologias',
    instagram: 'https://www.instagram.com/j.matostecnologias/',
  },
  institutionalText: 'A Arknet é uma empresa tecnológica focada em inovação, conectividade e transformação digital, preparada para responder às exigências do mercado moderno através de soluções inteligentes e integradas. Com uma visão voltada para o futuro, actuamos no desenvolvimento de infraestruturas tecnológicas, serviços digitais e capacitação profissional, contribuindo para o crescimento tecnológico de Angola e África.',
  presentationLetter: 'O nosso compromisso é transformar a realidade tecnológica das empresas em Angola, oferecendo soluções integradas que impulsionam o crescimento e a eficiência operacional.',
  updatedAt: new Date().toISOString(),
}

const DEFAULT_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-1',
    userId: 'user-admin',
    userName: 'Administrador ARKNET',
    action: 'Criou novo produto "Roteador Wi-Fi 6"',
    module: 'produtos',
    timestamp: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  },
  {
    id: 'act-2',
    userId: 'user-editor',
    userName: 'Editor de Conteúdo',
    action: 'Atualizou estado do lead "Dra. Teresa Van-Dúnem" para "Contactado"',
    module: 'leads',
    timestamp: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
  },
  {
    id: 'act-3',
    userId: 'user-admin',
    userName: 'Administrador ARKNET',
    action: 'Publicou vaga "Engenheiro de Redes & Telecomunicações Sénior"',
    module: 'carreiras',
    timestamp: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
  },
]

const INITIAL_DB: ArknetDatabase = {
  users: DEFAULT_USERS,
  customers: DEFAULT_CUSTOMERS,
  products: DEFAULT_PRODUCTS,
  categories: DEFAULT_CATEGORIES,
  orders: DEFAULT_ORDERS,
  leads: DEFAULT_LEADS,
  subscribers: DEFAULT_SUBSCRIBERS,
  courses: DEFAULT_COURSES,
  events: DEFAULT_EVENTS,
  jobs: DEFAULT_JOBS,
  applications: DEFAULT_APPLICATIONS,
  testimonials: DEFAULT_TESTIMONIALS,
  partners: DEFAULT_PARTNERS,
  projects: DEFAULT_PROJECTS,
  settings: DEFAULT_SETTINGS,
  activities: DEFAULT_ACTIVITIES,
  version: 1,
}

// ==========================================
// 3. GERENCIADOR DE ESTADO & PERSISTÊNCIA
// ==========================================

const STORAGE_KEY = 'arknet_database_v1'
const CHANNEL_NAME = 'arknet_db_sync_channel'

type Listener = (db: ArknetDatabase) => void

class DataStoreManager {
  private db: ArknetDatabase
  private listeners: Set<Listener> = new Set()
  private broadcastChannel: BroadcastChannel | null = null
  private isBrowser: boolean = typeof window !== 'undefined'

  constructor() {
    this.db = this.loadFromStorage()

    if (this.isBrowser) {
      try {
        if ('BroadcastChannel' in window) {
          this.broadcastChannel = new BroadcastChannel(CHANNEL_NAME)
          this.broadcastChannel.onmessage = (event) => {
            if (event.data?.type === 'DB_UPDATED') {
              this.db = this.loadFromStorage()
              this.notifyListeners()
            }
          }
        }

        window.addEventListener('storage', (e) => {
          if (e.key === STORAGE_KEY && e.newValue) {
            try {
              this.db = JSON.parse(e.newValue)
              this.notifyListeners()
            } catch (err) {
              console.error('Failed to parse updated storage DB', err)
            }
          }
        })
      } catch (err) {
        console.warn('Storage sync channel not supported', err)
      }
    }
  }

  private loadFromStorage(): ArknetDatabase {
    if (!this.isBrowser) return INITIAL_DB
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        this.saveToStorage(INITIAL_DB)
        return INITIAL_DB
      }
      const parsed = JSON.parse(raw) as ArknetDatabase
      return {
        ...INITIAL_DB,
        ...parsed,
        users: parsed.users?.length ? parsed.users : INITIAL_DB.users,
        customers: parsed.customers?.length ? parsed.customers : INITIAL_DB.customers,
        products: parsed.products?.length ? parsed.products : INITIAL_DB.products,
        categories: parsed.categories?.length ? parsed.categories : INITIAL_DB.categories,
        orders: parsed.orders || INITIAL_DB.orders,
        leads: parsed.leads || INITIAL_DB.leads,
        subscribers: parsed.subscribers || INITIAL_DB.subscribers,
        courses: parsed.courses?.length ? parsed.courses : INITIAL_DB.courses,
        events: parsed.events?.length ? parsed.events : INITIAL_DB.events,
        jobs: parsed.jobs?.length ? parsed.jobs : INITIAL_DB.jobs,
        applications: parsed.applications || INITIAL_DB.applications,
        testimonials: parsed.testimonials?.length ? parsed.testimonials : INITIAL_DB.testimonials,
        partners:
          parsed.partners?.length &&
          !parsed.partners.some((p: any) => p.logo?.includes('picsum.photos') || p.name === 'Angola Telecom' || p.name === 'Unitel Empresas')
            ? parsed.partners
            : INITIAL_DB.partners,
        projects: parsed.projects?.length ? parsed.projects : INITIAL_DB.projects,
        settings: parsed.settings || INITIAL_DB.settings,
        activities: parsed.activities || INITIAL_DB.activities,
      }
    } catch (err) {
      console.error('Failed to load DB from LocalStorage', err)
      return INITIAL_DB
    }
  }

  private saveToStorage(db: ArknetDatabase) {
    if (!this.isBrowser) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'DB_UPDATED', timestamp: Date.now() })
      }
    } catch (err) {
      console.error('Error saving DB to localStorage', err)
    }
  }

  private mutate(updater: (current: ArknetDatabase) => ArknetDatabase, logAction?: { user?: string; action: string; module: string }) {
    const updated = updater(this.db)
    if (logAction) {
      const newLog: ActivityLog = {
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: logAction.user || 'system',
        userName: logAction.user === 'user-editor' ? 'Editor' : 'Administrador',
        action: logAction.action,
        module: logAction.module,
        timestamp: new Date().toISOString(),
      }
      updated.activities = [newLog, ...(updated.activities || [])].slice(0, 50)
    }
    this.db = updated
    this.saveToStorage(updated)
    this.notifyListeners()
    return updated
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    listener(this.db)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l(this.db))
  }

  public getSnapshot(): ArknetDatabase {
    return this.db
  }

  // ==========================================
  // OPERAÇÕES: UTILIZADORES
  // ==========================================
  public getUsers(): AdminUser[] {
    return this.db.users
  }

  public addUser(user: Omit<AdminUser, 'id' | 'createdAt'>): AdminUser {
    const newUser: AdminUser = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    this.mutate(
      (db) => ({ ...db, users: [newUser, ...db.users] }),
      { action: `Criou novo utilizador "${newUser.name}" (${newUser.role})`, module: 'utilizadores' }
    )
    return newUser
  }

  public updateUser(id: string, updates: Partial<AdminUser>): AdminUser | null {
    let updatedItem: AdminUser | null = null
    this.mutate((db) => {
      const users = db.users.map((u) => {
        if (u.id === id) {
          updatedItem = { ...u, ...updates }
          return updatedItem
        }
        return u
      })
      return { ...db, users }
    }, { action: `Atualizou utilizador "${updates.name || id}"`, module: 'utilizadores' })
    return updatedItem
  }

  public deleteUser(id: string): boolean {
    const user = this.db.users.find((u) => u.id === id)
    if (!user) return false
    this.mutate(
      (db) => ({ ...db, users: db.users.filter((u) => u.id !== id) }),
      { action: `Eliminou utilizador "${user.name}"`, module: 'utilizadores' }
    )
    return true
  }

  // ==========================================
  // OPERAÇÕES: PRODUTOS & CATEGORIAS
  // ==========================================
  public getProducts(): StoreProduct[] {
    return this.db.products
  }

  public getProductById(id: string): StoreProduct | undefined {
    return this.db.products.find((p) => p.id === id)
  }

  public addProduct(product: Omit<StoreProduct, 'id' | 'createdAt' | 'updatedAt'>): StoreProduct {
    const newProduct: StoreProduct = {
      ...product,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.mutate(
      (db) => ({ ...db, products: [newProduct, ...db.products] }),
      { action: `Adicionou produto "${newProduct.name}"`, module: 'produtos' }
    )
    return newProduct
  }

  public updateProduct(id: string, updates: Partial<StoreProduct>): StoreProduct | null {
    let updatedItem: StoreProduct | null = null
    this.mutate((db) => {
      const products = db.products.map((p) => {
        if (p.id === id) {
          updatedItem = { ...p, ...updates, updatedAt: new Date().toISOString() }
          return updatedItem
        }
        return p
      })
      return { ...db, products }
    }, { action: `Atualizou produto "${updates.name || id}"`, module: 'produtos' })
    return updatedItem
  }

  public deleteProduct(id: string): boolean {
    const product = this.db.products.find((p) => p.id === id)
    if (!product) return false
    this.mutate(
      (db) => ({ ...db, products: db.products.filter((p) => p.id !== id) }),
      { action: `Eliminou produto "${product.name}"`, module: 'produtos' }
    )
    return true
  }

  public getCategories(): ProductCategory[] {
    return this.db.categories
  }

  public addCategory(category: Omit<ProductCategory, 'id'>): ProductCategory {
    const newCat: ProductCategory = {
      ...category,
      id: `cat-${Date.now()}`,
    }
    this.mutate(
      (db) => ({ ...db, categories: [...db.categories, newCat] }),
      { action: `Adicionou categoria "${newCat.name}"`, module: 'categorias' }
    )
    return newCat
  }

  public updateCategory(id: string, updates: Partial<ProductCategory>): ProductCategory | null {
    let updatedItem: ProductCategory | null = null
    this.mutate((db) => {
      const categories = db.categories.map((c) => {
        if (c.id === id) {
          updatedItem = { ...c, ...updates }
          return updatedItem
        }
        return c
      })
      return { ...db, categories }
    }, { action: `Atualizou categoria "${updates.name || id}"`, module: 'categorias' })
    return updatedItem
  }

  public deleteCategory(id: string): boolean {
    const cat = this.db.categories.find((c) => c.id === id)
    if (!cat) return false
    this.mutate(
      (db) => ({ ...db, categories: db.categories.filter((c) => c.id !== id) }),
      { action: `Eliminou categoria "${cat.name}"`, module: 'categorias' }
    )
    return true
  }

  // ==========================================
  // OPERAÇÕES: PEDIDOS DA LOJA
  // ==========================================
  public getOrders(): StoreOrder[] {
    return this.db.orders
  }

  public addOrder(order: Omit<StoreOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): StoreOrder {
    const date = new Date()
    const randomSeq = Math.floor(1000 + Math.random() * 9000)
    const newOrder: StoreOrder = {
      ...order,
      id: `order-${Date.now()}`,
      orderNumber: `PED-${date.getFullYear()}-${randomSeq}`,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    }
    this.mutate(
      (db) => ({ ...db, orders: [newOrder, ...db.orders] }),
      { action: `Novo pedido recebido #${newOrder.orderNumber} (${newOrder.customerName})`, module: 'pedidos' }
    )
    return newOrder
  }

  public updateOrderStatus(id: string, status: OrderStatus, notes?: string): StoreOrder | null {
    let updatedItem: StoreOrder | null = null
    this.mutate((db) => {
      const orders = db.orders.map((o) => {
        if (o.id === id) {
          updatedItem = {
            ...o,
            status,
            notes: notes !== undefined ? notes : o.notes,
            confirmedAt: status === 'fechado' ? (o.confirmedAt || new Date().toISOString()) : o.confirmedAt,
            updatedAt: new Date().toISOString(),
          }
          return updatedItem
        }
        return o
      })
      return { ...db, orders }
    }, { action: `Alterou estado do pedido #${id} para "${status}"`, module: 'pedidos' })
    return updatedItem
  }

  public deleteOrder(id: string): boolean {
    this.mutate(
      (db) => ({ ...db, orders: db.orders.filter((o) => o.id !== id) }),
      { action: `Eliminou pedido #${id}`, module: 'pedidos' }
    )
    return true
  }

  public findOrderByNumberOrPhone(search: string): StoreOrder | null {
    const cleanSearch = search.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
    if (!cleanSearch) return null

    // 1. Procurar por orderNumber ou ID
    const byNumber = this.db.orders.find((o) => {
      const cleanOrderNum = o.orderNumber.toLowerCase().replace(/[^a-z0-9]/g, '')
      const cleanId = o.id.toLowerCase().replace(/[^a-z0-9]/g, '')
      return cleanOrderNum === cleanSearch || cleanId === cleanSearch || cleanOrderNum.includes(cleanSearch)
    })
    if (byNumber) return byNumber

    // 2. Procurar por telefone (cliente ou WhatsApp)
    const phoneDigits = search.replace(/\D/g, '')
    if (phoneDigits.length >= 7) {
      const byPhone = this.db.orders.find((o) => {
        const orderPhone = (o.customerPhone || '').replace(/\D/g, '')
        const waPhone = (o.whatsappPhone || '').replace(/\D/g, '')
        return (
          (orderPhone && (orderPhone.endsWith(phoneDigits) || phoneDigits.endsWith(orderPhone))) ||
          (waPhone && (waPhone.endsWith(phoneDigits) || phoneDigits.endsWith(waPhone)))
        )
      })
      if (byPhone) return byPhone
    }

    return null
  }

  public addWhatsAppMessage(
    orderId: string,
    message: {
      sender: WhatsAppMessageSender
      senderName?: string
      text: string
      media?: WhatsAppMessageMedia
      timestamp?: string
      status?: 'sent' | 'delivered' | 'read'
    }
  ): StoreOrder | null {
    let updatedItem: StoreOrder | null = null
    const newMsg: WhatsAppChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sender: message.sender,
      senderName: message.senderName,
      text: message.text,
      media: message.media,
      timestamp: message.timestamp || new Date().toISOString(),
      status: message.status || 'sent',
    }

    this.mutate(
      (db) => {
        const orders = db.orders.map((o) => {
          if (o.id === orderId) {
            const history = o.conversationHistory ? [...o.conversationHistory, newMsg] : [newMsg]
            updatedItem = {
              ...o,
              conversationHistory: history,
              updatedAt: new Date().toISOString(),
            }
            return updatedItem
          }
          return o
        })
        return { ...db, orders }
      },
      {
        action: `Mensagem WhatsApp (${message.sender}) no pedido #${orderId}`,
        module: 'pedidos',
      }
    )
    return updatedItem
  }

  public updateOrderReceipt(
    orderId: string,
    receipt: { url: string; filename?: string; mimeType?: string }
  ): StoreOrder | null {
    let updatedItem: StoreOrder | null = null
    this.mutate(
      (db) => {
        const orders = db.orders.map((o) => {
          if (o.id === orderId) {
            updatedItem = {
              ...o,
              receiptUrl: receipt.url,
              receiptFilename: receipt.filename || 'comprovativo.jpg',
              receiptReceivedAt: new Date().toISOString(),
              botStatus: 'receipt_received',
              status: 'em_contacto',
              updatedAt: new Date().toISOString(),
            }
            return updatedItem
          }
          return o
        })
        return { ...db, orders }
      },
      {
        action: `Comprovativo de pagamento recebido para pedido #${orderId}`,
        module: 'pedidos',
      }
    )
    return updatedItem
  }

  public updateOrderBotStatus(
    orderId: string,
    botStatus: WhatsAppBotStatus,
    notes?: string
  ): StoreOrder | null {
    let updatedItem: StoreOrder | null = null
    this.mutate(
      (db) => {
        const orders = db.orders.map((o) => {
          if (o.id === orderId) {
            updatedItem = {
              ...o,
              botStatus,
              notes: notes !== undefined ? notes : o.notes,
              updatedAt: new Date().toISOString(),
            }
            return updatedItem
          }
          return o
        })
        return { ...db, orders }
      },
      {
        action: `Estado do bot alterado para "${botStatus}" no pedido #${orderId}`,
        module: 'pedidos',
      }
    )
    return updatedItem
  }

  public confirmOrderPayment(orderId: string, agentName = 'Equipa ARKNET'): StoreOrder | null {
    let updatedItem: StoreOrder | null = null
    const now = new Date().toISOString()
    const confirmationMsg: WhatsAppChatMessage = {
      id: `msg-${Date.now()}-confirmed`,
      sender: 'bot',
      senderName: 'ARKNET Bot',
      text: `🎉 *Pagamento Validado com Sucesso!*\n\nO seu pedido foi conferido no sistema e encontra-se agora em processamento logístico.\n\n📄 *Fatura Oficial:* A fatura comercial já se encontra emitida e disponível para descarregamento na sua Área de Cliente ARKNET.\n\n🚚 *Expedição:* A nossa equipa de logística/estafeta entrará em contacto consigo nas próximas horas para agendar o horário e local da entrega/levantamento (prazo: 24h a 48h úteis).\n\nAgradecemos a sua preferência e confiança na ARKNET!`,
      timestamp: now,
      status: 'sent',
    }

    this.mutate(
      (db) => {
        const orders = db.orders.map((o) => {
          if (o.id === orderId) {
            const history = o.conversationHistory
              ? [...o.conversationHistory, confirmationMsg]
              : [confirmationMsg]
            updatedItem = {
              ...o,
              status: 'fechado',
              botStatus: 'confirmed',
              confirmedAt: now,
              conversationHistory: history,
              updatedAt: now,
            }
            return updatedItem
          }
          return o
        })
        return { ...db, orders }
      },
      {
        action: `Pagamento aprovado com 1 clique no pedido #${orderId} por ${agentName}`,
        module: 'pedidos',
      }
    )
    return updatedItem
  }

  // ==========================================
  // OPERAÇÕES: LEADS / SOLICITAR SERVIÇO
  // ==========================================
  public getLeads(): ServiceLead[] {
    return this.db.leads
  }

  public addLead(lead: Omit<ServiceLead, 'id' | 'status' | 'createdAt' | 'updatedAt'>): ServiceLead {
    const newLead: ServiceLead = {
      ...lead,
      id: `lead-${Date.now()}`,
      status: 'novo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.mutate(
      (db) => ({ ...db, leads: [newLead, ...db.leads] }),
      { action: `Novo pedido de serviço de "${newLead.name}" (${newLead.service})`, module: 'leads' }
    )
    return newLead
  }

  public updateLeadStatus(id: string, status: LeadStatus, notes?: string): ServiceLead | null {
    let updatedItem: ServiceLead | null = null
    this.mutate((db) => {
      const leads = db.leads.map((l) => {
        if (l.id === id) {
          updatedItem = {
            ...l,
            status,
            notes: notes !== undefined ? notes : l.notes,
            updatedAt: new Date().toISOString(),
          }
          return updatedItem
        }
        return l
      })
      return { ...db, leads }
    }, { action: `Alterou estado do lead para "${status}"`, module: 'leads' })
    return updatedItem
  }

  public deleteLead(id: string): boolean {
    this.mutate(
      (db) => ({ ...db, leads: db.leads.filter((l) => l.id !== id) }),
      { action: `Eliminou lead #${id}`, module: 'leads' }
    )
    return true
  }

  // ==========================================
  // OPERAÇÕES: NEWSLETTER
  // ==========================================
  public getSubscribers(): NewsletterSubscriber[] {
    return this.db.subscribers
  }

  public addSubscriber(email: string): { success: boolean; message: string; subscriber?: NewsletterSubscriber } {
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Email inválido.' }
    }
    const existing = this.db.subscribers.find((s) => s.email.toLowerCase() === cleanEmail)
    if (existing) {
      if (existing.status === 'inactive') {
        this.updateSubscriberStatus(existing.id, 'active')
        return { success: true, message: 'Subscrição reativada com sucesso!', subscriber: { ...existing, status: 'active' } }
      }
      return { success: false, message: 'Este email já se encontra subscrito na newsletter.' }
    }
    const newSub: NewsletterSubscriber = {
      id: `sub-${Date.now()}`,
      email: cleanEmail,
      status: 'active',
      subscribedAt: new Date().toISOString(),
    }
    this.mutate(
      (db) => ({ ...db, subscribers: [newSub, ...db.subscribers] }),
      { action: `Nova subscrição na newsletter: ${cleanEmail}`, module: 'newsletter' }
    )
    return { success: true, message: 'Obrigado por subscrever a nossa newsletter!', subscriber: newSub }
  }

  public updateSubscriberStatus(id: string, status: 'active' | 'inactive'): boolean {
    this.mutate((db) => {
      const subscribers = db.subscribers.map((s) => (s.id === id ? { ...s, status } : s))
      return { ...db, subscribers }
    }, { action: `Alterou estado do subscritor #${id} para "${status}"`, module: 'newsletter' })
    return true
  }

  public deleteSubscriber(id: string): boolean {
    this.mutate(
      (db) => ({ ...db, subscribers: db.subscribers.filter((s) => s.id !== id) }),
      { action: `Removeu subscritor da newsletter #${id}`, module: 'newsletter' }
    )
    return true
  }

  // ==========================================
  // OPERAÇÕES: ACADEMIA / CURSOS
  // ==========================================
  public getCourses(): CourseItem[] {
    return this.db.courses
  }

  public addCourse(course: Omit<CourseItem, 'id' | 'createdAt' | 'updatedAt'>): CourseItem {
    const newCourse: CourseItem = {
      ...course,
      id: `course-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.mutate(
      (db) => ({ ...db, courses: [newCourse, ...db.courses] }),
      { action: `Criou novo curso "${newCourse.title}"`, module: 'academia' }
    )
    return newCourse
  }

  public updateCourse(id: string, updates: Partial<CourseItem>): CourseItem | null {
    let updatedItem: CourseItem | null = null
    this.mutate((db) => {
      const courses = db.courses.map((c) => {
        if (c.id === id) {
          updatedItem = { ...c, ...updates, updatedAt: new Date().toISOString() }
          return updatedItem
        }
        return c
      })
      return { ...db, courses }
    }, { action: `Atualizou curso "${updates.title || id}"`, module: 'academia' })
    return updatedItem
  }

  public deleteCourse(id: string): boolean {
    const course = this.db.courses.find((c) => c.id === id)
    if (!course) return false
    this.mutate(
      (db) => ({ ...db, courses: db.courses.filter((c) => c.id !== id) }),
      { action: `Eliminou curso "${course.title}"`, module: 'academia' }
    )
    return true
  }

  // ==========================================
  // OPERAÇÕES: EVENTOS
  // ==========================================
  public getEvents(): EventItem[] {
    return this.db.events
  }

  public addEvent(event: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'>): EventItem {
    const newEvent: EventItem = {
      ...event,
      id: `evt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.mutate(
      (db) => ({ ...db, events: [newEvent, ...db.events] }),
      { action: `Agendou novo evento "${newEvent.title}"`, module: 'eventos' }
    )
    return newEvent
  }

  public updateEvent(id: string, updates: Partial<EventItem>): EventItem | null {
    let updatedItem: EventItem | null = null
    this.mutate((db) => {
      const events = db.events.map((e) => {
        if (e.id === id) {
          updatedItem = { ...e, ...updates, updatedAt: new Date().toISOString() }
          return updatedItem
        }
        return e
      })
      return { ...db, events }
    }, { action: `Atualizou evento "${updates.title || id}"`, module: 'eventos' })
    return updatedItem
  }

  public deleteEvent(id: string): boolean {
    const evt = this.db.events.find((e) => e.id === id)
    if (!evt) return false
    this.mutate(
      (db) => ({ ...db, events: db.events.filter((e) => e.id !== id) }),
      { action: `Eliminou evento "${evt.title}"`, module: 'eventos' }
    )
    return true
  }

  // ==========================================
  // OPERAÇÕES: CARREIRAS & CANDIDATURAS
  // ==========================================
  public getJobs(): JobPosition[] {
    return this.db.jobs
  }

  public addJob(job: Omit<JobPosition, 'id' | 'createdAt' | 'updatedAt'>): JobPosition {
    const newJob: JobPosition = {
      ...job,
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.mutate(
      (db) => ({ ...db, jobs: [newJob, ...db.jobs] }),
      { action: `Abriu nova vaga de emprego "${newJob.title}"`, module: 'carreiras' }
    )
    return newJob
  }

  public updateJob(id: string, updates: Partial<JobPosition>): JobPosition | null {
    let updatedItem: JobPosition | null = null
    this.mutate((db) => {
      const jobs = db.jobs.map((j) => {
        if (j.id === id) {
          updatedItem = { ...j, ...updates, updatedAt: new Date().toISOString() }
          return updatedItem
        }
        return j
      })
      return { ...db, jobs }
    }, { action: `Atualizou vaga "${updates.title || id}"`, module: 'carreiras' })
    return updatedItem
  }

  public deleteJob(id: string): boolean {
    const job = this.db.jobs.find((j) => j.id === id)
    if (!job) return false
    this.mutate(
      (db) => ({ ...db, jobs: db.jobs.filter((j) => j.id !== id) }),
      { action: `Eliminou vaga "${job.title}"`, module: 'carreiras' }
    )
    return true
  }

  public getApplications(): JobApplication[] {
    return this.db.applications
  }

  public addApplication(app: Omit<JobApplication, 'id' | 'status' | 'createdAt' | 'updatedAt'>): JobApplication {
    const newApp: JobApplication = {
      ...app,
      id: `app-${Date.now()}`,
      status: 'recebida',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.mutate(
      (db) => ({ ...db, applications: [newApp, ...db.applications] }),
      { action: `Nova candidatura recebida de "${newApp.candidateName}" para "${newApp.jobTitle}"`, module: 'carreiras' }
    )
    return newApp
  }

  public updateApplicationStatus(id: string, status: ApplicationStatus, notes?: string): JobApplication | null {
    let updatedItem: JobApplication | null = null
    this.mutate((db) => {
      const applications = db.applications.map((a) => {
        if (a.id === id) {
          updatedItem = {
            ...a,
            status,
            notes: notes !== undefined ? notes : a.notes,
            updatedAt: new Date().toISOString(),
          }
          return updatedItem
        }
        return a
      })
      return { ...db, applications }
    }, { action: `Atualizou estado da candidatura para "${status}"`, module: 'carreiras' })
    return updatedItem
  }

  public deleteApplication(id: string): boolean {
    this.mutate(
      (db) => ({ ...db, applications: db.applications.filter((a) => a.id !== id) }),
      { action: `Eliminou candidatura #${id}`, module: 'carreiras' }
    )
    return true
  }

  // ==========================================
  // OPERAÇÕES: TESTEMUNHOS & PARCEIROS
  // ==========================================
  public getTestimonials(): TestimonialItem[] {
    return this.db.testimonials
  }

  public addTestimonial(t: Omit<TestimonialItem, 'id' | 'createdAt' | 'updatedAt'>): TestimonialItem {
    const newT: TestimonialItem = {
      ...t,
      id: `test-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.mutate(
      (db) => ({ ...db, testimonials: [...db.testimonials, newT] }),
      { action: `Adicionou testemunho de "${newT.clientName}" (${newT.company})`, module: 'testemunhos' }
    )
    return newT
  }

  public updateTestimonial(id: string, updates: Partial<TestimonialItem>): TestimonialItem | null {
    let updatedItem: TestimonialItem | null = null
    this.mutate((db) => {
      const testimonials = db.testimonials.map((t) => {
        if (t.id === id) {
          updatedItem = { ...t, ...updates, updatedAt: new Date().toISOString() }
          return updatedItem
        }
        return t
      })
      return { ...db, testimonials }
    }, { action: `Atualizou testemunho "${updates.clientName || id}"`, module: 'testemunhos' })
    return updatedItem
  }

  public deleteTestimonial(id: string): boolean {
    const t = this.db.testimonials.find((item) => item.id === id)
    if (!t) return false
    this.mutate(
      (db) => ({ ...db, testimonials: db.testimonials.filter((item) => item.id !== id) }),
      { action: `Eliminou testemunho de "${t.clientName}"`, module: 'testemunhos' }
    )
    return true
  }

  public getPartners(): PartnerItem[] {
    return this.db.partners
  }

  public addPartner(p: Omit<PartnerItem, 'id' | 'createdAt' | 'updatedAt'>): PartnerItem {
    const newP: PartnerItem = {
      ...p,
      id: `part-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.mutate(
      (db) => ({ ...db, partners: [...db.partners, newP] }),
      { action: `Adicionou parceiro "${newP.name}"`, module: 'parceiros' }
    )
    return newP
  }

  public updatePartner(id: string, updates: Partial<PartnerItem>): PartnerItem | null {
    let updatedItem: PartnerItem | null = null
    this.mutate((db) => {
      const partners = db.partners.map((p) => {
        if (p.id === id) {
          updatedItem = { ...p, ...updates, updatedAt: new Date().toISOString() }
          return updatedItem
        }
        return p
      })
      return { ...db, partners }
    }, { action: `Atualizou parceiro "${updates.name || id}"`, module: 'parceiros' })
    return updatedItem
  }

  public deletePartner(id: string): boolean {
    const p = this.db.partners.find((item) => item.id === id)
    if (!p) return false
    this.mutate(
      (db) => ({ ...db, partners: db.partners.filter((item) => item.id !== id) }),
      { action: `Eliminou parceiro "${p.name}"`, module: 'parceiros' }
    )
    return true
  }

  // ==========================================
  // OPERAÇÕES: CLIENTES / PORTAL DO CLIENTE
  // ==========================================
  public getCustomers(): CustomerAccount[] {
    return this.db.customers || []
  }

  public getCustomerById(id: string): CustomerAccount | undefined {
    return (this.db.customers || []).find((c) => c.id === id)
  }

  public getCustomerByEmail(email: string): CustomerAccount | undefined {
    return (this.db.customers || []).find((c) => c.email.toLowerCase() === email.toLowerCase().trim())
  }

  public addCustomer(customer: Omit<CustomerAccount, 'id' | 'createdAt'>): CustomerAccount {
    const newCustomer: CustomerAccount = {
      ...customer,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.mutate(
      (db) => ({ ...db, customers: [newCustomer, ...(db.customers || [])] }),
      { action: `Criou novo cliente "${newCustomer.name}" (${newCustomer.email})`, module: 'clientes' }
    )
    return newCustomer
  }

  public updateCustomer(id: string, updates: Partial<CustomerAccount>): CustomerAccount | null {
    let updatedCustomer: CustomerAccount | null = null
    this.mutate((db) => {
      const customers = (db.customers || []).map((c) => {
        if (c.id === id) {
          updatedCustomer = { ...c, ...updates, updatedAt: new Date().toISOString() }
          return updatedCustomer
        }
        return c
      })
      return { ...db, customers }
    }, { action: `Atualizou perfil do cliente "${updates.name || id}"`, module: 'clientes' })
    return updatedCustomer
  }

  public deleteCustomer(id: string): boolean {
    const c = (this.db.customers || []).find((item) => item.id === id)
    if (!c) return false
    this.mutate(
      (db) => ({ ...db, customers: (db.customers || []).filter((item) => item.id !== id) }),
      { action: `Eliminou conta de cliente "${c.name}"`, module: 'clientes' }
    )
    return true
  }

  public authenticateCustomer(email: string, password?: string): { success: boolean; message: string; customer?: CustomerAccount } {
    const cleanEmail = email.toLowerCase().trim()
    const customer = (this.db.customers || []).find((c) => c.email.toLowerCase() === cleanEmail)
    
    if (!customer) {
      return { success: false, message: 'Nenhuma conta encontrada com este endereço de email.' }
    }
    
    if (customer.status === 'inactive') {
      return { success: false, message: 'A sua conta de cliente encontra-se temporariamente inativa. Contacte o suporte ARKNET.' }
    }

    // Validação de senha: se o utilizador forneceu senha e o cliente tem senha registada
    if (password && (customer.password || customer.passwordHash)) {
      const isPasswordValid =
        customer.password === password ||
        (customer.passwordHash && customer.passwordHash === password) ||
        (customer.password && password === customer.password)

      if (!isPasswordValid) {
        return { success: false, message: 'Palavra-passe incorreta. Verifique e tente novamente.' }
      }
    }
    
    // Atualizar timestamp de último login e registar log
    this.updateCustomer(customer.id, { lastLogin: new Date().toISOString() })
    this.mutate(
      (db) => db,
      { action: `Início de sessão de cliente "${customer.name}" (${customer.email})`, module: 'clientes' }
    )
    
    return { success: true, message: `Bem-vindo de volta, ${customer.name}!`, customer }
  }

  public resetCustomerPassword(email: string, newPassword: string): { success: boolean; message: string } {
    const cleanEmail = email.toLowerCase().trim()
    const customer = (this.db.customers || []).find((c) => c.email.toLowerCase() === cleanEmail)
    if (!customer) {
      return { success: false, message: 'Não encontramos nenhuma conta com esse endereço de email.' }
    }

    this.updateCustomer(customer.id, {
      password: newPassword,
      passwordHash: hashPasswordSync(newPassword),
      updatedAt: new Date().toISOString(),
    })
    this.mutate(
      (db) => db,
      { action: `Redefiniu palavra-passe do cliente "${customer.name}"`, module: 'clientes' }
    )
    return { success: true, message: 'Palavra-passe redefinida com sucesso! Já pode iniciar sessão.' }
  }

  public registerCustomer(data: {
    name: string
    email: string
    password?: string
    phone: string
    company?: string
    nif?: string
    address?: string
    city?: string
  }): { success: boolean; message: string; customer?: CustomerAccount } {
    const cleanEmail = data.email.toLowerCase().trim()
    const existing = this.getCustomerByEmail(cleanEmail)
    if (existing) {
      return { success: false, message: 'Já existe uma conta associada a este endereço de email.' }
    }

    const newCustomer = this.addCustomer({
      name: data.name.trim(),
      email: cleanEmail,
      password: data.password || 'Password123!',
      phone: data.phone.trim(),
      company: data.company?.trim(),
      nif: data.nif?.trim(),
      address: data.address?.trim(),
      city: data.city?.trim() || 'Luanda',
      status: 'active',
      lastLogin: new Date().toISOString(),
    })

    return { success: true, message: 'Conta criada com sucesso!', customer: newCustomer }
  }

  public getCustomerOrders(customerEmail: string): StoreOrder[] {
    const cleanEmail = customerEmail.toLowerCase().trim()
    return (this.db.orders || []).filter((o) => o.customerEmail.toLowerCase().trim() === cleanEmail)
  }

  public getCustomerLeads(customerEmail: string): ServiceLead[] {
    const cleanEmail = customerEmail.toLowerCase().trim()
    return (this.db.leads || []).filter((l) => l.email.toLowerCase().trim() === cleanEmail)
  }

  // ==========================================
  // OPERAÇÕES: PROJETOS / PORTFÓLIO
  // ==========================================
  public getProjects(): ProjectItem[] {
    return this.db.projects || []
  }

  public getProjectBySlug(slug: string): ProjectItem | null {
    const cleanSlug = slug.toLowerCase().trim()
    return (this.db.projects || []).find((p) => p.slug.toLowerCase().trim() === cleanSlug) || null
  }

  public addProject(project: Omit<ProjectItem, 'id' | 'createdAt' | 'updatedAt'>): ProjectItem {
    const slug =
      project.slug ||
      project.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    const newProject: ProjectItem = {
      ...project,
      id: `proj-${Date.now()}`,
      slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.mutate(
      (db) => ({ ...db, projects: [newProject, ...(db.projects || [])] }),
      { action: `Criou novo projeto "${newProject.title}"`, module: 'projetos' }
    )
    return newProject
  }

  public updateProject(id: string, updates: Partial<ProjectItem>): ProjectItem | null {
    let updatedItem: ProjectItem | null = null
    this.mutate(
      (db) => {
        const projects = (db.projects || []).map((p) => {
          if (p.id === id) {
            updatedItem = { ...p, ...updates, updatedAt: new Date().toISOString() }
            return updatedItem
          }
          return p
        })
        return { ...db, projects }
      },
      { action: `Atualizou projeto "${updates.title || id}"`, module: 'projetos' }
    )
    return updatedItem
  }

  public deleteProject(id: string): boolean {
    const proj = (this.db.projects || []).find((p) => p.id === id)
    if (!proj) return false
    this.mutate(
      (db) => ({ ...db, projects: (db.projects || []).filter((p) => p.id !== id) }),
      { action: `Eliminou projeto "${proj.title}"`, module: 'projetos' }
    )
    return true
  }

  // ==========================================
  // OPERAÇÕES: DEFINIÇÕES GERAIS & BACKUP
  // ==========================================
  public getSettings(): CompanySettings {
    return this.db.settings
  }

  public updateSettings(updates: Partial<CompanySettings>): CompanySettings {
    let updatedSettings: CompanySettings = { ...this.db.settings, ...updates, updatedAt: new Date().toISOString() }
    this.mutate(
      (db) => ({ ...db, settings: updatedSettings }),
      { action: 'Atualizou as definições de contacto e institucionais da ARKNET', module: 'definicoes' }
    )
    return updatedSettings
  }

  public exportDatabaseJson(): string {
    return JSON.stringify(this.db, null, 2)
  }

  public importDatabaseJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString) as ArknetDatabase
      if (!parsed.products || !parsed.users) {
        throw new Error('Formato de dados inválido.')
      }
      this.db = parsed
      this.saveToStorage(parsed)
      this.notifyListeners()
      return true
    } catch (err) {
      console.error('Failed to import database JSON', err)
      return false
    }
  }

  public resetToDefaults(): void {
    this.db = INITIAL_DB
    this.saveToStorage(INITIAL_DB)
    this.notifyListeners()
  }
}

// Instância singleton acessível em toda a aplicação
export const dataStore = new DataStoreManager()
