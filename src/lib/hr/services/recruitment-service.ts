import { prisma } from '@/lib/prisma'
import { HrUserContext, assertCan } from '../permissions'
import { logAudit } from '../audit'

// ──────────────────────────────────────────────────────────────
// GESTÃO DE RECRUTAMENTO & ATS INTEGRADO (FASE 7)
// ──────────────────────────────────────────────────────────────

export async function listJobOpenings() {
  if (!(prisma as any).hrJobOpening) return []
  return await (prisma as any).hrJobOpening.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      department: { select: { name: true } },
      position: { select: { title: true } },
      _count: { select: { candidates: true } },
    },
  })
}

export async function createJobOpening(
  data: {
    title: string
    departmentId?: string
    positionId?: string
    type?: string
    location?: string
    openingsCount?: number
    requirements?: string
    salaryRangeMin?: number
    salaryRangeMax?: number
    closingDate?: Date
  },
  actor: HrUserContext
) {
  assertCan(actor, 'GERIR_VAGAS')

  if (!(prisma as any).hrJobOpening) {
    throw new Error('Módulo de vagas em inicialização no servidor. Por favor recarregue.')
  }

  const opening = await (prisma as any).hrJobOpening.create({
    data: {
      title: data.title,
      departmentId: data.departmentId || null,
      positionId: data.positionId || null,
      type: data.type || 'FULL_TIME',
      location: data.location || 'Luanda',
      openingsCount: data.openingsCount || 1,
      status: 'ABERTA',
      requirements: data.requirements,
      salaryRangeMin: data.salaryRangeMin,
      salaryRangeMax: data.salaryRangeMax,
      closingDate: data.closingDate,
    },
  })

  await logAudit({
    userId: actor.id,
    userName: actor.name || actor.email,
    userRole: actor.role,
    action: 'CRIAR',
    resource: 'VAGA_EMPREGO',
    resourceId: opening.id,
    details: `Abertura da vaga de emprego "${opening.title}" (${opening.openingsCount} vaga(s)).`,
  })

  return opening
}

export async function listCandidates(jobOpeningId?: string) {
  if (!(prisma as any).hrCandidate) return []
  const where: any = {}
  if (jobOpeningId) where.jobOpeningId = jobOpeningId

  return await (prisma as any).hrCandidate.findMany({
    where,
    include: {
      jobOpening: {
        select: {
          id: true,
          title: true,
          department: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createCandidate(data: {
  jobOpeningId?: string
  fullName: string
  email: string
  phone: string
  biNumber?: string
  experienceYears?: number
  resumeUrl?: string
  notes?: string
}) {
  return await (prisma as any).hrCandidate.create({
    data: {
      jobOpeningId: data.jobOpeningId || null,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      biNumber: data.biNumber,
      experienceYears: data.experienceYears || 0,
      resumeUrl: data.resumeUrl,
      notes: data.notes,
      status: 'NOVO',
    },
  })
}

export async function updateCandidateStatus(
  candidateId: string,
  status: string,
  actor: HrUserContext
) {
  assertCan(actor, 'GERIR_CANDIDATOS')

  const candidate = await (prisma as any).hrCandidate.update({
    where: { id: candidateId },
    data: { status },
  })

  await logAudit({
    userId: actor.id,
    userName: actor.name || actor.email,
    userRole: actor.role,
    action: 'MUDAR_ESTADO',
    resource: 'CANDIDATO',
    resourceId: candidate.id,
    details: `Estado do candidato ${candidate.fullName} alterado para "${status}".`,
  })

  return candidate
}

/**
 * Admissão 1-Clique: Converte um candidato aprovado em Funcionário Efectivo
 * Cria a ficha HrEmployee e o contrato inicial HrContract na mesma transação.
 */
export async function admitCandidateAsEmployee(
  candidateId: string,
  data: {
    departmentId: string
    positionId: string
    employeeNumber: string
    biNumber: string
    birthDate: Date
    admissionDate: Date
    baseSalary: number
    contractType: string // "INDETERMINADO" | "DETERMINADO" | "ESTAGIO"
    contractEndDate?: Date
    address: string
    bankName?: string
    bankIban?: string
    bankAccountNumber?: string
  },
  actor: HrUserContext
) {
  assertCan(actor, 'ADMITIR_CANDIDATO')

  const candidate = await (prisma as any).hrCandidate.findUnique({
    where: { id: candidateId },
  })
  if (!candidate) throw new Error('Candidato não encontrado.')

  return await prisma.$transaction(async (tx) => {
    // 1. Criar ficha de funcionário
    const employee = await (tx as any).hrEmployee.create({
      data: {
        employeeNumber: data.employeeNumber,
        fullName: candidate.fullName,
        biNumber: data.biNumber,
        birthDate: data.birthDate,
        phone: candidate.phone,
        email: candidate.email,
        address: data.address,
        city: 'Luanda',
        province: 'Luanda',
        bankName: data.bankName || 'BFA',
        bankIban: data.bankIban || null,
        bankAccountNumber: data.bankAccountNumber || null,
        admissionDate: data.admissionDate,
        status: 'ACTIVO',
        departmentId: data.departmentId,
        positionId: data.positionId,
      },
    })

    // 2. Criar contrato de trabalho
    const now = new Date()
    const contractNumber = `CTR-${now.getFullYear()}-${data.employeeNumber}`
    const contract = await (tx as any).hrContract.create({
      data: {
        contractNumber,
        employeeId: employee.id,
        type: data.contractType,
        startDate: data.admissionDate,
        endDate: data.contractEndDate || null,
        baseSalary: data.baseSalary,
        workDays: 'SEG-SEX',
        dailyHours: 8.0,
        weeklyHours: 40.0,
        status: 'ACTIVO',
        approvedBy: actor.name || actor.email,
        approvedAt: now,
        createdBy: actor.name || actor.email,
      },
    })

    // 3. Criar histórico de carreira inicial
    await (tx as any).hrCareerHistory.create({
      data: {
        employeeId: employee.id,
        position: 'Cargo Inicial',
        department: 'Departamento Inicial',
        salary: data.baseSalary,
        changeReason: 'Admissão via Recrutamento / ATS',
        registeredBy: actor.name || actor.email,
      },
    })

    // 4. Actualizar estado do candidato para ADMITIDO
    await (tx as any).hrCandidate.update({
      where: { id: candidate.id },
      data: {
        status: 'ADMITIDO',
        admittedAsId: employee.id,
      },
    })

    // 5. Registar auditoria
    await logAudit(
      {
        userId: actor.id,
        userName: actor.name || actor.email,
        userRole: actor.role,
        action: 'ADMITIR',
        resource: 'FUNCIONARIO',
        resourceId: employee.id,
        details: `Candidato ${candidate.fullName} admitido com sucesso. Ficha de colaborador ${employee.employeeNumber} e contrato ${contractNumber} gerados.`,
      },
      tx
    )

    return { employee, contract }
  })
}
