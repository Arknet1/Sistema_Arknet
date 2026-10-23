import { PrismaClient, Prisma } from '@prisma/client'
import { hashPassword } from '../src/lib/server-auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 [SEED RH] Iniciando Seed do Módulo de Recursos Humanos J.Matos...')

  // Senhas lidas das variáveis de ambiente com fallback seguro
  const adminPassword = process.env.HR_ADMIN_INITIAL_PASSWORD || 'AdminRhJMatos2026!#'
  const techPassword = process.env.HR_TECH_INITIAL_PASSWORD || 'TecnicoRhJMatos2026!#'
  const employeePassword = process.env.HR_EMPLOYEE_INITIAL_PASSWORD || 'FuncionarioJMatos2026!#'

  console.log('📌 [SEED RH] Criando Departamentos...')
  const depEng = await prisma.hrDepartment.upsert({
    where: { code: 'ENG' },
    update: {},
    create: {
      code: 'ENG',
      name: 'Engenharia e Redes de Telecomunicações',
      description: 'Responsável pela infraestrutura de fibra óptica, rádio e conectividade empresarial.',
      active: true,
    },
  })

  const depRh = await prisma.hrDepartment.upsert({
    where: { code: 'RH' },
    update: {},
    create: {
      code: 'RH',
      name: 'Recursos Humanos & Apoio Operacional',
      description: 'Gestão de pessoas, talentos, cultura e suporte administrativo.',
      parentId: depEng.id,
      active: true,
    },
  })

  console.log('📌 [SEED RH] Criando Cargos...')
  const cargoTelco = await prisma.hrPosition.upsert({
    where: { code: 'TEC_TELCO' },
    update: {},
    create: {
      code: 'TEC_TELCO',
      title: 'Técnico Sénior de Telecomunicações',
      level: 'Senior',
      salaryCategory: 'CAT-A',
      description: 'Instalação e manutenção de redes empresariais de alto débito.',
      active: true,
    },
  })

  const cargoRh = await prisma.hrPosition.upsert({
    where: { code: 'ESP_RH' },
    update: {},
    create: {
      code: 'ESP_RH',
      title: 'Especialista de Recursos Humanos',
      level: 'Pleno',
      salaryCategory: 'CAT-B',
      description: 'Processamento salarial, admissões, gestão de assiduidade e contratos.',
      active: true,
    },
  })

  const cargoSuporte = await prisma.hrPosition.upsert({
    where: { code: 'SUP_CLI' },
    update: {},
    create: {
      code: 'SUP_CLI',
      title: 'Assistente de Apoio ao Cliente',
      level: 'Junior',
      salaryCategory: 'CAT-C',
      description: 'Atendimento operacional e acompanhamento de chamados de suporte.',
      active: true,
    },
  })

  console.log('📌 [SEED RH] Criando Utilizadores Administrativos e Perfis RBAC...')
  // 1. Perfil ADMINISTRADOR
  const userAdmin = await prisma.adminUser.upsert({
    where: { email: 'admin.rh@jmatos.co.ao' },
    update: { role: 'ADMINISTRADOR', status: 'active' },
    create: {
      name: 'Dr. Sebastião Gaspar',
      email: 'admin.rh@jmatos.co.ao',
      passwordHash: hashPassword(adminPassword),
      role: 'ADMINISTRADOR',
      status: 'active',
      mustChangePassword: false,
    },
  })

  // 2. Perfil TECNICO_RH (com ficha ligada para aceder ao /rh e ao seu próprio /portal)
  const userTecnico = await prisma.adminUser.upsert({
    where: { email: 'tecnico.rh@jmatos.co.ao' },
    update: { role: 'TECNICO_RH', status: 'active' },
    create: {
      name: 'Teresa M. da Silva',
      email: 'tecnico.rh@jmatos.co.ao',
      passwordHash: hashPassword(techPassword),
      role: 'TECNICO_RH',
      status: 'active',
      mustChangePassword: false,
    },
  })

  // 3. Perfil FUNCIONARIO
  const userFuncionario = await prisma.adminUser.upsert({
    where: { email: 'colaborador@jmatos.co.ao' },
    update: { role: 'FUNCIONARIO', status: 'active' },
    create: {
      name: 'Manuel António dos Santos',
      email: 'colaborador@jmatos.co.ao',
      passwordHash: hashPassword(employeePassword),
      role: 'FUNCIONARIO',
      status: 'active',
      mustChangePassword: true, // Teste de troca de senha no primeiro acesso
    },
  })

  console.log('📌 [SEED RH] Criando Fichas de Funcionários...')
  // Funcionário 1: Técnico de RH
  const empTecnico = await prisma.hrEmployee.upsert({
    where: { biNumber: '005432101LA044' },
    update: { userId: userTecnico.id, employeeNumber: 'JM-001' },
    create: {
      employeeNumber: 'JM-001',
      fullName: 'Teresa M. da Silva',
      biNumber: '005432101LA044',
      birthDate: new Date('1991-05-14'),
      gender: 'F',
      phone: '+244 923 111 222',
      email: 'tecnico.rh@jmatos.co.ao',
      address: 'Rua Comandante Gika, Edifício Garden Towers, Luanda',
      city: 'Luanda',
      province: 'Luanda',
      bankName: 'Banco Angolano de Investimentos (BAI)',
      bankIban: 'AO06.0040.0000.1234.5678.9012.3',
      bankAccountNumber: '1234567890',
      admissionDate: new Date('2023-02-01'),
      status: 'ACTIVO',
      departmentId: depRh.id,
      positionId: cargoRh.id,
      userId: userTecnico.id,
    },
  })

  // Funcionário 2: Colaborador da Engenharia
  const empEng = await prisma.hrEmployee.upsert({
    where: { biNumber: '008765432LA099' },
    update: { userId: userFuncionario.id, employeeNumber: 'JM-002' },
    create: {
      employeeNumber: 'JM-002',
      fullName: 'Manuel António dos Santos',
      biNumber: '008765432LA099',
      birthDate: new Date('1994-11-20'),
      gender: 'M',
      phone: '+244 934 555 666',
      email: 'colaborador@jmatos.co.ao',
      address: 'Avenida 21 de Janeiro, Morro Bento, Luanda',
      city: 'Luanda',
      province: 'Luanda',
      bankName: 'Banco de Fomento Angola (BFA)',
      bankIban: 'AO06.0006.0000.9876.5432.1098.7',
      bankAccountNumber: '9876543210',
      admissionDate: new Date('2024-01-15'),
      status: 'ACTIVO',
      departmentId: depEng.id,
      positionId: cargoTelco.id,
      directSupervisorId: empTecnico.id,
      userId: userFuncionario.id,
    },
  })

  // Funcionário 3: Colaborador de Atendimento
  const empApoio = await prisma.hrEmployee.upsert({
    where: { biNumber: '009112233LA012' },
    update: { employeeNumber: 'JM-003' },
    create: {
      employeeNumber: 'JM-003',
      fullName: 'Helena Kiala Baptista',
      biNumber: '009112233LA012',
      birthDate: new Date('1998-08-05'),
      gender: 'F',
      phone: '+244 945 777 888',
      email: 'helena.baptista@jmatos.co.ao',
      address: 'Centralidade do Kilamba, Bloco B, Luanda',
      city: 'Luanda',
      province: 'Luanda',
      bankName: 'Banco Millennium Atlântico (BMA)',
      bankIban: 'AO06.0055.0000.3344.5566.7788.9',
      bankAccountNumber: '3344556677',
      admissionDate: new Date('2024-06-01'),
      status: 'ACTIVO',
      departmentId: depRh.id,
      positionId: cargoSuporte.id,
      directSupervisorId: empTecnico.id,
    },
  })

  console.log('📌 [SEED RH] Criando Contratos...')
  // Contrato 1: Indeterminado para a Técnica de RH
  await prisma.hrContract.upsert({
    where: { contractNumber: 'JM-CTR-2023-001' },
    update: {},
    create: {
      contractNumber: 'JM-CTR-2023-001',
      employeeId: empTecnico.id,
      type: 'INDETERMINADO',
      startDate: new Date('2023-02-01'),
      baseSalary: new Prisma.Decimal('550000.00'),
      workDays: 'SEG-SEX',
      dailyHours: new Prisma.Decimal('8.0'),
      weeklyHours: new Prisma.Decimal('40.0'),
      status: 'ACTIVO',
      approvedBy: userAdmin.name,
      approvedAt: new Date('2023-02-01'),
      createdBy: userAdmin.name,
    },
  })

  // Contrato 2: Determinado a expirar em breve para teste de alertas (próximos 20 dias)
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + 20)

  await prisma.hrContract.upsert({
    where: { contractNumber: 'JM-CTR-2024-042' },
    update: { endDate: expiryDate },
    create: {
      contractNumber: 'JM-CTR-2024-042',
      employeeId: empEng.id,
      type: 'DETERMINADO',
      startDate: new Date('2024-01-15'),
      endDate: expiryDate,
      baseSalary: new Prisma.Decimal('450000.00'),
      workDays: 'SEG-SEX',
      dailyHours: new Prisma.Decimal('8.0'),
      weeklyHours: new Prisma.Decimal('40.0'),
      status: 'ACTIVO',
      approvedBy: userTecnico.name,
      approvedAt: new Date('2024-01-15'),
      createdBy: userTecnico.name,
    },
  })

  // Histórico de carreira inicial
  await prisma.hrCareerHistory.createMany({
    data: [
      {
        employeeId: empTecnico.id,
        position: cargoRh.title,
        department: depRh.name,
        salary: new Prisma.Decimal('550000.00'),
        changeReason: 'Admissão Inicial',
        changeDate: new Date('2023-02-01'),
        registeredBy: userAdmin.name,
      },
      {
        employeeId: empEng.id,
        position: cargoTelco.title,
        department: depEng.name,
        salary: new Prisma.Decimal('450000.00'),
        changeReason: 'Admissão Inicial',
        changeDate: new Date('2024-01-15'),
        registeredBy: userTecnico.name,
      },
      {
        employeeId: empApoio.id,
        position: cargoSuporte.title,
        department: depRh.name,
        salary: new Prisma.Decimal('280000.00'),
        changeReason: 'Admissão Inicial',
        changeDate: new Date('2024-06-01'),
        registeredBy: userTecnico.name,
      },
    ],
  }).catch(() => undefined)

  // Configuração global
  await prisma.hrConfig.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      contractAlertDays: 30,
      documentAlertDays: 30,
      notifyEmail: 'rh@jmatos.co.ao',
      whatsappEnabled: false,
    },
  })

  console.log('✅ [SEED RH] Seed de Recursos Humanos J.Matos concluído com sucesso!')
  console.log('---------------------------------------------------------')
  console.log('👤 Administrador:  admin.rh@jmatos.co.ao')
  console.log('👤 Técnico de RH:   tecnico.rh@jmatos.co.ao')
  console.log('👤 Funcionário:     colaborador@jmatos.co.ao')
  console.log('---------------------------------------------------------')
}

main()
  .catch((e) => {
    console.error('❌ [SEED RH] Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
