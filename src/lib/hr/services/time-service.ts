import { PrismaClient, Prisma } from '@prisma/client'
import { isWithinLocationRadius } from './geo-service'
import { logAudit } from '../audit'
import { HrUserContext, can, canApproveRequest } from '../permissions'
export { isWorkingDayOfWeek } from './leave-service'

const prisma = new PrismaClient()

export type TimeEntryType = 'ENTRADA' | 'INICIO_PAUSA' | 'FIM_PAUSA' | 'SAIDA'

/**
 * Converte data UTC para a data civil correspondente no fuso horário de Luanda (Africa/Luanda, UTC+1)
 * Formato retornado: "AAAA-MM-DD"
 */
export function getLuandaDateString(date: Date = new Date()): string {
  // Luanda é UTC+1 durante todo o ano (sem DST)
  const luandaOffsetMs = 1 * 60 * 60 * 1000
  const luandaTime = new Date(date.getTime() + luandaOffsetMs)
  return luandaTime.toISOString().split('T')[0]
}

/**
 * Retorna as horas e minutos em Luanda formatadas "HH:MM"
 */
export function getLuandaTimeString(date: Date = new Date()): string {
  const luandaOffsetMs = 1 * 60 * 60 * 1000
  const luandaTime = new Date(date.getTime() + luandaOffsetMs)
  const hours = String(luandaTime.getUTCHours()).padStart(2, '0')
  const minutes = String(luandaTime.getUTCMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Aplica regra de arredondamento em minutos (0, 5, 10 ou 15)
 */
export function applyRounding(minutes: number, roundingStep: number): number {
  if (!roundingStep || roundingStep <= 0) return minutes
  return Math.round(minutes / roundingStep) * roundingStep
}

export interface RegisterTimeEntryInput {
  employeeId: string
  type: TimeEntryType
  clientRequestId?: string | null
  latitude?: number | null
  longitude?: number | null
  accuracyMeters?: number | null
  notes?: string | null
  origin?: 'PORTAL' | 'MANUAL_RH'
  forcedServerTime?: Date // Apenas para testes automatizados ou registo manual do RH
}

/**
 * Obtém o estado actual do ponto no dia de trabalho para um colaborador
 */
export async function getEmployeeTodayStatus(employeeId: string, referenceDate: Date = new Date()) {
  const dateStr = getLuandaDateString(referenceDate)

  // 1. Verificar se há um dia de trabalho aberto de turno anterior (últimas 24h)
  const twentyFourHoursAgo = new Date(referenceDate.getTime() - 24 * 60 * 60 * 1000)
  const openShift = await prisma.hrWorkDay.findFirst({
    where: {
      employeeId,
      isComplete: false,
      actualIn: { gte: twentyFourHoursAgo },
    },
    include: {
      timeEntries: { orderBy: { serverTime: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Se houver turno aberto e não estiver completo, o contexto de trabalho activo é esse
  let workDay = openShift
  if (!workDay) {
    workDay = await prisma.hrWorkDay.findUnique({
      where: { employeeId_date: { employeeId, date: dateStr } },
      include: {
        timeEntries: { orderBy: { serverTime: 'asc' } },
      },
    })
  }

  const entries = workDay?.timeEntries || []
  const lastEntry = entries[entries.length - 1]

  let currentPhase: 'SEM_MARCACAO' | 'TRABALHANDO' | 'EM_PAUSA' | 'FINALIZADO' = 'SEM_MARCACAO'
  let nextAllowedAction: TimeEntryType | null = 'ENTRADA'

  if (entries.length === 0) {
    currentPhase = 'SEM_MARCACAO'
    nextAllowedAction = 'ENTRADA'
  } else if (lastEntry.type === 'ENTRADA' || lastEntry.type === 'FIM_PAUSA') {
    currentPhase = 'TRABALHANDO'
    nextAllowedAction = 'INICIO_PAUSA' // ou SAIDA
  } else if (lastEntry.type === 'INICIO_PAUSA') {
    currentPhase = 'EM_PAUSA'
    nextAllowedAction = 'FIM_PAUSA'
  } else if (lastEntry.type === 'SAIDA') {
    currentPhase = 'FINALIZADO'
    nextAllowedAction = null
  }

  return {
    workDay,
    entries,
    lastEntry,
    currentPhase,
    nextAllowedAction,
    todayDateStr: dateStr,
  }
}

/**
 * Valida e regista uma marcação de ponto
 */
export async function registerTimeEntry(
  actor: HrUserContext,
  input: RegisterTimeEntryInput
) {
  const { employeeId, type, clientRequestId, latitude, longitude, accuracyMeters, notes, origin = 'PORTAL' } = input
  const now = input.forcedServerTime || new Date()

  // 1. Protecção contra duplicados / idempotência (clientRequestId)
  if (clientRequestId) {
    const existingEntry = await prisma.hrTimeEntry.findUnique({
      where: { clientRequestId },
      include: { workDay: true },
    })
    if (existingEntry) {
      return {
        entry: existingEntry,
        workDay: existingEntry.workDay,
        isDuplicate: true,
      }
    }
  }

  // 2. Verificar funcionário
  const employee = await prisma.hrEmployee.findUnique({
    where: { id: employeeId },
    include: {
      workLocations: { include: { workLocation: true } },
      contracts: { where: { status: 'ACTIVO' }, orderBy: { startDate: 'desc' }, take: 1 },
    },
  })

  if (!employee) {
    throw new Error('Colaborador não encontrado.')
  }

  if (employee.status === 'DESLIGADO' || employee.status === 'SUSPENSO') {
    throw new Error(`Marcação não permitida: Colaborador com estado "${employee.status}".`)
  }

  // 3. Validação de Geofencing / Locais de Trabalho
  let isWithinRadius = true
  let matchedLocationId: string | null = null

  if (origin === 'PORTAL') {
    // Obter locais permitidos do funcionário ou todos os locais activos se não houver restrição específica
    const allowedLocations = employee.workLocations.length > 0
      ? employee.workLocations.map((wl) => wl.workLocation).filter((l) => l.active)
      : await prisma.hrWorkLocation.findMany({ where: { active: true } })

    if (allowedLocations.length > 0) {
      if (latitude == null || longitude == null) {
        // Sem localização fornecida
        const hasBlocking = allowedLocations.some((l) => l.verificationMode === 'BLOQUEANTE')
        if (hasBlocking) {
          throw new Error('Marcação recusada: É obrigatório conceder acesso à localização para picar ponto neste local de trabalho.')
        }
        isWithinRadius = false
      } else {
        // Avaliar distância aos locais
        let withinAny = false
        for (const loc of allowedLocations) {
          const check = isWithinLocationRadius(
            { latitude, longitude },
            { latitude: loc.latitude, longitude: loc.longitude },
            loc.radiusMeters,
            accuracyMeters
          )
          if (check.isWithin) {
            withinAny = true
            matchedLocationId = loc.id
            break
          }
        }

        isWithinRadius = withinAny

        if (!withinAny) {
          const hasBlocking = allowedLocations.some((l) => l.verificationMode === 'BLOQUEANTE')
          if (hasBlocking) {
            throw new Error('Marcação recusada: Encontra-se fora do raio geográfico autorizado para o local de trabalho.')
          }
        }
      }
    }
  }

  // 4. Detecção de Dia de Trabalho e Máquina de Estados
  const dateStr = getLuandaDateString(now)
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  // Verificar se há turno aberto anterior (noite / passagem da meia-noite)
  let activeWorkDay = await prisma.hrWorkDay.findFirst({
    where: {
      employeeId,
      isComplete: false,
      actualIn: { gte: twentyFourHoursAgo },
    },
    include: {
      timeEntries: { orderBy: { serverTime: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Se for ENTRADA e não houver turno aberto, cria um novo HrWorkDay
  if (type === 'ENTRADA') {
    if (activeWorkDay && !activeWorkDay.isComplete) {
      throw new Error('Existe um turno de trabalho em aberto sem marcação de saída. Registe a saída do turno anterior antes de iniciar nova entrada.')
    }

    // Criar ou reaproveitar dia civil
    activeWorkDay = await prisma.hrWorkDay.upsert({
      where: { employeeId_date: { employeeId, date: dateStr } },
      update: {},
      create: {
        employeeId,
        date: dateStr,
        actualIn: now,
        status: 'NORMAL',
      },
      include: { timeEntries: { orderBy: { serverTime: 'asc' } } },
    })
  } else {
    // Para INICIO_PAUSA, FIM_PAUSA, SAIDA: é obrigatório haver um WorkDay em curso
    if (!activeWorkDay) {
      // Tentar encontrar o do dia civil actual
      activeWorkDay = await prisma.hrWorkDay.findUnique({
        where: { employeeId_date: { employeeId, date: dateStr } },
        include: { timeEntries: { orderBy: { serverTime: 'asc' } } },
      })
    }

    if (!activeWorkDay) {
      throw new Error(`Sequência de ponto inválida: Não é possível registar "${type}" sem marcação prévia de ENTRADA.`)
    }
  }

  // Validar a sequência na máquina de estados
  const previousEntries = activeWorkDay.timeEntries || []
  const lastEntry = previousEntries[previousEntries.length - 1]

  if (type === 'ENTRADA') {
    if (previousEntries.length > 0 && previousEntries.some((e) => e.type === 'ENTRADA')) {
      throw new Error('A ENTRADA para este dia de trabalho já foi registada.')
    }
  } else if (type === 'INICIO_PAUSA') {
    if (!lastEntry || (lastEntry.type !== 'ENTRADA' && lastEntry.type !== 'FIM_PAUSA')) {
      throw new Error('Não é possível iniciar pausa: É necessário estar em estado de trabalho activo (após Entrada ou Fim de Pausa).')
    }
  } else if (type === 'FIM_PAUSA') {
    if (!lastEntry || lastEntry.type !== 'INICIO_PAUSA') {
      throw new Error('Não é possível terminar pausa: Não foi detectada nenhuma pausa em curso.')
    }
  } else if (type === 'SAIDA') {
    if (!lastEntry || (lastEntry.type !== 'ENTRADA' && lastEntry.type !== 'FIM_PAUSA')) {
      throw new Error('Não é possível registar saída: Se estiver em pausa, termine a pausa antes da saída final.')
    }
  }

  // 5. Transacção atómica: Criar TimeEntry + Recalcular WorkDay + Auditoria
  const result = await prisma.$transaction(async (tx) => {
    const entry = await tx.hrTimeEntry.create({
      data: {
        employeeId,
        workDayId: activeWorkDay!.id,
        type,
        serverTime: now,
        origin,
        authorId: actor.id,
        authorName: actor.name || actor.email,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        accuracyMeters: accuracyMeters ?? null,
        isWithinRadius,
        locationId: matchedLocationId,
        clientRequestId: clientRequestId ?? null,
        notes: notes ?? null,
      },
    })

    // Se for SAIDA, assinala actualOut e isComplete
    if (type === 'SAIDA') {
      await tx.hrWorkDay.update({
        where: { id: activeWorkDay!.id },
        data: {
          actualOut: now,
          isComplete: true,
        },
      })
    } else if (type === 'ENTRADA') {
      await tx.hrWorkDay.update({
        where: { id: activeWorkDay!.id },
        data: {
          actualIn: now,
          isComplete: false,
        },
      })
    }

    // Auditoria obrigatória
    await logAudit(
      {
        userId: actor.id,
        userName: actor.name || actor.email,
        userRole: actor.role,
        action: origin === 'MANUAL_RH' ? 'CRIAR' : 'EDITAR',
        resource: 'PONTO',
        resourceId: entry.id,
        details: `Registo de ponto "${type}" (${origin}) para colaborador ${employee.employeeNumber} - ${employee.fullName}. Localização: ${isWithinRadius ? 'Dentro da área' : 'Fora da área'}.`,
        newValue: {
          type,
          serverTime: now.toISOString(),
          isWithinRadius,
          origin,
          notes,
        },
      },
      tx
    )

    return entry
  })

  // 6. Recalcular métricas do dia de trabalho
  const updatedWorkDay = await recalculateWorkDay(activeWorkDay.id)

  return {
    entry: result,
    workDay: updatedWorkDay,
    isDuplicate: false,
  }
}

/**
 * Recalcula minutos trabalhados, atraso, saída antecipada e horas extra de um dia de trabalho
 */
export async function recalculateWorkDay(workDayId: string) {
  const workDay = await prisma.hrWorkDay.findUnique({
    where: { id: workDayId },
    include: {
      employee: {
        include: {
          contracts: { where: { status: 'ACTIVO' }, take: 1 },
        },
      },
      timeEntries: { orderBy: { serverTime: 'asc' } },
    },
  })

  if (!workDay) return null

  const config = await prisma.hrConfig.findUnique({ where: { id: 'global' } })
  const toleranceMinutes = config?.punctualityToleranceMinutes ?? 10
  const roundingStep = config?.roundingMinutes ?? 0

  const activeContract = workDay.employee.contracts[0]

  // Se não tiver contrato activo, fica SEM_CALCULO
  if (!activeContract) {
    return prisma.hrWorkDay.update({
      where: { id: workDayId },
      data: { status: 'SEM_CALCULO' },
    })
  }

  const entries = workDay.timeEntries
  let totalMinutesWorked = 0
  let actualIn = workDay.actualIn
  let actualOut = workDay.actualOut

  // Calcular tempo efectivo de trabalho descontando pausas
  let workStart: Date | null = null
  let pauseStart: Date | null = null
  let totalPauseMinutes = 0

  for (const e of entries) {
    if (e.type === 'ENTRADA') {
      workStart = e.serverTime
      if (!actualIn) actualIn = e.serverTime
    } else if (e.type === 'INICIO_PAUSA') {
      pauseStart = e.serverTime
    } else if (e.type === 'FIM_PAUSA') {
      if (pauseStart) {
        totalPauseMinutes += Math.max(0, Math.round((e.serverTime.getTime() - pauseStart.getTime()) / 60000))
        pauseStart = null
      }
    } else if (e.type === 'SAIDA') {
      actualOut = e.serverTime
      if (workStart) {
        const totalSpan = Math.max(0, Math.round((e.serverTime.getTime() - workStart.getTime()) / 60000))
        totalMinutesWorked = Math.max(0, totalSpan - totalPauseMinutes)
      }
    }
  }

  // Aplicar arredondamento se configurado
  if (roundingStep > 0 && totalMinutesWorked > 0) {
    totalMinutesWorked = applyRounding(totalMinutesWorked, roundingStep)
  }

  // Horário previsto do contrato (ex: 8 horas diárias = 480 minutos)
  const scheduledDailyMinutes = Math.round(Number(activeContract.dailyHours) * 60)

  // Cálculo de Atraso
  // Padrão de início diário: 08:00 de Luanda (ou especificado)
  let delayMinutes = 0
  if (actualIn) {
    const luandaOffsetMs = 1 * 60 * 60 * 1000
    const inLuanda = new Date(actualIn.getTime() + luandaOffsetMs)
    const inHour = inLuanda.getUTCHours()
    const inMinute = inLuanda.getUTCMinutes()
    const inTotalMinutesFromMidnight = inHour * 60 + inMinute

    const expectedStartMinutes = 8 * 60 // 08:00 por defeito
    const toleratedLimitMinutes = expectedStartMinutes + toleranceMinutes

    if (inTotalMinutesFromMidnight > toleratedLimitMinutes) {
      delayMinutes = inTotalMinutesFromMidnight - expectedStartMinutes
    }
  }

  // Cálculo de Saída Antecipada e Horas Extras
  let earlyDepartureMinutes = 0
  let overtimeMinutes = 0
  let overtimeStatus = workDay.overtimeStatus

  if (workDay.isComplete && actualOut) {
    if (totalMinutesWorked < scheduledDailyMinutes) {
      earlyDepartureMinutes = scheduledDailyMinutes - totalMinutesWorked
    } else if (totalMinutesWorked > scheduledDailyMinutes) {
      overtimeMinutes = totalMinutesWorked - scheduledDailyMinutes
      if (overtimeStatus === 'SEM_HORA_EXTRA' || !overtimeStatus) {
        overtimeStatus = 'PENDENTE'
      }
    }
  }

  // Estado geral do dia
  let status = 'NORMAL'
  if (delayMinutes > 0) status = 'ATRASO'
  if (!workDay.isComplete && actualIn) {
    status = 'NORMAL'
  }

  return prisma.hrWorkDay.update({
    where: { id: workDayId },
    data: {
      actualIn,
      actualOut,
      totalMinutesWorked,
      delayMinutes,
      earlyDepartureMinutes,
      overtimeMinutes,
      overtimeStatus,
      status,
    },
  })
}

/**
 * Pedido de Correcção de Ponto pelo Funcionário
 */
export async function requestTimeCorrection(
  actor: HrUserContext,
  data: {
    employeeId: string
    date: string
    targetEntryType: TimeEntryType
    requestedTime: Date
    reason: string
  }
) {
  const { employeeId, date, targetEntryType, requestedTime, reason } = data

  if (!reason || reason.trim().length < 5) {
    throw new Error('A justificação para o pedido de correcção é obrigatória (mínimo de 5 caracteres).')
  }

  const employee = await prisma.hrEmployee.findUnique({
    where: { id: employeeId },
  })
  if (!employee) throw new Error('Colaborador não encontrado.')

  if (employee.status === 'DESLIGADO' || employee.status === 'SUSPENSO') {
    throw new Error(`Não é permitido pedir correcções: Colaborador com estado "${employee.status}".`)
  }

  // Verificar se há dia de trabalho registado ou cria rascunho
  const workDay = await prisma.hrWorkDay.findUnique({
    where: { employeeId_date: { employeeId, date } },
  })

  const correction = await prisma.hrTimeCorrectionRequest.create({
    data: {
      employeeId,
      workDayId: workDay?.id ?? null,
      date,
      targetEntryType,
      requestedTime,
      reason,
      status: 'PENDENTE',
    },
  })

  // Criar notificação in-app para o RH
  await prisma.hrNotification.create({
    data: {
      type: 'NOVO_PEDIDO_RH',
      title: 'Novo Pedido de Correcção de Ponto',
      message: `${employee.fullName} solicitou correcção de ${targetEntryType} para o dia ${date}.`,
      link: '/rh/ponto/pedidos',
    },
  })

  return correction
}

/**
 * Decisão de Pedido de Correcção de Ponto pelo RH (Aprovar / Rejeitar)
 */
export async function reviewTimeCorrection(
  reviewer: HrUserContext,
  correctionId: string,
  decision: 'APROVADO' | 'REJEITADO',
  reviewComment?: string
) {
  const correction = await prisma.hrTimeCorrectionRequest.findUnique({
    where: { id: correctionId },
    include: {
      employee: {
        include: { userRef: true },
      },
      workDay: true,
    },
  })

  if (!correction) throw new Error('Pedido de correcção não encontrado.')
  if (correction.status !== 'PENDENTE') {
    throw new Error(`Este pedido já se encontra no estado "${correction.status}".`)
  }

  // Validação da Regra dos 4 Olhos
  const requesterRole = correction.employee.userRef?.role || 'FUNCIONARIO'
  const approvalCheck = canApproveRequest(reviewer, {
    role: requesterRole,
    employeeId: correction.employeeId,
    userId: correction.employee.userId,
  })

  if (!approvalCheck.allowed) {
    throw new Error(approvalCheck.reason || 'Não autorizado a aprovar este pedido.')
  }

  return prisma.$transaction(async (tx) => {
    let createdEntryId: string | null = null

    if (decision === 'APROVADO') {
      // Cria a marcação MANUAL_RH com o horário aprovado
      const newEntry = await tx.hrTimeEntry.create({
        data: {
          employeeId: correction.employeeId,
          workDayId: correction.workDayId,
          type: correction.targetEntryType,
          serverTime: correction.requestedTime,
          origin: 'MANUAL_RH',
          authorId: reviewer.id,
          authorName: reviewer.name || reviewer.email,
          notes: `Correcção aprovada por ${reviewer.name || reviewer.email}: ${reviewComment || correction.reason}`,
          isWithinRadius: true,
        },
      })
      createdEntryId = newEntry.id
    }

    const updated = await tx.hrTimeCorrectionRequest.update({
      where: { id: correctionId },
      data: {
        status: decision,
        reviewedById: reviewer.id,
        reviewedByName: reviewer.name || reviewer.email,
        reviewComment: reviewComment || null,
        reviewedAt: new Date(),
        createdEntryId,
      },
    })

    // Auditoria obrigatória
    await logAudit(
      {
        userId: reviewer.id,
        userName: reviewer.name || reviewer.email,
        userRole: reviewer.role,
        action: 'APROVAR',
        resource: 'CORRECAO_PONTO',
        resourceId: correctionId,
        details: `Decisão de correcção de ponto: ${decision} para ${correction.employee.fullName}. Comentário: ${reviewComment || 'Nenhum'}.`,
        newValue: { decision, reviewComment, createdEntryId },
      },
      tx
    )

    // Notificação para o funcionário
    if (correction.employee.userId) {
      await tx.hrNotification.create({
        data: {
          recipientUserId: correction.employee.userId,
          employeeId: correction.employeeId,
          type: 'DECISAO_PEDIDO',
          title: `Pedido de Correcção de Ponto ${decision === 'APROVADO' ? 'Aprovado' : 'Rejeitado'}`,
          message: `O seu pedido de correcção para o dia ${correction.date} foi ${decision.toLowerCase()}.`,
          link: '/portal',
        },
      })
    }

    return updated
  }).then(async (updated) => {
    if (decision === 'APROVADO' && correction.workDayId) {
      await recalculateWorkDay(correction.workDayId)
    }
    return updated
  })
}

/**
 * Aprovação ou Rejeição de Horas Extras
 */
export async function reviewOvertime(
  reviewer: HrUserContext,
  workDayId: string,
  decision: 'APROVADO' | 'REJEITADO',
  approvedMinutes?: number,
  comment?: string
) {
  const workDay = await prisma.hrWorkDay.findUnique({
    where: { id: workDayId },
    include: {
      employee: { include: { userRef: true } },
    },
  })

  if (!workDay) throw new Error('Dia de trabalho não encontrado.')

  const requesterRole = workDay.employee.userRef?.role || 'FUNCIONARIO'
  const approvalCheck = canApproveRequest(reviewer, {
    role: requesterRole,
    employeeId: workDay.employeeId,
    userId: workDay.employee.userId,
  })

  if (!approvalCheck.allowed) {
    throw new Error(approvalCheck.reason || 'Não autorizado a aprovar horas extras deste colaborador.')
  }

  const finalApprovedMinutes = decision === 'APROVADO' ? (approvedMinutes ?? workDay.overtimeMinutes) : 0

  return prisma.$transaction(async (tx) => {
    const updated = await tx.hrWorkDay.update({
      where: { id: workDayId },
      data: {
        overtimeStatus: decision,
        overtimeApprovedMinutes: finalApprovedMinutes,
        overtimeReviewedById: reviewer.id,
        overtimeReviewedAt: new Date(),
      },
    })

    await logAudit(
      {
        userId: reviewer.id,
        userName: reviewer.name || reviewer.email,
        userRole: reviewer.role,
        action: 'APROVAR',
        resource: 'HORAS_EXTRA',
        resourceId: workDayId,
        details: `Decisão de horas extras: ${decision} (${finalApprovedMinutes} min) para ${workDay.employee.fullName}. Comentário: ${comment || 'Nenhum'}.`,
        newValue: { decision, finalApprovedMinutes, comment },
      },
      tx
    )

    if (workDay.employee.userId) {
      await tx.hrNotification.create({
        data: {
          recipientUserId: workDay.employee.userId,
          employeeId: workDay.employeeId,
          type: 'DECISAO_PEDIDO',
          title: `Horas Extras ${decision === 'APROVADO' ? 'Aprovadas' : 'Rejeitadas'}`,
          message: `As horas extras do dia ${workDay.date} foram ${decision.toLowerCase()} (${finalApprovedMinutes} minutos).`,
          link: '/portal',
        },
      })
    }

    return updated
  })
}
