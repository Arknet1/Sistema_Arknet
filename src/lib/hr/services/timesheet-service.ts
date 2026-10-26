import { PrismaClient, Prisma } from '@prisma/client'
import { HrUserContext, assertCan, canApproveRequest } from '../permissions'
import { logAudit } from '../audit'
import { isWorkingDayOfWeek } from './leave-service'
import { getLuandaDateString } from './time-service'

const prisma = new PrismaClient()

// ──────────────────────────────────────────────────────────────
// 1. PERÍODO — Criar / Obter / Listar
// ──────────────────────────────────────────────────────────────

/**
 * Obtém ou cria o período mensal de folhas de ponto.
 */
export async function getOrCreatePeriod(year: number, month: number) {
  const code = `${year}-${String(month).padStart(2, '0')}`

  let period = await prisma.hrTimesheetPeriod.findUnique({
    where: { code },
  })

  if (!period) {
    period = await prisma.hrTimesheetPeriod.create({
      data: { year, month, code },
    })
  }

  return period
}

/**
 * Lista todos os períodos ordenados do mais recente ao mais antigo.
 */
export async function listPeriods() {
  return prisma.hrTimesheetPeriod.findMany({
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    include: {
      _count: { select: { timesheets: true } },
    },
  })
}

/**
 * Obtém um período pelo código "AAAA-MM" com todas as folhas.
 */
export async function getPeriodByCode(code: string) {
  return prisma.hrTimesheetPeriod.findUnique({
    where: { code },
    include: {
      timesheets: {
        include: {
          employee: {
            select: {
              id: true,
              fullName: true,
              employeeNumber: true,
              departmentId: true,
              department: { select: { name: true } },
              position: { select: { title: true } },
            },
          },
          _count: { select: { days: true } },
        },
        orderBy: { employee: { fullName: 'asc' } },
      },
      _count: { select: { timesheets: true, snapshots: true } },
    },
  })
}

// ──────────────────────────────────────────────────────────────
// 2. GERAÇÃO DE FOLHAS DE PONTO (cálculo mensal)
// ──────────────────────────────────────────────────────────────

/**
 * Gera (ou recalcula) as folhas de ponto de todos os colaboradores activos
 * para um determinado período. Operação idempotente — actualiza folhas existentes.
 */
export async function generateTimesheets(actor: HrUserContext, periodCode: string) {
  assertCan(actor, 'GERAR_FOLHAS_PONTO')

  const period = await getOrCreatePeriod(
    parseInt(periodCode.split('-')[0]),
    parseInt(periodCode.split('-')[1])
  )

  if (period.status === 'FECHADO') {
    throw new Error('Não é possível gerar folhas para um período fechado.')
  }

  const year = period.year
  const month = period.month

  // Datas do mês
  const monthStart = new Date(Date.UTC(year, month - 1, 1))
  const monthEnd = new Date(Date.UTC(year, month, 0)) // Último dia
  const startDateStr = `${year}-${String(month).padStart(2, '0')}-01`
  const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(monthEnd.getUTCDate()).padStart(2, '0')}`

  // Obter configuração global
  const config = await prisma.hrConfig.findUnique({ where: { id: 'global' } })
  const tolerance = config?.punctualityToleranceMinutes ?? 10
  const rounding = config?.roundingMinutes ?? 0

  // Obter todos os colaboradores activos
  const employees = await prisma.hrEmployee.findMany({
    where: { status: 'ACTIVO' },
    include: {
      contracts: { where: { status: 'ACTIVO' }, take: 1, orderBy: { startDate: 'desc' } },
    },
  })

  // Obter feriados do mês
  const holidays = await prisma.hrHoliday.findMany({
    where: {
      date: { gte: startDateStr, lte: endDateStr },
    },
    select: { date: true },
  })
  const holidaySet = new Set(holidays.map((h) => h.date))

  const results: { employeeId: string; timesheetId: string }[] = []

  for (const employee of employees) {
    const contract = employee.contracts[0]
    const workDaysScheme = contract?.workDays || 'SEG-SEX'
    const dailyMinutes = contract ? Number(contract.dailyHours) * 60 : 480

    // Obter dias de trabalho registados no mês
    const workDays = await prisma.hrWorkDay.findMany({
      where: {
        employeeId: employee.id,
        date: { gte: startDateStr, lte: endDateStr },
      },
      include: {
        timeEntries: { orderBy: { serverTime: 'asc' } },
      },
      orderBy: { date: 'asc' },
    })

    const workDayMap = new Map(workDays.map((wd) => [wd.date, wd]))

    // Obter ausências aprovadas no mês
    const leaveRequests = await prisma.hrLeaveRequest.findMany({
      where: {
        employeeId: employee.id,
        status: 'APROVADO',
        startDate: { lte: monthEnd },
        endDate: { gte: monthStart },
      },
      include: { leaveType: true },
    })

    // Totais consolidados
    let expectedWorkDays = 0
    let workedDays = 0
    let totalMinutesWorked = 0
    let delayCount = 0
    let delayMinutes = 0
    let earlyDepartureMinutes = 0
    let unjustifiedAbsenceDays = 0
    let justifiedAbsenceDays = 0
    let paidLeaveDays = 0
    let unpaidLeaveDays = 0
    let holidayDays = 0
    let approvedOvertimeMinutes = 0
    let pendingOvertimeMinutes = 0
    let rejectedOvertimeMinutes = 0
    let missingExitDays = 0
    let outsideAreaDays = 0

    // Detalhe diário
    const dayDetails: Prisma.HrTimesheetDayDetailCreateWithoutTimesheetInput[] = []

    // Iterar cada dia do mês
    const currentDate = new Date(monthStart)
    while (currentDate <= monthEnd) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const dayOfWeek = currentDate.getUTCDay()
      const isHoliday = holidaySet.has(dateStr)
      const isWorkDay = isWorkingDayOfWeek(currentDate, workDaysScheme) && !isHoliday

      if (isWorkDay) expectedWorkDays++
      if (isHoliday && isWorkingDayOfWeek(currentDate, workDaysScheme)) holidayDays++

      const wd = workDayMap.get(dateStr)

      // Verificar se há licença/ausência neste dia
      const leaveOnDay = leaveRequests.find((lr) => {
        const start = new Date(lr.startDate)
        start.setHours(0, 0, 0, 0)
        const end = new Date(lr.endDate)
        end.setHours(23, 59, 59, 999)
        return currentDate >= start && currentDate <= end
      })

      let dayStatus: string
      let dayMinutesWorked = 0
      let dayDelayMinutes = 0
      let dayEarlyDeparture = 0
      let dayOvertimeMinutes = 0
      let dayOvertimeStatus = 'SEM_HORA_EXTRA'
      let dayActualIn: Date | null = null
      let dayActualOut: Date | null = null
      let absenceReason: string | null = null
      let leaveRequestId: string | null = null
      let isOutsideArea = false
      let hasMissingExit = false

      if (!isWorkDay && !isHoliday) {
        // Folga (fim-de-semana)
        dayStatus = 'FOLGA'
      } else if (isHoliday) {
        dayStatus = 'FERIADO'
      } else if (leaveOnDay) {
        // Dia com ausência aprovada
        const type = leaveOnDay.leaveType
        if (type.code === 'FERIAS') {
          dayStatus = 'FERIAS'
          paidLeaveDays++
        } else if (type.code === 'DOENCA') {
          dayStatus = 'DOENCA'
          justifiedAbsenceDays++
          if (type.isPaid) paidLeaveDays++
          else unpaidLeaveDays++
        } else if (type.code === 'SEM_VENCIMENTO') {
          dayStatus = 'LICENCA'
          unpaidLeaveDays++
        } else {
          dayStatus = 'LICENCA'
          if (type.isPaid) paidLeaveDays++
          else unpaidLeaveDays++
          justifiedAbsenceDays++
        }
        absenceReason = type.name
        leaveRequestId = leaveOnDay.id
      } else if (wd) {
        // Dia de trabalho com marcações
        dayActualIn = wd.actualIn
        dayActualOut = wd.actualOut
        dayMinutesWorked = wd.totalMinutesWorked
        dayDelayMinutes = wd.delayMinutes
        dayEarlyDeparture = wd.earlyDepartureMinutes
        dayOvertimeMinutes = wd.overtimeMinutes
        dayOvertimeStatus = wd.overtimeStatus

        totalMinutesWorked += dayMinutesWorked

        if (dayDelayMinutes > 0) {
          delayCount++
          delayMinutes += dayDelayMinutes
        }
        earlyDepartureMinutes += dayEarlyDeparture

        if (wd.overtimeStatus === 'APROVADO') {
          approvedOvertimeMinutes += wd.overtimeApprovedMinutes
        } else if (wd.overtimeStatus === 'PENDENTE') {
          pendingOvertimeMinutes += dayOvertimeMinutes
        } else if (wd.overtimeStatus === 'REJEITADO') {
          rejectedOvertimeMinutes += dayOvertimeMinutes
        }

        // Verificar saída em falta
        if (!wd.isComplete && wd.actualIn) {
          hasMissingExit = true
          missingExitDays++
          dayStatus = 'SAIDA_EM_FALTA'
        } else if (wd.status === 'ATRASO') {
          dayStatus = 'ATRASO'
          workedDays++
        } else {
          dayStatus = 'PRESENTE'
          workedDays++
        }

        // Verificar marcações fora da área
        const outsideEntries = wd.timeEntries.filter((e) => !e.isWithinRadius)
        if (outsideEntries.length > 0) {
          isOutsideArea = true
          outsideAreaDays++
        }
      } else {
        // Dia útil sem marcações e sem licença — falta injustificada
        dayStatus = 'FALTA_INJUSTIFICADA'
        unjustifiedAbsenceDays++
      }

      dayDetails.push({
        date: dateStr,
        dayOfWeek,
        isExpectedWorkDay: isWorkDay,
        scheduledDailyMinutes: isWorkDay ? dailyMinutes : 0,
        actualIn: dayActualIn,
        actualOut: dayActualOut,
        minutesWorked: dayMinutesWorked,
        delayMinutes: dayDelayMinutes,
        earlyDepartureMinutes: dayEarlyDeparture,
        overtimeMinutes: dayOvertimeMinutes,
        overtimeStatus: dayOvertimeStatus,
        status: dayStatus,
        absenceReason,
        leaveRequestId,
        isOutsideArea,
        hasMissingExit,
      })

      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }

    // Snapshot de regras aplicadas
    const rulesSnapshot = JSON.stringify({
      punctualityToleranceMinutes: tolerance,
      roundingMinutes: rounding,
      workDaysScheme,
      dailyMinutes,
      contractId: contract?.id || null,
    })

    // Upsert da folha de ponto (idempotente)
    const timesheet = await prisma.$transaction(async (tx) => {
      // Eliminar detalhes existentes e recriar
      const existing = await tx.hrTimesheet.findUnique({
        where: { periodId_employeeId: { periodId: period.id, employeeId: employee.id } },
      })

      if (existing) {
        // Não recalcular se estiver APROVADA ou BLOQUEADA
        if (existing.status === 'APROVADA' || existing.status === 'BLOQUEADA') {
          return existing
        }

        await tx.hrTimesheetDayDetail.deleteMany({
          where: { timesheetId: existing.id },
        })

        return tx.hrTimesheet.update({
          where: { id: existing.id },
          data: {
            expectedWorkDays,
            workedDays,
            totalMinutesWorked,
            delayCount,
            delayMinutes,
            earlyDepartureMinutes,
            unjustifiedAbsenceDays,
            justifiedAbsenceDays,
            paidLeaveDays,
            unpaidLeaveDays,
            holidayDays,
            approvedOvertimeMinutes,
            pendingOvertimeMinutes,
            rejectedOvertimeMinutes,
            missingExitDays,
            outsideAreaDays,
            rulesSnapshot,
            calculatedAt: new Date(),
            days: {
              create: dayDetails,
            },
          },
        })
      }

      return tx.hrTimesheet.create({
        data: {
          periodId: period.id,
          employeeId: employee.id,
          expectedWorkDays,
          workedDays,
          totalMinutesWorked,
          delayCount,
          delayMinutes,
          earlyDepartureMinutes,
          unjustifiedAbsenceDays,
          justifiedAbsenceDays,
          paidLeaveDays,
          unpaidLeaveDays,
          holidayDays,
          approvedOvertimeMinutes,
          pendingOvertimeMinutes,
          rejectedOvertimeMinutes,
          missingExitDays,
          outsideAreaDays,
          rulesSnapshot,
          days: {
            create: dayDetails,
          },
        },
      })
    })

    results.push({ employeeId: employee.id, timesheetId: timesheet.id })
  }

  // Auditoria da geração
  await logAudit({
    userId: actor.id,
    userName: actor.name || actor.email,
    userRole: actor.role,
    action: 'CRIAR',
    resource: 'FOLHA_PONTO',
    resourceId: period.id,
    details: `Folhas de ponto geradas/recalculadas para o período ${periodCode}. Total: ${results.length} colaboradores.`,
    newValue: { periodCode, count: results.length },
  })

  return { periodId: period.id, periodCode, generated: results.length, results }
}

// ──────────────────────────────────────────────────────────────
// 3. FOLHA INDIVIDUAL — Obter / Submeter / Aprovar
// ──────────────────────────────────────────────────────────────

/**
 * Obtém a folha de ponto de um colaborador num determinado período.
 */
export async function getTimesheetForEmployee(periodCode: string, employeeId: string) {
  const period = await prisma.hrTimesheetPeriod.findUnique({ where: { code: periodCode } })
  if (!period) return null

  return prisma.hrTimesheet.findUnique({
    where: { periodId_employeeId: { periodId: period.id, employeeId } },
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
      period: true,
      days: { orderBy: { date: 'asc' } },
    },
  })
}

/**
 * Submissão da folha pelo funcionário (confirma que reviu os dados).
 */
export async function submitTimesheet(actor: HrUserContext, timesheetId: string) {
  assertCan(actor, 'SUBMETER_FOLHA_PROPRIA')

  const timesheet = await prisma.hrTimesheet.findUnique({
    where: { id: timesheetId },
    include: { period: true, employee: true },
  })

  if (!timesheet) throw new Error('Folha de ponto não encontrada.')
  if (timesheet.employeeId !== actor.employeeId) {
    throw new Error('Só pode submeter a sua própria folha de ponto.')
  }
  if (timesheet.status !== 'ABERTA') {
    throw new Error(`A folha já se encontra no estado "${timesheet.status}".`)
  }
  if (timesheet.period.status === 'FECHADO') {
    throw new Error('O período já se encontra fechado.')
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.hrTimesheet.update({
      where: { id: timesheetId },
      data: {
        status: 'SUBMETIDA',
        submittedAt: new Date(),
      },
    })

    await logAudit(
      {
        userId: actor.id,
        userName: actor.name || actor.email,
        userRole: actor.role,
        action: 'MUDAR_ESTADO',
        resource: 'FOLHA_PONTO',
        resourceId: timesheetId,
        details: `Folha de ponto submetida pelo colaborador ${timesheet.employee.fullName} para o período ${timesheet.period.code}.`,
        newValue: { status: 'SUBMETIDA' },
      },
      tx
    )

    // Notificar RH
    await tx.hrNotification.create({
      data: {
        type: 'NOVO_PEDIDO_RH',
        employeeId: timesheet.employeeId,
        title: 'Folha de Ponto Submetida',
        message: `${timesheet.employee.fullName} submeteu a folha de ponto do período ${timesheet.period.code}.`,
        link: `/rh/folhas-ponto/${timesheet.period.code}`,
      },
    })

    return updated
  })
}

/**
 * Aprovação de uma folha de ponto pelo RH.
 */
export async function approveTimesheet(
  actor: HrUserContext,
  timesheetId: string,
  note?: string
) {
  assertCan(actor, 'APROVAR_FOLHA_PONTO')

  const timesheet = await prisma.hrTimesheet.findUnique({
    where: { id: timesheetId },
    include: { period: true, employee: true },
  })

  if (!timesheet) throw new Error('Folha de ponto não encontrada.')
  if (timesheet.period.status === 'FECHADO') {
    throw new Error('O período já se encontra fechado. Reabra-o antes de aprovar.')
  }

  // Regra dos 4 Olhos
  const approvalCheck = canApproveRequest(actor, {
    role: 'FUNCIONARIO',
    employeeId: timesheet.employeeId,
  })
  if (!approvalCheck.allowed) {
    throw new Error(approvalCheck.reason || 'Aprovação não permitida.')
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.hrTimesheet.update({
      where: { id: timesheetId },
      data: {
        status: 'APROVADA',
        approvedAt: new Date(),
        approvedById: actor.id,
        approvedByName: actor.name || actor.email,
        approvalNote: note || null,
      },
    })

    await logAudit(
      {
        userId: actor.id,
        userName: actor.name || actor.email,
        userRole: actor.role,
        action: 'APROVAR',
        resource: 'FOLHA_PONTO',
        resourceId: timesheetId,
        details: `Folha de ponto aprovada para ${timesheet.employee.fullName} no período ${timesheet.period.code}.`,
        newValue: { status: 'APROVADA', note },
      },
      tx
    )

    // Notificar o funcionário
    const user = await tx.adminUser.findFirst({
      where: { hrEmployee: { id: timesheet.employeeId } },
    })

    if (user) {
      await tx.hrNotification.create({
        data: {
          recipientUserId: user.id,
          employeeId: timesheet.employeeId,
          type: 'DECISAO_PEDIDO',
          title: 'Folha de Ponto Aprovada',
          message: `A sua folha de ponto do período ${timesheet.period.code} foi aprovada.`,
          link: `/portal`,
        },
      })
    }

    return updated
  })
}

// ──────────────────────────────────────────────────────────────
// 4. JUSTIFICAÇÃO DE FALTAS
// ──────────────────────────────────────────────────────────────

/**
 * Justifica uma falta injustificada num dia específico da folha.
 */
export async function justifyAbsence(
  actor: HrUserContext,
  dayDetailId: string,
  reason: string
) {
  assertCan(actor, 'JUSTIFICAR_FALTA')

  const day = await prisma.hrTimesheetDayDetail.findUnique({
    where: { id: dayDetailId },
    include: {
      timesheet: { include: { period: true, employee: true } },
    },
  })

  if (!day) throw new Error('Registo diário não encontrado.')
  if (day.timesheet.period.status === 'FECHADO') {
    throw new Error('O período está fechado. Reabra-o antes de justificar faltas.')
  }
  if (day.status !== 'FALTA_INJUSTIFICADA') {
    throw new Error(`O dia ${day.date} não é uma falta injustificada (estado actual: "${day.status}").`)
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.hrTimesheetDayDetail.update({
      where: { id: dayDetailId },
      data: {
        status: 'FALTA_JUSTIFICADA',
        absenceReason: reason,
        absenceJustifiedById: actor.id,
        absenceJustifiedByName: actor.name || actor.email,
        absenceJustifiedAt: new Date(),
      },
    })

    // Recalcular totais da folha
    await recalculateTimesheetTotals(tx, day.timesheetId)

    await logAudit(
      {
        userId: actor.id,
        userName: actor.name || actor.email,
        userRole: actor.role,
        action: 'EDITAR',
        resource: 'FOLHA_PONTO',
        resourceId: day.timesheetId,
        details: `Falta justificada no dia ${day.date} para ${day.timesheet.employee.fullName}. Motivo: ${reason}`,
        newValue: { dayDetailId, date: day.date, reason },
      },
      tx
    )

    return updated
  })
}

/**
 * Recalcula totais consolidados de uma folha de ponto a partir dos seus detalhes diários.
 */
async function recalculateTimesheetTotals(
  tx: Prisma.TransactionClient,
  timesheetId: string
) {
  const days = await tx.hrTimesheetDayDetail.findMany({
    where: { timesheetId },
  })

  let expectedWorkDays = 0
  let workedDays = 0
  let totalMinutesWorked = 0
  let delayCount = 0
  let delayMinutesTotal = 0
  let earlyDeparture = 0
  let unjustifiedAbsenceDays = 0
  let justifiedAbsenceDays = 0
  let paidLeaveDays = 0
  let unpaidLeaveDays = 0
  let holidayDays = 0
  let approvedOvertime = 0
  let pendingOvertime = 0
  let rejectedOvertime = 0
  let missingExitDays = 0
  let outsideAreaDays = 0

  for (const d of days) {
    if (d.isExpectedWorkDay) expectedWorkDays++

    switch (d.status) {
      case 'PRESENTE':
      case 'ATRASO':
        workedDays++
        break
      case 'FALTA_INJUSTIFICADA':
        unjustifiedAbsenceDays++
        break
      case 'FALTA_JUSTIFICADA':
        justifiedAbsenceDays++
        break
      case 'FERIAS':
        paidLeaveDays++
        break
      case 'DOENCA':
        justifiedAbsenceDays++
        break
      case 'LICENCA':
        justifiedAbsenceDays++
        break
      case 'FERIADO':
        holidayDays++
        break
      case 'SAIDA_EM_FALTA':
        missingExitDays++
        break
    }

    totalMinutesWorked += d.minutesWorked
    if (d.delayMinutes > 0) {
      delayCount++
      delayMinutesTotal += d.delayMinutes
    }
    earlyDeparture += d.earlyDepartureMinutes

    if (d.overtimeStatus === 'APROVADO') approvedOvertime += d.overtimeMinutes
    else if (d.overtimeStatus === 'PENDENTE') pendingOvertime += d.overtimeMinutes
    else if (d.overtimeStatus === 'REJEITADO') rejectedOvertime += d.overtimeMinutes

    if (d.isOutsideArea) outsideAreaDays++
  }

  await tx.hrTimesheet.update({
    where: { id: timesheetId },
    data: {
      expectedWorkDays,
      workedDays,
      totalMinutesWorked,
      delayCount,
      delayMinutes: delayMinutesTotal,
      earlyDepartureMinutes: earlyDeparture,
      unjustifiedAbsenceDays,
      justifiedAbsenceDays,
      paidLeaveDays,
      unpaidLeaveDays,
      holidayDays,
      approvedOvertimeMinutes: approvedOvertime,
      pendingOvertimeMinutes: pendingOvertime,
      rejectedOvertimeMinutes: rejectedOvertime,
      missingExitDays,
      outsideAreaDays,
      calculatedAt: new Date(),
    },
  })
}

// ──────────────────────────────────────────────────────────────
// 5. FECHO E REABERTURA DE PERÍODO
// ──────────────────────────────────────────────────────────────

/**
 * Fecha um período mensal. Cria snapshot de versão e bloqueia todas as folhas aprovadas.
 */
export async function closePeriod(
  actor: HrUserContext,
  periodCode: string,
  notes?: string
) {
  assertCan(actor, 'FECHAR_PERIODO_PONTO')

  const period = await prisma.hrTimesheetPeriod.findUnique({
    where: { code: periodCode },
    include: { timesheets: true },
  })

  if (!period) throw new Error('Período não encontrado.')
  if (period.status === 'FECHADO') throw new Error('O período já se encontra fechado.')

  // Verificar se todas as folhas estão aprovadas
  const nonApproved = period.timesheets.filter((t) => t.status !== 'APROVADA' && t.status !== 'BLOQUEADA')
  if (nonApproved.length > 0) {
    throw new Error(
      `Existem ${nonApproved.length} folha(s) de ponto não aprovadas. Aprove todas antes de fechar o período.`
    )
  }

  return prisma.$transaction(async (tx) => {
    // Criar snapshot antes de fechar
    const allTimesheets = await tx.hrTimesheet.findMany({
      where: { periodId: period.id },
      include: { days: true, employee: { select: { fullName: true, employeeNumber: true } } },
    })

    const snapshotData = JSON.stringify(
      allTimesheets.map((t) => ({
        employeeId: t.employeeId,
        employeeName: t.employee.fullName,
        employeeNumber: t.employee.employeeNumber,
        status: t.status,
        totals: {
          expectedWorkDays: t.expectedWorkDays,
          workedDays: t.workedDays,
          totalMinutesWorked: t.totalMinutesWorked,
          delayCount: t.delayCount,
          delayMinutes: t.delayMinutes,
          earlyDepartureMinutes: t.earlyDepartureMinutes,
          unjustifiedAbsenceDays: t.unjustifiedAbsenceDays,
          justifiedAbsenceDays: t.justifiedAbsenceDays,
          paidLeaveDays: t.paidLeaveDays,
          unpaidLeaveDays: t.unpaidLeaveDays,
          holidayDays: t.holidayDays,
          approvedOvertimeMinutes: t.approvedOvertimeMinutes,
          pendingOvertimeMinutes: t.pendingOvertimeMinutes,
          rejectedOvertimeMinutes: t.rejectedOvertimeMinutes,
          missingExitDays: t.missingExitDays,
          outsideAreaDays: t.outsideAreaDays,
        },
        days: t.days.map((d) => ({
          date: d.date,
          status: d.status,
          minutesWorked: d.minutesWorked,
          delayMinutes: d.delayMinutes,
          overtimeMinutes: d.overtimeMinutes,
          overtimeStatus: d.overtimeStatus,
        })),
        rulesSnapshot: t.rulesSnapshot,
      }))
    )

    await tx.hrTimesheetVersionSnapshot.create({
      data: {
        periodId: period.id,
        version: period.version,
        snapshotData,
        createdById: actor.id,
        createdByName: actor.name || actor.email,
        notes: notes || `Fecho do período ${periodCode} — versão ${period.version}`,
      },
    })

    // Bloquear todas as folhas
    await tx.hrTimesheet.updateMany({
      where: { periodId: period.id },
      data: { status: 'BLOQUEADA' },
    })

    // Fechar o período
    const updatedPeriod = await tx.hrTimesheetPeriod.update({
      where: { id: period.id },
      data: {
        status: 'FECHADO',
        closedAt: new Date(),
        closedById: actor.id,
        closedByName: actor.name || actor.email,
        closeNotes: notes || null,
      },
    })

    await logAudit(
      {
        userId: actor.id,
        userName: actor.name || actor.email,
        userRole: actor.role,
        action: 'MUDAR_ESTADO',
        resource: 'PERIODO_PONTO',
        resourceId: period.id,
        details: `Período ${periodCode} fechado. Versão ${period.version}. Total de ${allTimesheets.length} folhas bloqueadas.`,
        newValue: { status: 'FECHADO', version: period.version, notes },
      },
      tx
    )

    return updatedPeriod
  })
}

/**
 * Reabre um período fechado — só ADMINISTRADOR. Incrementa versão.
 */
export async function reopenPeriod(
  actor: HrUserContext,
  periodCode: string,
  reason: string
) {
  assertCan(actor, 'REABRIR_PERIODO_PONTO')

  if (!reason || reason.trim().length < 5) {
    throw new Error('É obrigatório indicar o motivo da reabertura (mínimo 5 caracteres).')
  }

  const period = await prisma.hrTimesheetPeriod.findUnique({
    where: { code: periodCode },
  })

  if (!period) throw new Error('Período não encontrado.')
  if (period.status !== 'FECHADO') throw new Error('O período não está fechado.')

  // Verificar se já foi consumido pela Fase 4 (salários)
  if (period.payrollLockedAt) {
    throw new Error('O período já foi consumido pelo processamento salarial e não pode ser reaberto.')
  }

  return prisma.$transaction(async (tx) => {
    const newVersion = period.version + 1

    // Desbloquear folhas
    await tx.hrTimesheet.updateMany({
      where: { periodId: period.id, status: 'BLOQUEADA' },
      data: { status: 'APROVADA' },
    })

    const updatedPeriod = await tx.hrTimesheetPeriod.update({
      where: { id: period.id },
      data: {
        status: 'REABERTO',
        version: newVersion,
        reopenedAt: new Date(),
        reopenedById: actor.id,
        reopenReason: reason,
      },
    })

    await logAudit(
      {
        userId: actor.id,
        userName: actor.name || actor.email,
        userRole: actor.role,
        action: 'MUDAR_ESTADO',
        resource: 'PERIODO_PONTO',
        resourceId: period.id,
        details: `Período ${periodCode} reaberto. Nova versão: ${newVersion}. Motivo: ${reason}`,
        oldValue: { status: 'FECHADO', version: period.version },
        newValue: { status: 'REABERTO', version: newVersion, reason },
      },
      tx
    )

    return updatedPeriod
  })
}

// ──────────────────────────────────────────────────────────────
// 6. UTILITÁRIOS
// ──────────────────────────────────────────────────────────────

/**
 * Formata minutos em "Xh Ymin" para exibição.
 */
export function formatMinutes(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0 || isNaN(minutes)) return '0min'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

/**
 * Obtém o resumo do período actual (mês corrente) para o dashboard.
 */
export async function getCurrentPeriodSummary() {
  const now = new Date()
  // Usar fuso de Luanda
  const dateStr = getLuandaDateString(now)
  const [year, month] = dateStr.split('-').map(Number)
  const code = `${year}-${String(month).padStart(2, '0')}`

  const period = await prisma.hrTimesheetPeriod.findUnique({
    where: { code },
    include: {
      timesheets: {
        select: {
          status: true,
          expectedWorkDays: true,
          workedDays: true,
          totalMinutesWorked: true,
          unjustifiedAbsenceDays: true,
          approvedOvertimeMinutes: true,
        },
      },
      _count: { select: { timesheets: true, snapshots: true } },
    },
  })

  if (!period) {
    return { code, exists: false, status: null, totalSheets: 0, summary: null }
  }

  const sheets = period.timesheets
  const total = sheets.length
  const approved = sheets.filter((s) => s.status === 'APROVADA' || s.status === 'BLOQUEADA').length
  const submitted = sheets.filter((s) => s.status === 'SUBMETIDA').length
  const open = sheets.filter((s) => s.status === 'ABERTA').length

  return {
    code,
    exists: true,
    status: period.status,
    totalSheets: total,
    approved,
    submitted,
    open,
    versions: period._count.snapshots,
    summary: {
      totalExpectedDays: sheets.reduce((s, t) => s + t.expectedWorkDays, 0),
      totalWorkedDays: sheets.reduce((s, t) => s + t.workedDays, 0),
      totalMinutesWorked: sheets.reduce((s, t) => s + t.totalMinutesWorked, 0),
      totalUnjustifiedAbsences: sheets.reduce((s, t) => s + t.unjustifiedAbsenceDays, 0),
      totalApprovedOvertime: sheets.reduce((s, t) => s + t.approvedOvertimeMinutes, 0),
    },
  }
}
