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
  mission: 'Fornecer soluções integradas de telecomunicações, cibersegurança e infraestruturas digitais de elevado padrão, impulsionando a eficiência operacional e o crescimento sustentável dos negócios em Angola.',
  vision: 'Ser a principal parceira estratégica e referência tecnológica de topo em Angola, reconhecida pela excelência técnica, agilidade, alta disponibilidade e inovação contínua.',
  values: [
    { title: 'Excelência Técnica', desc: 'Compromisso intransigente com as melhores práticas de engenharia e padrões internacionais.' },
    { title: 'Inovação & Futuro', desc: 'Tecnologias de ponta preparadas para escalar e responder aos desafios digitais modernos.' },
    { title: 'Segurança & Fiabilidade', desc: 'Proteção máxima de dados, estabilidade operacional e arquiteturas redundantes.' },
    { title: 'Agilidade & Suporte 24/7', desc: 'Apoio técnico permanente, equipas no terreno e respostas rápidas e conclusivas.' },
    { title: 'Integridade & Parceria', desc: 'Relações transparentes, éticas e de longo prazo com clientes e parceiros.' },
  ],
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
    slug: 'internet-empresarial',
    category: 'Conectividade',
    tagline: 'Conectividade de alta velocidade dedicada e simétrica com SLA empresarial garantido.',
    description: 'Planos de internet dedicados com SLA de 99.9% garantido, suporte prioritário 24/7 e largura de banda simétrica (upload e download iguais), concebidos para sustentar operações críticas de empresas de todos os portes.',
    icon: 'Cpu',
    bullets: [
      'Links dedicados de fibra e rádio redundante',
      'Disponibilidade contratual SLA de 99.9%',
      'Endereço IP público estático incluído',
    ],
    includes: [
      'Links de fibra óptica dedicados com redundância 4G/Rádio de alta capacidade',
      'Largura de banda 100% simétrica e tráfego ilimitado sem traffic shaping',
      'SLA garantido de 99.9% com monitorização em tempo real e relatórios de disponibilidade',
      'Endereçamento IP público estático dedicado para serviços internos e VPNs',
      'Suporte técnico prioritário com equipa de engenharia de rede dedicada 24/7',
    ],
    targetAudience: 'Sedes corporativas, instituições financeiras, clínicas, hotéis, indústrias e empresas que exigem máxima disponibilidade e estabilidade de conexão.',
    benefits: ['Velocidade sem oscilações', 'Atendimento direto com engenharia', 'Escalabilidade sob demanda'],
    detailedBenefits: [
      { title: 'Velocidade Simétrica Garantida', desc: 'Upload e download com a mesma taxa de transferência sem qualquer oscilação em picos de tráfego.' },
      { title: 'SLA de 99.9% Contratual', desc: 'Garantia contratual de disponibilidade continuada com compensação em caso de paragens.' },
      { title: 'Suporte Prioritário 24/7', desc: 'Atendimento direto por engenheiros de rede dedicados sem passar por atendimento genérico.' },
    ],
    faqs: [
      { q: 'Qual é a diferença entre a Internet Empresarial ARKNET e um plano comum?', a: 'A Internet Empresarial possui banda 100% dedicada e simétrica (sem partilha com outros utilizadores), garantia contratual de SLA de 99.9% e suporte com engenharia própria.' },
      { q: 'A ARKNET disponibiliza redundância de link?', a: 'Sim. Projetamos soluções com dupla abordagem usando Fibra Óptica principal e redundância automática via Rádio de Alta Capacidade ou 4G corporativo.' },
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Instalação e Manutenção',
    slug: 'instalacao-e-manutencao',
    category: 'Conectividade',
    tagline: 'Instalação, configuração e suporte técnico preventivo e corretivo para infraestruturas de TI.',
    description: 'Serviços completos de montagem, configuração e manutenção de infraestruturas de rede, data centers, telecomunicações e equipamentos corporativos, minimizando paragens e garantindo a continuidade do negócio.',
    icon: 'Wrench',
    bullets: [
      'Configuração avançada de routers e firewalls',
      'Manutenção preventiva periódica no terreno',
      'Intervenção corretiva de emergência 24/7',
    ],
    includes: [
      'Montagem e configuração avançada de routers, switches, firewalls e access points',
      'Manutenção preventiva periódica com limpeza técnica, testes de carga e diagnósticos',
      'Intervenção técnica corretiva de emergência com tempos de resposta contratuais',
      'Substituição e reparação de equipamentos com peças de reposição garantidas',
      'Auditoria física, etiquetagem e reorganização estrutural de bastidores (Racks)',
    ],
    targetAudience: 'Empresas com infraestrutura física em funcionamento que necessitam de técnicos certificados para manutenção contínua ou novos escritórios em fase de implantação.',
    benefits: ['Redução drástica de downtime', 'Prolongamento da vida útil dos equipamentos', 'Equipa técnica no terreno em Luanda'],
    detailedBenefits: [
      { title: 'Redução Drástica de Downtime', desc: 'Manutenção preventiva periódica que identifica falhas antes de causarem paragens operacionais.' },
      { title: 'Técnicos Certificados no Terreno', desc: 'Presença física em Luanda e províncias com equipas capacitadas para resolver avarias no local.' },
      { title: 'Substituição com Stock Garantido', desc: 'Peças de reposição e equipamentos de reserva prontos para substituição imediata.' },
    ],
    faqs: [
      { q: 'Qual é o tempo médio de resposta para intervenção de emergência?', a: 'Para clientes com contrato de manutenção ative, os nossos técnicos deslocam-se às suas instalações no prazo contratado de até 2 a 4 horas em Luanda.' },
      { q: 'É possível contratar manutenção sem ter feito a instalação com a ARKNET?', a: 'Sim. Efetuamos um diagnóstico técnico prévio do seu ambiente e assumimos a manutenção corretiva e preventiva.' },
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Computação em Nuvem',
    slug: 'computacao-em-nuvem',
    category: 'Cloud & Infraestrutura',
    tagline: 'Infraestrutura cloud escalável, armazenamento seguro e recuperação de desastres.',
    description: 'Soluções avançadas de cloud computing e virtualização com alta disponibilidade, backups automatizados georreferenciados e acesso remoto seguro aos seus sistemas e dados a partir de qualquer ponto do mundo.',
    icon: 'Laptop',
    bullets: [
      'Servidores VPS e instâncias dedicadas',
      'Backups automáticos criptografados',
      'Planos de Recuperação de Desastres (DRP)',
    ],
    includes: [
      'Provisionamento de Servidores Virtuais (VPS e Instâncias Cloud Dedicadas)',
      'Backups automáticos criptografados com retenção programada e proteção contra ransomware',
      'Planos de Recuperação de Desastres (Disaster Recovery) e continuidade de negócio',
      'Ambientes cloud otimizados para ERPs (PHC, Primavera, SAP), CRMs e bases de dados',
      'Migração transparente de servidores físicos (On-Premises) para a Nuvem sem perda de dados',
    ],
    targetAudience: 'Empresas em expansão, equipas em trabalho remoto/híbrido e negócios que procuram eliminar custos com servidores físicos locais e ar condicionado dedicado.',
    benefits: ['Acesso 100% seguro em qualquer lugar', 'Proteção máxima contra perda de ficheiros', 'Custo operacional otimizado'],
    detailedBenefits: [
      { title: 'Zero Custo de Hardware Local', desc: 'Elimine compras de servidores físicos caros, manutenção local e consumo elétrico de salas de máquinas.' },
      { title: 'Acesso Remoto Seguro 24/7', desc: 'Permita que a sua equipa aceda aos ficheiros e ERP corporativo em qualquer lugar via túnel cifrado.' },
      { title: 'Proteção Anti-Ransomware', desc: 'Backups automáticos redundantes armazenados fora do ambiente local para rápida recuperação.' },
    ],
    faqs: [
      { q: 'Os dados da minha empresa ficam armazenados em locais seguros?', a: 'Sim. Os nossos servidores operam em centros de dados com certificação internacional de segurança, com criptografia de ponta e réplicas redundantes.' },
      { q: 'Quanto tempo demora a migração para a Cloud?', a: 'A migração é realizada de forma transparente fora do horário de expediente, levando habitualmente entre 24h a 48h sem paragem do seu negócio.' },
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Cabeamento Estruturado',
    slug: 'cabeamento-estruturado',
    category: 'Cloud & Infraestrutura',
    tagline: 'Projetos e implementação de redes de cabos e fibra sob normas internacionais TIA/EIA.',
    description: 'Engenharia de rede com projeto, passagem, conectorização e certificação de cabeamento Cat6, Cat6A e fibra óptica, assegurando máxima velocidade de transferência e organização impecável de bastidores.',
    icon: 'Cable',
    bullets: [
      'Certificação de pontos de rede Cat6/Cat6A/Fibra',
      'Organização profissional de Racks e Patch Panels',
      'Identificação padronizada ponto a ponto',
    ],
    includes: [
      'Planeamento de rotas de cabos, esteiras, calhas técnicas e tomadas de rede RJ45',
      'Instalação, montagem e organização profissional de bastidores (Racks de Servidores)',
      'Testes de certificação de canais com equipamento calibrado e emissão de relatórios',
      'Fusão, conectorização e conetividade de fibra óptica multimodo e monomodo',
      'Identificação padronizada ponto a ponto e entrega de documentação as-built',
    ],
    targetAudience: 'Edifícios corporativos, armazéns, agências bancárias, escritórios em remodelação ou construção e polos industriais.',
    benefits: ['Zero perda de pacotes na rede local', 'Facilidade imediata de expansão e manutenção', 'Infraestrutura com durabilidade superior a 15 anos'],
    detailedBenefits: [
      { title: 'Velocidade de Rede Garantida', desc: 'Canais de alta performance certificados sob norma TIA/EIA para gigabit e 10Gbps sem interferências.' },
      { title: 'Bastidores Organizados', desc: 'Racks perfeitamente etiquetados e organizados, facilitando alterações futuras e manutenção.' },
      { title: 'Durabilidade > 15 Anos', desc: 'Materiais de alta resistência projetados para suportar expansões de equipa por muitos anos.' },
    ],
    faqs: [
      { q: 'A ARKNET entrega relatório de certificação da rede instalada?', a: 'Sim. Todos os pontos são testados individualmente com certificadores Fluke calibrados, fornecendo relatórios técnicos detalhados.' },
      { q: 'Qual a categoria de cabo ideal para o meu escritório?', a: 'Para a maioria dos escritórios modernos recomendamos Cat6 ou Cat6A para garantir suporte a conexões de alta velocidade e Power over Ethernet (PoE).' },
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '5',
    name: 'CFTV e Segurança',
    slug: 'cftv-e-seguranca',
    category: 'Segurança',
    tagline: 'Videovigilância IP de alta definição, gravação em nuvem e inteligência artificial.',
    description: 'Sistemas inteligentes de videovigilância com câmaras IP de alta resolução, deteção de movimento com IA, gravação centralizada em NVR ou Cloud e controlo total em tempo real pelo telemóvel ou computador.',
    icon: 'Camera',
    bullets: [
      'Câmaras IP 4K/Full HD com visão noturna',
      'Deteção de intrusão e inteligência artificial',
      'Controlo de acessos biométrico e cartões RFID',
    ],
    includes: [
      'Instalação de câmaras IP com visão noturna por infravermelho e resolução 4K/Full HD',
      'Configuração de NVRs, servidores de vídeo e armazenamento em nuvem redundante',
      'Sistemas de controlo de acessos biométrico, cartões RFID e reconhecimento facial',
      'Acesso remoto seguro em tempo real via aplicação móvel e painel web para gestores',
      'Análise de vídeo inteligente: deteção de intrusão perimetral e leitura de matrículas',
    ],
    targetAudience: 'Instalações industriais, centros comerciais, condomínios, armazéns, lojas de retalho e escritórios corporativos.',
    benefits: ['Monitorização em qualquer momento e lugar', 'Prevenção ativa de perdas e intrusões', 'Gravação contínua com backup garantido'],
    detailedBenefits: [
      { title: 'Monitorização em Qualquer Lugar', desc: 'Visualização direta de imagens ao vivo e gravações através de aplicação móvel ou portal web.' },
      { title: 'Alertas Inteligentes em Tempo Real', desc: 'Receba notificações imediatas no telemóvel ao detetar intrusões perimetrais ou movimento suspeito.' },
      { title: 'Controlo de Acessos Integrado', desc: 'Combine videovigilância com controlo biométrico e registo de entradas e saídas de funcionários.' },
    ],
    faqs: [
      { q: 'As câmaras continuam a funcionar durante falhas de energia?', a: 'Sim. Integramos baterias e UPS (No-Breaks) dimensionados para manter todo o sistema de segurança ativo durante cortes elétricos.' },
      { q: 'É possível guardar as gravações em local externo seguro?', a: 'Sim. Configuramos backup redundante em nuvem para salvaguardar as gravações contra danos ou furto do gravador físico.' },
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '6',
    name: 'Cibersegurança',
    slug: 'ciberseguranca',
    category: 'Segurança',
    tagline: 'Proteção perimetral, firewall UTM, antivírus corporativo e auditorias de vulnerabilidades.',
    description: 'Arquitetura de segurança cibernética robusta para salvaguardar a informação confidencial, sistemas e reputação da sua empresa contra ataques de ransomware, vírus, intrusões e fugas de dados.',
    icon: 'ShieldCheck',
    bullets: [
      'Firewall UTM e Next-Gen Firewall (NGFW)',
      'Proteção Antivírus/EDR corporativo centralizado',
      'Auditoria de vulnerabilidades e testes de invasão',
    ],
    includes: [
      'Implementação e gestão de Firewall UTM / Next-Generation Firewall (NGFW)',
      'Proteção centralizada de computadores e servidores (Antivírus / EDR corporativo)',
      'Auditoria de segurança, varredura de vulnerabilidades e testes de penetração',
      'Políticas de filtragem web, bloqueio de ameaças e túneis VPN seguros para teletrabalho',
      'Formação de sensibilização de colaboradores e protocolos de resposta a incidentes',
    ],
    targetAudience: 'Instituições com dados sensíveis, escritórios de advocacia, serviços financeiros, clínicas, empresas de logística e órgãos públicos.',
    benefits: ['Blindagem contra ransomware e sequestro de ficheiros', 'Conformidade com regulamentação de dados', 'Visibilidade em tempo real de tentativas de ataque'],
    detailedBenefits: [
      { title: 'Blindagem Contra Ransomware', desc: 'Impeça o sequestro de ficheiros e paralisação dos sistemas através de firewalls avançados e proteção EDR.' },
      { title: 'VPN Segura para Teletrabalho', desc: 'Permita conexões remotas encriptadas dos funcionários para a rede da empresa com controlo rígido de acessos.' },
      { title: 'Auditorias de Vulnerabilidades', desc: 'Análise contínua das brechas de segurança no sistema com plano de ação imediato de correção.' },
    ],
    faqs: [
      { q: 'Como a ARKNET protege a minha empresa contra ataques cibernéticos?', a: 'Implementamos uma defesa em camadas: Firewall na borda da rede, proteção EDR nos computadores, filtros de email anti-phishing e políticas de acesso restrito.' },
      { q: 'A ARKNET faz formação aos funcionários sobre segurança?', a: 'Sim. Disponibilizamos módulos de conscientização contra engenharia social e e-mails fraudulentos para capacitar a sua equipa.' },
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '7',
    name: 'Consultoria Integrada',
    slug: 'consultoria-integrada',
    category: 'Consultoria',
    tagline: 'Planeamento estratégico de TI, auditorias tecnológicas e gestão de projetos digitais.',
    description: 'Diagnóstico técnico especializado, consultoria de dimensionamento e planeamento estratégico para empresas que procuram modernizar a sua infraestrutura com a melhor relação custo-benefício do mercado.',
    icon: 'Workflow',
    bullets: [
      'Auditoria completa de infraestrutura de TI',
      'Plano diretor de transformação digital',
      'Otimização de custos de licenças e hardware',
    ],
    includes: [
      'Auditoria e diagnóstico técnico detalhado da infraestrutura de TI existente',
      'Desenho de planos diretores de tecnologia e planos de transformação digital',
      'Dimensionamento de equipamentos, capacidade de rede e seleção criteriosa de tecnologias',
      'Gestão, fiscalização e acompanhamento técnico de projetos de telecomunicações',
      'Otimização de custos operacionais e consolidação de licenciamento de software',
    ],
    targetAudience: 'Diretores de TI, gestores executivos e empresários que pretendem expandir ou reestruturar as suas operações com segurança técnica.',
    benefits: ['Decisões de investimento precisas e fundamentadas', 'Eliminação de desperdícios tecnológicos', 'Alinhamento direto da TI com as metas do negócio'],
    detailedBenefits: [
      { title: 'Investimentos Assertivos', desc: 'Compre apenas o equipamento e serviços estritamente necessários, eliminando desperdícios de orçamento.' },
      { title: 'Fiscalização Independente', desc: 'Acompanhamento rigoroso de terceiros e fornecedores de tecnologia para garantir o cumprimento dos contratos.' },
      { title: 'Plano Estratégico de TI', desc: 'Roteiro claro de evolução tecnológica para preparar a sua empresa para os próximos 5 a 10 anos.' },
    ],
    faqs: [
      { q: 'Em que consiste o diagnóstico técnico inicial?', a: 'Efetuamos um levantamento minucioso dos seus equipamentos, rede, segurança e licenças, entregando um parecer detalhado com pontos críticos e melhorias.' },
      { q: 'A consultoria pode ajudar a reduzir os custos mensais de tecnologia?', a: 'Sim. Na maioria dos casos conseguimos otimizar contratos de telecomunicações e eliminar licenças duplicadas, gerando poupanças significativas.' },
    ],
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

import vendor1 from '@/assets/parceiros/vendor-1.jpg'
import vendor2 from '@/assets/parceiros/vendor-2.jpg'
import vendor3 from '@/assets/parceiros/vendor-3.jpg'
import vendor4 from '@/assets/parceiros/vendor-4.jpg'
import vendor5 from '@/assets/parceiros/vendor-5.jpg'
import vendor6 from '@/assets/parceiros/vendor-6.jpg'
import vendor7 from '@/assets/parceiros/vendor-7.jpg'
import vendor8 from '@/assets/parceiros/vendor-8.jpg'
import vendor9 from '@/assets/parceiros/vendor-9.jpg'
import vendor10 from '@/assets/parceiros/vendor-10.jpg'
import vendor11 from '@/assets/parceiros/vendor-11.jpg'
import vendor12 from '@/assets/parceiros/vendor-12.jpg'
import vendor13 from '@/assets/parceiros/vendor-13.jpg'
import vendor14 from '@/assets/parceiros/vendor-14.jpg'

// ---- PARCEIROS & CLIENTES INSTITUCIONAIS ----
export const mockPartners = [
  {
    id: 'partner-1',
    name: 'AnyConnect',
    logo: vendor1.src,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'partner-2',
    name: 'Tecnimed',
    logo: vendor2.src,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'partner-3',
    name: 'Igreja Universal',
    logo: vendor3.src,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'partner-4',
    name: 'Macon',
    logo: vendor4.src,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'partner-5',
    name: 'Tribunal Supremo',
    logo: vendor5.src,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'partner-6',
    name: 'Mota-Engil',
    logo: vendor6.src,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'partner-7',
    name: 'Record TV Africa',
    logo: vendor7.src,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'partner-8',
    name: 'ANPG',
    logo: vendor8.src,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'partner-9',
    name: 'Huambo Expresso',
    logo: vendor9.src,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'partner-10',
    name: 'Vernon',
    logo: vendor10.src,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'partner-11',
    name: 'Neptec',
    logo: vendor11.src,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'partner-12',
    name: 'Comando MGA',
    logo: vendor12.src,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'partner-13',
    name: 'Power House',
    logo: vendor13.src,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'partner-14',
    name: 'A Mundial Seguros',
    logo: vendor14.src,
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
