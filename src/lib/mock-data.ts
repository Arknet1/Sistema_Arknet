// Arquivo centralizado de dados estáticos para mockar toda a aplicação

import { produtosCatalogo } from '@/lib/produtos-catalogo'
import { produtoImagensRestantes } from '@/lib/produto-imagens-restantes'
import { precosProdutos } from "@/lib/precos"

// ---- PRODUTOS (Loja) — fotos em src/assets/produtos ----
export type MockProduct = {
  id: string
  name: string
  description: string
  /** `null` = sob consulta (mostrar "-") */
  price: number | null
  image: string
  category: string
  inStock: boolean
}

const DESCRICAO_OUTROS =
  'Equipamento disponível na ARKNET. Para modelo exacto, stock e preço final, contacte-nos — enviamos especificações e condições comerciais.'

const catalogoCompleto = produtosCatalogo

const produtosDestaqueMock: MockProduct[] = catalogoCompleto.map((p) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  price: precosProdutos[p.name] ?? null,
  image: p.image.src,
  category: p.category,
  inStock: true,
}))

const produtosRestantesMock: MockProduct[] = produtoImagensRestantes.map((img, i) => ({
  id: `catalogo-extra-${i + 1}`,
  name: `Produto ${String(catalogoCompleto.length + i + 1).padStart(2, '0')}`,
  description: DESCRICAO_OUTROS,
  price: null,
  image: img.src,
  category: 'Produtos',
  inStock: true,
}))

export const mockProducts: MockProduct[] = [...produtosDestaqueMock, ...produtosRestantesMock]
export const mockCategories = [
  { name: 'Todos', icon: 'Globe' },
  { name: 'Smartphones e Telemóveis', icon: 'Smartphone' },
  { name: 'Computadores e Portáteis', icon: 'Laptop' },
  { name: 'Periféricos de Computador', icon: 'Mouse' },
  { name: 'Armazenamento', icon: 'HardDrive' },
  { name: 'Redes e Internet', icon: 'Wifi' },
  { name: 'Ferramentas de Rede', icon: 'Wrench' },
  { name: 'Cabos e Conectividade', icon: 'Cable' },
  { name: 'Adaptadores e Conversores', icon: 'Usb' },
  { name: 'Energia e Proteção', icon: 'Zap' },
  { name: 'Acessórios de Computador', icon: 'Cpu' },
  { name: 'Áudio', icon: 'Headphones' },
  { name: 'Monitores', icon: 'Monitor' },
  { name: 'Impressoras e Consumíveis', icon: 'Printer' },
  { name: 'Material de Escritório', icon: 'FileText' },
  { name: 'Organização e Instalação', icon: 'Boxes' },
  { name: 'Segurança Eletrónica', icon: 'Shield' },
  { name: 'Automação Comercial', icon: 'Store' },
  { name: 'Produtos', icon: 'Package' }
]

// ---- SOBRE (About Us) ----
export const mockAboutUs = {
  id: '1',
  institutionalText: 'A Arknet é uma empresa tecnológica focada em inovação, conectividade e transformação digital, preparada para responder às exigências do mercado moderno através de soluções inteligentes e integradas. Com uma visão voltada para o futuro, actuamos no desenvolvimento de infraestruturas tecnológicas, serviços digitais e capacitação profissional, contribuindo para o crescimento tecnológico de Angola e África.',
  presentationLetter: 'O nosso compromisso é transformar a realidade tecnológica das empresas em Angola, oferecendo soluções integradas que impulsionam o crescimento e a eficiência operacional.',
  updatedAt: '2026-01-15T10:00:00Z',
}

// ---- POR QUE NOS ESCOLHER ----
export const mockWhyChooseUs = [
  {
    id: '1',
    title: 'Tecnologia de Ponta',
    description: 'Utilizamos as mais recentes tecnologias do mercado para garantir soluções modernas, eficientes e preparadas para o futuro do seu negócio.',
    icon: 'Zap',
    order: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Segurança Garantida',
    description: 'Implementamos protocolos rigorosos de segurança para proteger os dados e infraestruturas dos nossos clientes contra ameaças cibernéticas.',
    icon: 'ShieldCheck',
    order: 2,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '3',
    title: 'Suporte 24/7',
    description: 'Equipa técnica especializada disponível 24 horas por dia, 7 dias por semana, garantindo assistência imediata sempre que necessário.',
    icon: 'Headphones',
    order: 3,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '4',
    title: 'Crescimento Comprovado',
    description: 'Mais de uma década de experiência e centenas de clientes satisfeitos atestam a nossa capacidade de entregar resultados consistentes e duradouros.',
    icon: 'TrendingUp',
    order: 4,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '5',
    title: 'Agilidade e Pontualidade',
    description: 'Cumprimos rigorosamente os prazos estabelecidos, garantindo que os projetos sejam entregues no tempo previsto sem comprometer a qualidade.',
    icon: 'Clock',
    order: 5,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '6',
    title: 'Excelência Certificada',
    description: 'Certificações internacionais e reconhecimento do mercado validam a nossa qualidade e compromisso com as melhores práticas da indústria.',
    icon: 'Award',
    order: 6,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

// ---- SERVIÇOS ----
export const mockServices = [
  {
    id: '1',
    name: 'Internet Empresarial',
    description: 'Planos de internet dedicados com SLA garantido, suporte prioritário e largura de banda simétrica para empresas de todos os tamanhos.',
    icon: 'Cpu',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Instalação e Manutenção',
    description: 'Serviços completos de instalação, configuração e manutenção de infraestruturas de rede e equipamentos de telecomunicações.',
    icon: 'Wrench',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Computação em Nuvem',
    description: 'Soluções de cloud computing com armazenamento seguro, alta disponibilidade, backup automático e acesso remoto de qualquer lugar.',
    icon: 'Laptop',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Cabeamento Estruturado',
    description: 'Projeto e implementação de redes estruturadas seguindo normas internacionais, garantindo performance e organização do cabeamento.',
    icon: 'Cable',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '5',
    name: 'CFTV e Segurança',
    description: 'Sistemas de videovigilância com câmaras IP, gravação em nuvem, acesso remoto via aplicação móvel e análise inteligente de imagens.',
    icon: 'Camera',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '6',
    name: 'Cibersegurança',
    description: 'Proteção avançada contra ameaças cibernéticas com firewall, antivírus empresarial, auditoria de segurança e gestão de vulnerabilidades.',
    icon: 'ShieldCheck',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '7',
    name: 'Consultoria Integrada',
    description: 'Análise técnica completa, planejamento estratégico e implementação de soluções tecnológicas personalizadas para o seu negócio.',
    icon: 'Workflow',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

export const mockTrainingInfo = {
heroTitle: 'Plano de Formação',
heroSubtitle:
'Formação técnica, profissional e tecnológica para o mercado de trabalho moderno.',

aboutTitle: 'Formação para transformar.',

aboutDescription:
'O Centro de Formação Profissional Arknet é uma instituição vocacionada para a formação técnica, profissional e tecnológica, com foco na capacitação de jovens e profissionais.',

aboutDescription2:
'Apostamos numa formação prática, inovadora e alinhada às necessidades empresariais nacionais e internacionais.',

objectivesTitle: 'O que nos move',

objectiveGeneral:
'Capacitar profissionais através de formações técnicas e profissionais de elevada qualidade, preparadas para a realidade do mercado angolano e internacional.',

objectiveSpecifics: [
'Desenvolver competências técnicas',
'Promover empregabilidade',
'Incentivar inovação',
'Formar profissionais qualificados',
'Apoiar empresas',
],

durationDays: 30,

durationDetails: [
'Segunda à Sexta-feira',
'2 a 4 horas diárias',
'Aulas práticas + projeto final',
],

certifications: [
'Certificado de Formação',
'Declaração de Participação',
'Certificado de Mérito',
],

methodologyTitle: 'Como ensinamos',

contactEmail: '[formacao@arknet.co.ao](mailto:formacao@arknet.co.ao)',

website: '[www.arknet.co.ao](http://www.arknet.co.ao)',
}

export const mockTrainingHighlights = [
{
id: '1',
title: 'Competências Técnicas',
},
{
id: '2',
title: 'Empregabilidade',
},
{
id: '3',
title: 'Formação Prática',
},
{
id: '4',
title: 'Inovação Tecnológica',
},
]

export const mockTrainingModalities = [
{
id: '01',
title: 'Presencial',
description:
'Sala equipada, com formador presente e prática laboratorial.',
icon: 'GraduationCap',
},
{
id: '02',
title: 'Online',
description:
'Aulas em direto e materiais digitais acessíveis.',
icon: 'Globe',
},
{
id: '03',
title: 'Híbrida',
description:
'Combinação de formação presencial e online.',
icon: 'Layers3',
},
{
id: '04',
title: 'Workshops',
description:
'Sessões intensivas focadas em competências específicas.',
icon: 'BookOpen',
},
{
id: '05',
title: 'Corporativa',
description:
'Formações adaptadas à realidade empresarial.',
icon: 'Building2',
},
]

export const mockTrainingCourses = [
{
id: '01',
title: 'Cyber Segurança e Pentest',
description:
'Proteção, vulnerabilidades, auditorias de segurança e testes de penetração.',
icon: 'Shield',
},
{
id: '02',
title: 'Introdução à Informática',
description:
'Fundamentos digitais, produtividade e boas práticas tecnológicas.',
icon: 'Laptop',
},
{
id: '03',
title: 'Redes e Hardware',
description:
'Infraestruturas de rede, cabeamento, switches e equipamentos.',
icon: 'Network',
},
{
id: '04',
title: 'Eletrónica Avançada',
description:
'Componentes eletrónicos, automação e manutenção técnica.',
icon: 'Cpu',
},
{
id: '05',
title: 'Recursos Humanos',
description:
'Gestão de talentos, recrutamento, liderança e equipas.',
icon: 'Users',
},
{
id: '06',
title: 'Contabilidade',
description:
'Gestão financeira, processos contabilísticos e análise de custos.',
icon: 'Calculator',
},
]

export const mockTrainingMethodology = [
{
id: '01',
title: 'Aulas Teóricas e Práticas',
},
{
id: '02',
title: 'Simulações Reais',
},
{
id: '03',
title: 'Estudos de Caso',
},
{
id: '04',
title: 'Laboratórios Técnicos',
},
{
id: '05',
title: 'Exercícios Práticos',
},
{
id: '06',
title: 'Avaliação Contínua',
},
]


// ---- EVENTOS ----
export const mockEventsInfo = {
  heroTitle: 'Eventos ARKNET',
  heroSubtitle:
    'Workshops, conferências e encontros tecnológicos que conectam profissionais, empresas e inovação em Angola.',
  aboutTitle: 'Onde a tecnologia encontra pessoas.',
  aboutDescription:
    'A ARKNET promove eventos presenciais e online para partilhar conhecimento, apresentar soluções e fortalecer a comunidade tecnológica angolana.',
  aboutDescription2:
    'Desde workshops técnicos a feiras de tecnologia, criamos espaços de aprendizagem, networking e oportunidades de negócio.',
}

export const mockEventsHighlights = [
  { id: '1', title: 'Workshops Técnicos' },
  { id: '2', title: 'Conferências' },
  { id: '3', title: 'Networking' },
  { id: '4', title: 'Demonstrações ao Vivo' },
]

export const mockEventsEmptyState = {
  title: 'Nenhum evento agendado',
  description:
    'De momento não temos eventos programados. Estamos a preparar workshops, conferências e encontros tecnológicos — fique atento às novidades ou entre em contacto connosco.',
  email: 'info@arknet.co.ao',
}

// ---- CARREIRAS ----
export const mockCareersInfo = {
  heroTitle: 'Carreiras na ARKNET',
  heroSubtitle:
    'Junte-se a uma equipa apaixonada por tecnologia, inovação e transformação digital em Angola.',
  aboutTitle: 'Construa o futuro connosco.',
  aboutDescription:
    'Na ARKNET, acreditamos que o talento é o motor da inovação. Oferecemos um ambiente dinâmico, desafiante e com oportunidades reais de crescimento profissional.',
  aboutDescription2:
    'Procuramos profissionais motivados, com espírito de equipa e vontade de fazer a diferença no sector das telecomunicações e tecnologias de informação.',
}

export const mockCareersBenefits = [
  { id: '1', title: 'Crescimento Profissional', description: 'Formação contínua e plano de carreira estruturado.' },
  { id: '2', title: 'Ambiente Inovador', description: 'Trabalhe com tecnologias de ponta e projetos desafiantes.' },
  { id: '3', title: 'Equipa Colaborativa', description: 'Cultura de trabalho em equipa, respeito e partilha de conhecimento.' },
  { id: '4', title: 'Impacto Real', description: 'Contribua para a transformação digital de Angola.' },
]

export const mockSpontaneousApplication = {
  title: 'Candidatura Espontânea',
  description:
    'Não temos vagas abertas de momento, mas estamos sempre à procura de talento. Envie-nos o seu CV e conte-nos como pode contribuir para a ARKNET.',
  email: 'negocios@arknet.co.ao',
}

// ---- TESTEMUNHOS ----
export const mockTestimonials = [
  {
    id: '1',
    clientName: 'Banco Angolano de Investimento',
    type: 'Instituição Financeira',
    testimonial: 'A ARKNET transformou a nossa infraestrutura de rede. O suporte 24/7 e a qualidade da conexão superaram as nossas expectativas. Recomendamos sem hesitação.',
    logo: 'https://picsum.photos/seed/bank/200/100',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    clientName: 'AngoTelecom Serviços',
    type: 'Telecomunicações',
    testimonial: 'Parceria estratégica que nos permitiu expandir o nosso alcance. A expertise técnica da ARKNET é incomparável no mercado angolano.',
    logo: 'https://picsum.photos/seed/telecom/200/100',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '3',
    clientName: 'TechSolutions Luanda',
    type: 'Tecnologia',
    testimonial: 'Implementaram a nossa infraestrutura de cloud com excelência. O tempo de resposta e a qualidade do serviço são excecionais.',
    logo: 'https://picsum.photos/seed/tech/200/100',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '4',
    clientName: 'Construtora África Nova',
    type: 'Construção Civil',
    testimonial: 'A solução de videovigilância instalada pela ARKNET melhorou significativamente a segurança dos nossos canteiros de obra. Excelente serviço.',
    logo: 'https://picsum.photos/seed/construction/200/100',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '5',
    clientName: 'Hospital Central Luanda',
    type: 'Saúde',
    testimonial: 'A rede estruturada instalada permite o funcionamento crítico dos nossos sistemas hospitalares com 100% de disponibilidade.',
    logo: 'https://picsum.photos/seed/hospital/200/100',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

// ---- PARCEIROS ----
export const mockPartners = [
  {
    id: '1',
    name: 'Angola Telecom',
    logo: 'https://picsum.photos/seed/partner1/200/100',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Unitel Empresas',
    logo: 'https://picsum.photos/seed/partner2/200/100',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Cisco Systems',
    logo: 'https://picsum.photos/seed/partner3/200/100',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Huawei Technologies',
    logo: 'https://picsum.photos/seed/partner4/200/100',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '5',
    name: 'Microsoft Angola',
    logo: 'https://picsum.photos/seed/partner5/200/100',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '6',
    name: 'Dell Technologies',
    logo: 'https://picsum.photos/seed/partner6/200/100',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '7',
    name: 'Vodacom Angola',
    logo: 'https://picsum.photos/seed/partner7/200/100',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '8',
    name: 'TPN - Transporte de Dados',
    logo: 'https://picsum.photos/seed/partner8/200/100',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

// ---- CONTACTOS ----
export const mockContactInfo = {
  id: '1',
  phones: ['+244 935 208 449'],
  emails: ['info@arknet.co.ao', 'negocios@arknet.co.ao'],
  address: 'Rua Directa do Kero, Casa Nº32 R/C, Kilamba, Luanda',
  city: 'Luanda',
  country: 'Angola',
  zipCode: '1000',
  latitude: -8.8383,
  longitude: 13.2344,
  whatsappChannel: {
    title: 'Siga o canal ARKNET Oficial no WhatsApp',
    url: 'https://whatsapp.com/channel/0029VbCsWdsLo4hhX7FJ2e0A',
  },
  updatedAt: '2026-01-01T00:00:00Z',
}

// ---- REDES SOCIAIS ----
export const mockSocialProfiles = [
  {
    id: '1',
    platform: 'facebook',
    url: 'https://www.facebook.com/jmatostecnologias',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    platform: 'linkedin',
    url: 'https://www.linkedin.com/jmatostecnologias',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '3',
    platform: 'instagram',
    url: 'https://www.instagram.com/j.matostecnologias/',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

// ---- PORTFÓLIO ----
export const mockPortfolio = [
  {
    id: '1',
    title: 'Infraestrutura de Rede - Banco Angolano',
    image: 'https://picsum.photos/seed/portfolio1/600/400',
    description: 'Implementação completa de infraestrutura de rede para banco, incluindo cabeamento estruturado, configuração de switches e segurança de perímetro.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Cloud Migration - TechSolutions',
    image: 'https://picsum.photos/seed/portfolio2/600/400',
    description: 'Migração completa de servidores on-premises para a nuvem, com garantia de zero downtime e segurança de dados.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '3',
    title: 'Sistema de Videovigilância - Hospital Central',
    image: 'https://picsum.photos/seed/portfolio3/600/400',
    description: 'Instalação de sistema CFTV com 200+ câmaras IP, gravação em nuvem e acesso remoto para monitorização hospitalar.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '4',
    title: 'Segurança de Dados - Construtora África',
    image: 'https://picsum.photos/seed/portfolio4/600/400',
    description: 'Implementação de firewall UTM, antivírus empresarial e política de segurança para proteção de dados sensíveis.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },

  
]
