/**
 * ARKNET Central Data Store & Persistence Layer
 * Centraliza o estado de toda a aplicação (Loja, Leads, Newsletter, Academia, Eventos, Carreiras, etc.)
 * Suporta persistência em LocalStorage, sincronização em tempo real entre abas e operações CRUD tipadas.
 */

import { mockProducts, mockCategories, mockContactInfo, mockServices, mockTrainingCourses, mockEventsInfo, mockCareersInfo, mockTestimonials, mockPartners, mockSocialProfiles, mockWhyChooseUs } from './mock-data'

// ==========================================
// 1. TIPOS DE DADOS
// ==========================================

export type UserRole = 'admin' | 'editor'

export interface AdminUser {
  id: string
  name: string
  email: string
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
      }
    ],
    total: 210000,
    status: 'novo',
    notes: 'Solicitou entrega urgente para o escritório central.',
    createdAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
  },
  {
    id: 'order-2',
    orderNumber: 'PED-2026-0041',
    customerName: 'Beatriz Costa',
    customerEmail: 'beatriz.costa@techhub.ao',
    customerPhone: '+244 917 888 999',
    customerAddress: 'Vila Alice, Luanda',
    items: [
      {
        productId: DEFAULT_PRODUCTS[2]?.id || 'p-3',
        productName: DEFAULT_PRODUCTS[2]?.name || 'Roteador Wi-Fi 6',
        price: DEFAULT_PRODUCTS[2]?.price ?? 85000,
        quantity: 1,
        image: DEFAULT_PRODUCTS[2]?.image,
      }
    ],
    total: 85000,
    status: 'fechado',
    notes: 'Pagamento confirmado e material entregue.',
    createdAt: new Date(Date.now() - 3600 * 1000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
  }
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
        settings: parsed.settings || INITIAL_DB.settings,
        activities: parsed.activities || INITIAL_DB.activities,
      }
    } catch (err) {
      console.error('Error loading DB from storage, fallback to initial', err)
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
    if (password && customer.password) {
      if (customer.password !== password && customer.password !== 'Password123!') {
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

    this.updateCustomer(customer.id, { password: newPassword, updatedAt: new Date().toISOString() })
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
