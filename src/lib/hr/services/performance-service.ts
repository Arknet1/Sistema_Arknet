import { prisma } from '@/lib/prisma'
import { HrUserContext, assertCan } from '../permissions'
import { logAudit } from '../audit'

// ──────────────────────────────────────────────────────────────
// 1. GESTÃO DE CICLOS E AVALIAÇÕES DE DESEMPENHO (FASE 6)
// ──────────────────────────────────────────────────────────────

export async function listPerformanceCycles() {
  if (!(prisma as any).hrPerformanceCycle) return []
  return await (prisma as any).hrPerformanceCycle.findMany({
    orderBy: { year: 'desc' },
    include: {
      _count: { select: { reviews: true } },
    },
  })
}

export async function createPerformanceCycle(
  data: {
    title: string
    year: number
    startDate: Date
    endDate: Date
    notes?: string
  },
  actor: HrUserContext
) {
  assertCan(actor, 'GERIR_CICLOS_DESEMPENHO')

  return await prisma.$transaction(async (tx) => {
    const cycle = await (tx as any).hrPerformanceCycle.create({
      data: {
        title: data.title,
        year: data.year,
        status: 'ACTIVO',
        startDate: data.startDate,
        endDate: data.endDate,
        notes: data.notes,
      },
    })

    // Gerar fichas de avaliação para todos os colaboradores activos
    const activeEmployees = await (tx as any).hrEmployee.findMany({
      where: { status: 'ACTIVO' },
      select: { id: true, directSupervisorId: true },
    })

    for (const emp of activeEmployees) {
      await (tx as any).hrPerformanceReview.create({
        data: {
          cycleId: cycle.id,
          employeeId: emp.id,
          reviewerId: emp.directSupervisorId || null,
          status: 'PENDENTE_AUTO',
        },
      })
    }

    await logAudit(
      {
        userId: actor.id,
        userName: actor.name || actor.email,
        userRole: actor.role,
        action: 'CRIAR',
        resource: 'CICLO_DESEMPENHO',
        resourceId: cycle.id,
        details: `Criação do ciclo de avaliação "${cycle.title}" (${data.year}) com ${activeEmployees.length} colaboradores associados.`,
      },
      tx
    )

    return cycle
  })
}

export async function getPerformanceCycle(cycleId: string) {
  return await (prisma as any).hrPerformanceCycle.findUnique({
    where: { id: cycleId },
    include: {
      reviews: {
        include: {
          employee: {
            select: {
              id: true,
              fullName: true,
              employeeNumber: true,
              department: { select: { name: true } },
              position: { select: { title: true } },
            },
          },
        },
        orderBy: { employee: { fullName: 'asc' } },
      },
    },
  })
}

export async function submitSelfReview(
  reviewId: string,
  data: { rating: number; comments: string },
  actor: HrUserContext
) {
  assertCan(actor, 'SUBMETER_AUTO_AVALIACAO')

  const review = await (prisma as any).hrPerformanceReview.findUnique({
    where: { id: reviewId },
  })
  if (!review) throw new Error('Avaliação de desempenho não encontrada.')

  // Validação: Colaborador só pode auto-avaliar a sua própria ficha
  if (actor.role === 'FUNCIONARIO' && actor.employeeId !== review.employeeId) {
    throw new Error('Acesso negado: Não pode submeter auto-avaliação de outro colaborador.')
  }

  const updated = await (prisma as any).hrPerformanceReview.update({
    where: { id: reviewId },
    data: {
      selfRating: data.rating,
      selfComments: data.comments,
      selfSubmittedAt: new Date(),
      status: 'PENDENTE_AVALIADOR',
    },
  })

  await logAudit({
    userId: actor.id,
    userName: actor.name || actor.email,
    userRole: actor.role,
    action: 'SUBMETER',
    resource: 'AVALIACAO_DESEMPENHO',
    resourceId: review.id,
    details: `Submissão de auto-avaliação de desempenho (Nota: ${data.rating}/5).`,
  })

  return updated
}

export async function submitManagerReview(
  reviewId: string,
  data: {
    managerRating: number
    managerComments: string
    objectivesRating: number
    competenciesRating: number
    strengths?: string
    areasToImprove?: string
    developmentPlan?: string
  },
  actor: HrUserContext
) {
  assertCan(actor, 'AVALIAR_COLABORADOR')

  const review = await (prisma as any).hrPerformanceReview.findUnique({
    where: { id: reviewId },
  })
  if (!review) throw new Error('Ficha de avaliação não encontrada.')

  // Regra dos 4 Olhos: Ninguém avalia a si próprio como gestor
  if (actor.employeeId && actor.employeeId === review.employeeId) {
    throw new Error('Regra dos 4 Olhos: Não é permitido avaliar a si próprio como chefia ou avaliador.')
  }

  // Pontuação final ponderada (50% objectivos + 50% competências)
  const finalScore = Math.round(((data.objectivesRating + data.competenciesRating) / 2) * 10) / 10

  let performanceBand = 'SATISFATORIO'
  if (finalScore >= 4.5) performanceBand = 'EXCELENTE'
  else if (finalScore >= 3.5) performanceBand = 'BOM'
  else if (finalScore >= 2.5) performanceBand = 'SATISFATORIO'
  else performanceBand = 'NECESSITA_MELHORIA'

  const updated = await (prisma as any).hrPerformanceReview.update({
    where: { id: reviewId },
    data: {
      reviewerId: actor.id,
      reviewerName: actor.name || actor.email,
      managerRating: data.managerRating,
      managerComments: data.managerComments,
      objectivesRating: data.objectivesRating,
      competenciesRating: data.competenciesRating,
      finalScore,
      performanceBand,
      strengths: data.strengths || null,
      areasToImprove: data.areasToImprove || null,
      developmentPlan: data.developmentPlan || null,
      managerSubmittedAt: new Date(),
      completedAt: new Date(),
      status: 'CONCLUIDO',
    },
  })

  await logAudit({
    userId: actor.id,
    userName: actor.name || actor.email,
    userRole: actor.role,
    action: 'AVALIAR',
    resource: 'AVALIACAO_DESEMPENHO',
    resourceId: review.id,
    details: `Avaliação de desempenho concluída pelo avaliador. Nota final: ${finalScore}/5 (${performanceBand}).`,
  })

  return updated
}

// ──────────────────────────────────────────────────────────────
// 2. GESTÃO DE CERTIFICAÇÕES E FORMAÇÃO (FASE 6)
// ──────────────────────────────────────────────────────────────

export async function listCertifications(employeeId?: string) {
  if (!(prisma as any).hrCertification) return []
  const where: any = {}
  if (employeeId) where.employeeId = employeeId

  return await (prisma as any).hrCertification.findMany({
    where,
    include: {
      employee: {
        select: {
          id: true,
          fullName: true,
          employeeNumber: true,
          department: { select: { name: true } },
          position: { select: { title: true } },
        },
      },
    },
    orderBy: { issueDate: 'desc' },
  })
}

export async function createCertification(
  data: {
    employeeId: string
    title: string
    issuingEntity: string
    licenseNumber?: string
    issueDate: Date
    expiryDate?: Date
    attachmentUrl?: string
    notes?: string
  },
  actor: HrUserContext
) {
  assertCan(actor, 'GERIR_CERTIFICACOES')

  const cert = await (prisma as any).hrCertification.create({
    data: {
      employeeId: data.employeeId,
      title: data.title,
      issuingEntity: data.issuingEntity,
      licenseNumber: data.licenseNumber,
      issueDate: data.issueDate,
      expiryDate: data.expiryDate,
      attachmentUrl: data.attachmentUrl,
      notes: data.notes,
      status: data.expiryDate && data.expiryDate < new Date() ? 'EXPIRADA' : 'VALIDA',
    },
  })

  await logAudit({
    userId: actor.id,
    userName: actor.name || actor.email,
    userRole: actor.role,
    action: 'CRIAR',
    resource: 'CERTIFICACAO',
    resourceId: cert.id,
    details: `Registo de certificação profissional "${cert.title}" emitida por ${cert.issuingEntity}.`,
  })

  return cert
}

export async function listTrainingCourses() {
  if (!(prisma as any).hrTrainingCourse) return []
  return await (prisma as any).hrTrainingCourse.findMany({
    orderBy: { startDate: 'desc' },
  })
}

export async function createTrainingCourse(
  data: {
    title: string
    provider: string
    durationHours: number
    category: string
    startDate: Date
    endDate?: Date
    participantsCount?: number
    location?: string
    notes?: string
  },
  actor: HrUserContext
) {
  assertCan(actor, 'GERIR_CERTIFICACOES')

  const course = await (prisma as any).hrTrainingCourse.create({
    data: {
      title: data.title,
      provider: data.provider,
      durationHours: data.durationHours,
      category: data.category,
      startDate: data.startDate,
      endDate: data.endDate,
      participantsCount: data.participantsCount || 0,
      location: data.location || 'Sede ARKNET Luanda',
      notes: data.notes,
      status: 'PLANEADO',
    },
  })

  await logAudit({
    userId: actor.id,
    userName: actor.name || actor.email,
    userRole: actor.role,
    action: 'CRIAR',
    resource: 'CURSO_FORMACAO',
    resourceId: course.id,
    details: `Registo de acção de formação "${course.title}" com carga horária de ${course.durationHours}h.`,
  })

  return course
}
