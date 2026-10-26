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
    update: { userId: userTecnico.id, employeeNumber: 'JM-001', email: 'tecnico.rh@jmatos.co.ao' },
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
    update: { userId: userFuncionario.id, employeeNumber: 'JM-002', email: 'colaborador@jmatos.co.ao' },
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
    update: { employeeNumber: 'JM-003', email: 'helena.baptista@jmatos.co.ao' },
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
  // Limpeza de contratos com prefixo antigo para prevenir duplicados
  await prisma.hrContract.deleteMany({
    where: { contractNumber: { startsWith: 'ARK-CTR-' } },
  })

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

  // Configuração global (Fase 1 + Fase 2)
  await prisma.hrConfig.upsert({
    where: { id: 'global' },
    update: {
      punctualityToleranceMinutes: 10,
      roundingMinutes: 0,
      checkInReminderMinutes: 15,
      gpsRetentionMonths: 12,
      annualLeaveDaysDefault: 22,
    },
    create: {
      id: 'global',
      contractAlertDays: 30,
      documentAlertDays: 30,
      notifyEmail: 'rh@jmatos.co.ao',
      whatsappEnabled: false,
      punctualityToleranceMinutes: 10,
      roundingMinutes: 0,
      checkInReminderMinutes: 15,
      gpsRetentionMonths: 12,
      annualLeaveDaysDefault: 22,
    },
  })

  // =============================================================
  // FASE 2: PONTO E AUSÊNCIAS (SEEDS)
  // =============================================================
  console.log('📌 [SEED RH - FASE 2] Criando Locais de Trabalho (Geofencing)...')
  const locSede = await prisma.hrWorkLocation.upsert({
    where: { id: 'loc-luanda-sede' },
    update: {},
    create: {
      id: 'loc-luanda-sede',
      name: 'Sede Central J.Matos — Garden Towers (Luanda)',
      latitude: -8.8271,
      longitude: 13.2439,
      radiusMeters: 150.0,
      verificationMode: 'INFORMATIVO',
      active: true,
    },
  })

  const locTalatona = await prisma.hrWorkLocation.upsert({
    where: { id: 'loc-talatona' },
    update: {},
    create: {
      id: 'loc-talatona',
      name: 'Polo Tecnológico J.Matos / ARKNET — Talatona',
      latitude: -8.9172,
      longitude: 13.1895,
      radiusMeters: 200.0,
      verificationMode: 'INFORMATIVO',
      active: true,
    },
  })

  const locViana = await prisma.hrWorkLocation.upsert({
    where: { id: 'loc-viana' },
    update: {},
    create: {
      id: 'loc-viana',
      name: 'Centro de Operações e Armazém — Viana',
      latitude: -8.9034,
      longitude: 13.3712,
      radiusMeters: 250.0,
      verificationMode: 'INFORMATIVO',
      active: true,
    },
  })

  // Associação de colaboradores a locais autorizados
  await prisma.hrEmployeeWorkLocation.deleteMany({})
  await prisma.hrEmployeeWorkLocation.createMany({
    data: [
      { employeeId: empTecnico.id, workLocationId: locSede.id },
      { employeeId: empEng.id, workLocationId: locSede.id },
      { employeeId: empEng.id, workLocationId: locTalatona.id },
      { employeeId: empApoio.id, workLocationId: locSede.id },
    ],
  })

  console.log('📌 [SEED RH - FASE 2] Criando Tipos de Licença (LGT Angola)...')
  const leaveTypesData = [
    { code: 'FERIAS', name: 'Férias Remuneradas', isPaid: true, deductsFromBalance: true, requiresDocument: false, maxDays: 22, order: 1 },
    { code: 'DOENCA', name: 'Baixa Médica / Incapacidade Temporária', isPaid: true, deductsFromBalance: false, requiresDocument: true, maxDays: null, order: 2 },
    { code: 'MATERNIDADE', name: 'Licença de Maternidade', isPaid: true, deductsFromBalance: false, requiresDocument: true, maxDays: 90, order: 3 },
    { code: 'PATERNIDADE', name: 'Licença de Paternidade', isPaid: true, deductsFromBalance: false, requiresDocument: true, maxDays: 3, order: 4 },
    { code: 'CASAMENTO', name: 'Licença por Casamento', isPaid: true, deductsFromBalance: false, requiresDocument: true, maxDays: 8, order: 5 },
    { code: 'LUTO', name: 'Luto / Falecimento de Familiar', isPaid: true, deductsFromBalance: false, requiresDocument: true, maxDays: 8, order: 6 },
    { code: 'ESTUDOS', name: 'Dispensa para Exames / Formação', isPaid: true, deductsFromBalance: false, requiresDocument: true, maxDays: null, order: 7 },
    { code: 'SEM_VENCIMENTO', name: 'Licença Sem Vencimento', isPaid: false, deductsFromBalance: false, requiresDocument: false, maxDays: null, order: 8 },
    { code: 'OUTRA', name: 'Outra Ausência Justificada', isPaid: true, deductsFromBalance: false, requiresDocument: true, maxDays: null, order: 9 },
  ]

  for (const lt of leaveTypesData) {
    await prisma.hrLeaveType.upsert({
      where: { code: lt.code },
      update: lt,
      create: lt,
    })
  }

  console.log('📌 [SEED RH - FASE 2] Criando Feriados Oficiais de Angola (2026)...')
  const holidaysData = [
    { date: '2026-01-01', name: 'Ano Novo', isRecurring: true, status: 'CONFIRMADO' },
    { date: '2026-02-04', name: 'Dia do Início da Luta Armada de Libertação Nacional', isRecurring: true, status: 'CONFIRMADO' },
    { date: '2026-02-17', name: 'Terça-feira de Carnaval', isRecurring: false, status: 'CONFIRMADO' },
    { date: '2026-03-08', name: 'Dia Internacional da Mulher', isRecurring: true, status: 'CONFIRMADO' },
    { date: '2026-04-03', name: 'Sexta-feira Santa', isRecurring: false, status: 'CONFIRMADO' },
    { date: '2026-04-04', name: 'Dia da Paz e da Reconciliação Nacional', isRecurring: true, status: 'CONFIRMADO' },
    { date: '2026-05-01', name: 'Dia Internacional do Trabalhador', isRecurring: true, status: 'CONFIRMADO' },
    { date: '2026-09-17', name: 'Dia do Fundador da Nação e do Herói Nacional', isRecurring: true, status: 'CONFIRMADO' },
    { date: '2026-11-02', name: 'Dia de Finados', isRecurring: true, status: 'CONFIRMADO' },
    { date: '2026-11-11', name: 'Dia da Independência Nacional', isRecurring: true, status: 'CONFIRMADO' },
    { date: '2026-12-25', name: 'Dia de Natal e da Família', isRecurring: true, status: 'CONFIRMADO' },
  ]

  for (const h of holidaysData) {
    await prisma.hrHoliday.upsert({
      where: { date: h.date },
      update: h,
      create: h,
    })
  }

  console.log('📌 [SEED RH - FASE 2] Atribuindo Saldos de Férias 2026...')
  const yearCurrent = 2026
  await prisma.hrLeaveBalance.upsert({
    where: { employeeId_year: { employeeId: empTecnico.id, year: yearCurrent } },
    update: { entitledDays: 22, usedDays: 0, pendingDays: 0 },
    create: { employeeId: empTecnico.id, year: yearCurrent, entitledDays: 22, usedDays: 0, pendingDays: 0 },
  })

  await prisma.hrLeaveBalance.upsert({
    where: { employeeId_year: { employeeId: empEng.id, year: yearCurrent } },
    update: { entitledDays: 22, usedDays: 5, pendingDays: 0 },
    create: { employeeId: empEng.id, year: yearCurrent, entitledDays: 22, usedDays: 5, pendingDays: 0 },
  })

  await prisma.hrLeaveBalance.upsert({
    where: { employeeId_year: { employeeId: empApoio.id, year: yearCurrent } },
    update: { entitledDays: 22, usedDays: 0, pendingDays: 3 },
    create: { employeeId: empApoio.id, year: yearCurrent, entitledDays: 22, usedDays: 0, pendingDays: 3 },
  })

  console.log('📌 [SEED RH - FASE 2] Criando Pedidos de Ausência Demonstrativos...')
  const tipoFerias = await prisma.hrLeaveType.findUnique({ where: { code: 'FERIAS' } })
  if (tipoFerias) {
    // Pedido 1: Gozado em Fevereiro pelo Engenheiro (Aprovado)
    await prisma.hrLeaveRequest.upsert({
      where: { id: 'req-leave-eng-001' },
      update: {},
      create: {
        id: 'req-leave-eng-001',
        employeeId: empEng.id,
        leaveTypeId: tipoFerias.id,
        startDate: new Date('2026-02-09T00:00:00.000Z'),
        endDate: new Date('2026-02-13T23:59:59.000Z'),
        workingDaysCount: 5,
        reason: 'Férias de descanso programadas do primeiro trimestre.',
        status: 'APROVADO',
        reviewedById: userTecnico.id,
        reviewedByName: userTecnico.name,
        reviewComment: 'Aprovado conforme planeamento do departamento.',
        reviewedAt: new Date('2026-01-20T10:00:00.000Z'),
      },
    })

    // Pedido 2: Pedido Pendente de Férias da Apoio ao Cliente
    await prisma.hrLeaveRequest.upsert({
      where: { id: 'req-leave-apoio-001' },
      update: {},
      create: {
        id: 'req-leave-apoio-001',
        employeeId: empApoio.id,
        leaveTypeId: tipoFerias.id,
        startDate: new Date('2026-11-16T00:00:00.000Z'),
        endDate: new Date('2026-11-18T23:59:59.000Z'),
        workingDaysCount: 3,
        reason: 'Descanso pós-lançamento da nova infraestrutura.',
        status: 'PENDENTE',
      },
    })
  }

  console.log('📌 [SEED RH - FASE 2] Criando Registos de Ponto Demonstrativos...')
  // Dia de trabalho demonstrativo para o Engenheiro (hoje ou data fixa de referência)
  const todayStr = '2026-10-26'
  const workDayEng = await prisma.hrWorkDay.upsert({
    where: { employeeId_date: { employeeId: empEng.id, date: todayStr } },
    update: {},
    create: {
      employeeId: empEng.id,
      date: todayStr,
      actualIn: new Date(`${todayStr}T07:58:00.000Z`), // UTC (08:58 Luanda)
      actualOut: new Date(`${todayStr}T17:02:00.000Z`),
      totalMinutesWorked: 484,
      delayMinutes: 0,
      earlyDepartureMinutes: 0,
      overtimeMinutes: 4,
      overtimeStatus: 'SEM_HORA_EXTRA',
      status: 'NORMAL',
      isComplete: true,
    },
  })

  // Registos de ponto detalhados
  await prisma.hrTimeEntry.deleteMany({ where: { employeeId: empEng.id } })
  await prisma.hrTimeEntry.createMany({
    data: [
      {
        employeeId: empEng.id,
        workDayId: workDayEng.id,
        type: 'ENTRADA',
        serverTime: new Date(`${todayStr}T07:58:00.000Z`),
        origin: 'PORTAL',
        authorId: userFuncionario.id,
        authorName: userFuncionario.name,
        latitude: -8.82712,
        longitude: 13.24391,
        accuracyMeters: 12.5,
        isWithinRadius: true,
        locationId: locSede.id,
        clientRequestId: `seed-clk-${empEng.id}-in`,
      },
      {
        employeeId: empEng.id,
        workDayId: workDayEng.id,
        type: 'INICIO_PAUSA',
        serverTime: new Date(`${todayStr}T11:30:00.000Z`),
        origin: 'PORTAL',
        authorId: userFuncionario.id,
        authorName: userFuncionario.name,
        latitude: -8.82715,
        longitude: 13.24388,
        accuracyMeters: 10.0,
        isWithinRadius: true,
        locationId: locSede.id,
        clientRequestId: `seed-clk-${empEng.id}-p1`,
      },
      {
        employeeId: empEng.id,
        workDayId: workDayEng.id,
        type: 'FIM_PAUSA',
        serverTime: new Date(`${todayStr}T12:30:00.000Z`),
        origin: 'PORTAL',
        authorId: userFuncionario.id,
        authorName: userFuncionario.name,
        latitude: -8.82710,
        longitude: 13.24395,
        accuracyMeters: 14.2,
        isWithinRadius: true,
        locationId: locSede.id,
        clientRequestId: `seed-clk-${empEng.id}-p2`,
      },
      {
        employeeId: empEng.id,
        workDayId: workDayEng.id,
        type: 'SAIDA',
        serverTime: new Date(`${todayStr}T17:02:00.000Z`),
        origin: 'PORTAL',
        authorId: userFuncionario.id,
        authorName: userFuncionario.name,
        latitude: -8.82711,
        longitude: 13.24390,
        accuracyMeters: 11.0,
        isWithinRadius: true,
        locationId: locSede.id,
        clientRequestId: `seed-clk-${empEng.id}-out`,
      },
    ],
  })

  console.log('📌 [SEED RH] Fase 3A: Criando Períodos de Ponto e Folhas Mensais...')

  // Período 2026-09 (Fechado)
  const periodSet = await (prisma as any).hrTimesheetPeriod.upsert({
    where: { code: '2026-09' },
    update: {},
    create: {
      code: '2026-09',
      year: 2026,
      month: 9,
      status: 'FECHADO',
      version: 1,
      closedAt: new Date('2026-10-02T10:00:00.000Z'),
      closedById: userAdmin.id,
      closedByName: userAdmin.name,
      closeNotes: 'Fecho do período de Setembro/2026 concluído com sucesso.',
    },
  })

  // Folha de Setembro (BLOQUEADA)
  const tsSetEng = await (prisma as any).hrTimesheet.upsert({
    where: { periodId_employeeId: { periodId: periodSet.id, employeeId: empEng.id } },
    update: {},
    create: {
      periodId: periodSet.id,
      employeeId: empEng.id,
      status: 'BLOQUEADA',
      expectedWorkDays: 22,
      workedDays: 22,
      totalMinutesWorked: 10560, // 176h
      delayCount: 0,
      delayMinutes: 0,
      earlyDepartureMinutes: 0,
      unjustifiedAbsenceDays: 0,
      justifiedAbsenceDays: 0,
      paidLeaveDays: 0,
      unpaidLeaveDays: 0,
      holidayDays: 1,
      approvedOvertimeMinutes: 120, // 2h
      pendingOvertimeMinutes: 0,
      rejectedOvertimeMinutes: 0,
      missingExitDays: 0,
      outsideAreaDays: 0,
      rulesSnapshot: JSON.stringify({ punctualityToleranceMinutes: 15, workDaysScheme: 'SEG-SEX', dailyMinutes: 480 }),
      submittedAt: new Date('2026-09-30T17:30:00.000Z'),
      approvedAt: new Date('2026-10-01T14:00:00.000Z'),
      approvedById: userTecnico.id,
      approvedByName: userTecnico.name,
      approvalNote: 'Aprovada após conferência mensal',
    },
  })

  // Snapshot do período Setembro
  await (prisma as any).hrTimesheetVersionSnapshot.upsert({
    where: { periodId_version: { periodId: periodSet.id, version: 1 } },
    update: {},
    create: {
      periodId: periodSet.id,
      version: 1,
      createdById: userAdmin.id,
      createdByName: userAdmin.name,
      notes: 'Fecho mensal de Setembro/2026',
      snapshotData: JSON.stringify({
        periodCode: '2026-09',
        version: 1,
        totalSheets: 1,
        totals: {
          totalMinutesWorked: 10560,
          approvedOvertimeMinutes: 120,
          unjustifiedAbsenceDays: 0,
        },
      }),
    },
  })

  // Período 2026-10 (Aberto — corrente)
  const periodOut = await (prisma as any).hrTimesheetPeriod.upsert({
    where: { code: '2026-10' },
    update: {},
    create: {
      code: '2026-10',
      year: 2026,
      month: 10,
      status: 'ABERTO',
      version: 1,
    },
  })

  // Folha de Outubro para empEng (ABERTA com detalhe diário)
  const tsOutEng = await (prisma as any).hrTimesheet.upsert({
    where: { periodId_employeeId: { periodId: periodOut.id, employeeId: empEng.id } },
    update: {},
    create: {
      periodId: periodOut.id,
      employeeId: empEng.id,
      status: 'ABERTA',
      expectedWorkDays: 22,
      workedDays: 17,
      totalMinutesWorked: 8160,
      delayCount: 1,
      delayMinutes: 15,
      earlyDepartureMinutes: 0,
      unjustifiedAbsenceDays: 0,
      justifiedAbsenceDays: 0,
      paidLeaveDays: 0,
      unpaidLeaveDays: 0,
      holidayDays: 0,
      approvedOvertimeMinutes: 60,
      pendingOvertimeMinutes: 0,
      rejectedOvertimeMinutes: 0,
      missingExitDays: 0,
      outsideAreaDays: 0,
      rulesSnapshot: JSON.stringify({ punctualityToleranceMinutes: 15, workDaysScheme: 'SEG-SEX', dailyMinutes: 480 }),
    },
  })

  // Detalhe de alguns dias para visualização na folha de Outubro
  await (prisma as any).hrTimesheetDayDetail.deleteMany({
    where: { timesheetId: tsOutEng.id },
  })

  const sampleDays = [
    {
      timesheetId: tsOutEng.id,
      date: '2026-10-01',
      dayOfWeek: 4,
      isExpectedWorkDay: true,
      scheduledDailyMinutes: 480,
      actualIn: new Date('2026-10-01T07:58:00.000Z'),
      actualOut: new Date('2026-10-01T17:05:00.000Z'),
      minutesWorked: 480,
      delayMinutes: 0,
      earlyDepartureMinutes: 0,
      overtimeMinutes: 0,
      overtimeStatus: 'SEM_HORA_EXTRA',
      status: 'PRESENTE',
      hasMissingExit: false,
      isOutsideArea: false,
    },
    {
      timesheetId: tsOutEng.id,
      date: '2026-10-02',
      dayOfWeek: 5,
      isExpectedWorkDay: true,
      scheduledDailyMinutes: 480,
      actualIn: new Date('2026-10-02T08:15:00.000Z'),
      actualOut: new Date('2026-10-02T17:00:00.000Z'),
      minutesWorked: 465,
      delayMinutes: 15,
      earlyDepartureMinutes: 0,
      overtimeMinutes: 0,
      overtimeStatus: 'SEM_HORA_EXTRA',
      status: 'ATRASO',
      hasMissingExit: false,
      isOutsideArea: false,
    },
    {
      timesheetId: tsOutEng.id,
      date: '2026-10-03',
      dayOfWeek: 6,
      isExpectedWorkDay: false,
      scheduledDailyMinutes: 0,
      actualIn: null,
      actualOut: null,
      minutesWorked: 0,
      delayMinutes: 0,
      earlyDepartureMinutes: 0,
      overtimeMinutes: 0,
      overtimeStatus: 'SEM_HORA_EXTRA',
      status: 'FOLGA',
      hasMissingExit: false,
      isOutsideArea: false,
    },
    {
      timesheetId: tsOutEng.id,
      date: '2026-10-04',
      dayOfWeek: 0,
      isExpectedWorkDay: false,
      scheduledDailyMinutes: 0,
      actualIn: null,
      actualOut: null,
      minutesWorked: 0,
      delayMinutes: 0,
      earlyDepartureMinutes: 0,
      overtimeMinutes: 0,
      overtimeStatus: 'SEM_HORA_EXTRA',
      status: 'FOLGA',
      hasMissingExit: false,
      isOutsideArea: false,
    },
    {
      timesheetId: tsOutEng.id,
      date: '2026-10-05',
      dayOfWeek: 1,
      isExpectedWorkDay: true,
      scheduledDailyMinutes: 480,
      actualIn: new Date('2026-10-05T07:55:00.000Z'),
      actualOut: new Date('2026-10-05T18:05:00.000Z'),
      minutesWorked: 540,
      delayMinutes: 0,
      earlyDepartureMinutes: 0,
      overtimeMinutes: 60,
      overtimeStatus: 'APROVADO',
      status: 'PRESENTE',
      hasMissingExit: false,
      isOutsideArea: false,
    },
  ]

  for (const d of sampleDays) {
    await (prisma as any).hrTimesheetDayDetail.create({ data: d })
  }

  console.log('✅ [SEED RH] Seed de Recursos Humanos J.Matos (Fases 1, 2 e 3A) concluído com sucesso!')
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
