import fs from 'fs'
import path from 'path'
import {
  mockProducts,
  mockCategories,
  mockContactInfo,
  mockServices,
  mockTrainingCourses,
  mockEventsInfo,
  mockCareersInfo,
  mockTestimonials,
  mockPartners,
  mockSocialProfiles,
  mockWhyChooseUs,
} from './mock-data'
import { hashPasswordSync } from './security-utils'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'arknet-db.json')

export function getInitialServerDb() {
  const initialUsers = [
    {
      id: 'usr-1',
      name: 'Administrador Principal',
      email: 'admin@arknet.ao',
      passwordHash: hashPasswordSync('Admin@2025!'),
      role: 'admin' as const,
      avatar: '/images/team/admin.png',
      status: 'active' as const,
      createdAt: '2025-01-01T00:00:00.000Z',
      lastLogin: new Date().toISOString(),
    },
    {
      id: 'usr-2',
      name: 'Gestor de Conteúdo',
      email: 'editor@arknet.ao',
      passwordHash: hashPasswordSync('Editor@2025!'),
      role: 'editor' as const,
      avatar: '/images/team/editor.png',
      status: 'active' as const,
      createdAt: '2025-01-15T00:00:00.000Z',
    },
  ]

  const initialSettings = {
    contact: { ...mockContactInfo },
    company: {
      name: 'Arknet Tecnologia & Inovação',
      nif: '5417289102',
      slogan: 'Conectando Angola ao Futuro Digital',
      aboutText:
        'A ARKNET é uma empresa angolana pioneira em soluções integradas de conectividade, infraestrutura de redes, cibersegurança e transformação digital.',
      workingHours: 'Segunda a Sexta: 08h00 - 18h00 | Sábado: 08h00 - 13h00',
    },
    seo: {
      defaultTitle: 'ARKNET — Soluções Integradas de TI, Telecomunicações e Cibersegurança',
      defaultDescription:
        'Líder em infraestrutura de redes empresariais, internet dedicada, segurança cibernética e formação técnica em Angola.',
      keywords: 'internet angola, ti luanda, redes estruturadas, cibersegurança, arknet, fibra óptica',
    },
    social: { ...mockSocialProfiles },
    services: [...mockServices],
    whyChooseUs: [...mockWhyChooseUs],
  }

  const initialProjects = [
    {
      id: 'proj-1',
      title: 'Implantação de Rede Óptica para Governo Provincial',
      slug: 'rede-optica-governo-provincial',
      client: 'Governo Provincial de Luanda',
      sector: 'Setor Público',
      category: 'Infraestrutura de Rede',
      summary: 'Projeto de conectividade de alta performance cobrindo 14 edifícios administrativos.',
      description:
        'Implementação de mais de 35km de fibra óptica dedicada, interligando todas as secretarias provinciais a um data center central de alta disponibilidade.',
      results: [
        '99.98% de disponibilidade contínua de rede',
        'Redução de 60% nos custos com telecomunicações entre secretarias',
        'Interligação total em tempo recorde de 45 dias',
      ],
      technologies: ['Fibra Óptica Monomodo', 'Switches Cisco Nexus', 'Roteadores MikroTik CCR', 'Data Center Tier 3'],
      image: 'https://picsum.photos/seed/arknet-optica/800/600',
      gallery: [
        'https://picsum.photos/seed/arknet-optica-1/800/600',
        'https://picsum.photos/seed/arknet-optica-2/800/600',
      ],
      featured: true,
      completionDate: '2024-11-15',
      duration: '45 dias',
      location: 'Luanda, Angola',
      testimonial: {
        quote: 'A equipa da ARKNET entregou um projeto crítico com precisão milimétrica e dentro do prazo.',
        author: 'Eng. Manuel Domingos',
        role: 'Diretor de TI Governamental',
      },
    },
  ]

  return {
    users: initialUsers,
    customers: [],
    products: mockProducts.map((p) => ({
      ...p,
      quantity: 15,
      sku: `ARK-${p.id.toUpperCase()}`,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    })),
    categories: mockCategories,
    orders: [],
    leads: [],
    subscribers: [],
    courses: mockTrainingCourses,
    events: mockEventsInfo,
    eventRegistrations: [],
    jobs: mockCareersInfo,
    applications: [],
    testimonials: mockTestimonials,
    partners: mockPartners,
    projects: initialProjects,
    settings: initialSettings,
    activities: [
      {
        id: 'act-1',
        user: 'Sistema',
        action: 'Base de dados inicializada com sucesso',
        module: 'Sistema',
        timestamp: new Date().toISOString(),
      },
    ],
  }
}

export function readServerDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }

    if (!fs.existsSync(DB_FILE)) {
      const initialData = getInitialServerDb()
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8')
      return initialData
    }

    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    if (!raw.trim()) {
      const initialData = getInitialServerDb()
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8')
      return initialData
    }

    const parsed = JSON.parse(raw)
    return parsed
  } catch (error) {
    console.error('[Server DB] Error reading DB:', error)
    return getInitialServerDb()
  }
}

export function writeServerDb(data: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }

    // Atomic write using a temp file
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8')
    fs.renameSync(tempFile, DB_FILE)
    return true
  } catch (error) {
    console.error('[Server DB] Error writing DB:', error)
    return false
  }
}
