import { PrismaClient } from '@prisma/client'
import { HrUserContext, canApproveRequest } from '../permissions'
import { logAudit } from '../audit'
import { sendEmail } from '../alerts'

const prisma = new PrismaClient()

/**
 * Retorna se um dia da semana é dia útil de acordo com o regime de trabalho do contrato
 * (ex: 'SEG-SEX' -> Seg=1 a Sex=5 são úteis, Sáb=6 e Dom=0 são descanso)
 */
export function isWorkingDayOfWeek(date: Date, workDays: string = 'SEG-SEX'): boolean {
  const day = date.getDay() // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  if (workDays === 'SEG-SAB') {
    return day >= 1 && day <= 6 // Segunda a Sábado
  }
  // Padrão SEG-SEX
  return day >= 1 && day <= 5
}

/**
 * Calcula o número de dias úteis entre duas datas (inclusive), excluindo fins-de-semana e feriados
 */
export async function calculateWorkingDays(
  startDate: Date,
  endDate: Date,
  workDaysScheme: string = 'SEG-SEX'
): Promise<{ count: number; holidayDates: string[] }> {
  if (startDate > endDate) {
    return { count: 0, holidayDates: [] }
  }

  // Obter todos os feriados
  const holidays = await prisma.hrHoliday.findMany({ select: { date: true } })
  const holidaySet = new Set(holidays.map((h) => h.date))

  let count = 0
  const holidayDatesFound: string[] = []

  const current = new Date(startDate)
  current.setHours(0, 0, 0, 0)

  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)

  while (current <= end) {
    const isWorkDay = isWorkingDayOfWeek(current, workDaysScheme)
    const dateStr = current.toISOString().split('T')[0]

    if (isWorkDay) {
      if (holidaySet.has(dateStr)) {
        holidayDatesFound.push(dateStr)
      } else {
        count++
      }
    }

    current.setDate(current.getDate() + 1)
  }

  return { count, holidayDates: holidayDatesFound }
}

/**
 * Obtém ou inicializa o saldo de férias de um colaborador para um dado ano
 */
export async function getOrCreateLeaveBalance(employeeId: string, year: number = new Date().getFullYear()) {
  let balance = await prisma.hrLeaveBalance.findUnique({
    where: { employeeId_year: { employeeId, year } },
  })

  if (!balance) {
    const config = await prisma.hrConfig.findUnique({ where: { id: 'global' } })
    const defaultDays = config?.annualLeaveDaysDefault ?? 22

    // Verificar data de admissão para cálculo proporcional se admitido no ano corrente
    const employee = await prisma.hrEmployee.findUnique({
      where: { id: employeeId },
      select: { admissionDate: true },
    })

    let entitledDays = defaultDays
    if (employee && employee.admissionDate) {
      const admissionYear = new Date(employee.admissionDate).getFullYear()
      if (admissionYear === year) {
        const admissionMonth = new Date(employee.admissionDate).getMonth() // 0-11
        const remainingMonths = 12 - admissionMonth
        entitledDays = Math.max(2, Math.round((defaultDays / 12) * remainingMonths))
      }
    }

    balance = await prisma.hrLeaveBalance.create({
      data: {
        employeeId,
        year,
        entitledDays,
        carriedOverDays: 0,
        usedDays: 0,
        pendingDays: 0,
      },
    })
  }

  return balance
}

/**
 * Submete um pedido de ausência/férias
 */
export async function submitLeaveRequest(
  actor: HrUserContext,
  data: {
    employeeId: string
    leaveTypeId: string
    startDate: Date
    endDate: Date
    reason: string
    attachmentPath?: string | null
    attachmentName?: string | null
  }
) {
  const { employeeId, leaveTypeId, startDate, endDate, reason, attachmentPath, attachmentName } = data

  if (startDate > endDate) {
    throw new Error('A data de início não pode ser posterior à data de fim.')
  }

  const employee = await prisma.hrEmployee.findUnique({
    where: { id: employeeId },
    include: {
      contracts: { where: { status: 'ACTIVO' }, take: 1 },
      department: true,
    },
  })

  if (!employee) throw new Error('Colaborador não encontrado.')

  if (employee.status === 'DESLIGADO' || employee.status === 'SUSPENSO') {
    throw new Error(`Pedido não permitido: Colaborador com estado "${employee.status}".`)
  }

  const leaveType = await prisma.hrLeaveType.findUnique({
    where: { id: leaveTypeId },
  })
  if (!leaveType || !leaveType.active) {
    throw new Error('Tipo de licença inválido ou inactivo.')
  }

  // 1. Validar anexo obrigatório
  if (leaveType.requiresDocument && !attachmentPath) {
    throw new Error(`O tipo de ausência "${leaveType.name}" exige a apresentação de documento comprovativo (ex.: atestado médico).`)
  }

  // 2. Calcular dias úteis
  const contractScheme = employee.contracts[0]?.workDays || 'SEG-SEX'
  const { count: workingDaysCount } = await calculateWorkingDays(startDate, endDate, contractScheme)

  if (workingDaysCount <= 0) {
    throw new Error('O intervalo selecionado não contém dias úteis de trabalho.')
  }

  if (leaveType.maxDays && workingDaysCount > leaveType.maxDays) {
    throw new Error(`O limite máximo para "${leaveType.name}" é de ${leaveType.maxDays} dias úteis (selecionou ${workingDaysCount}).`)
  }

  // 3. Verificar sobreposição com pedidos existentes do colaborador
  const overlapping = await prisma.hrLeaveRequest.findFirst({
    where: {
      employeeId,
      status: { in: ['PENDENTE', 'APROVADO'] },
      OR: [
        { startDate: { lte: endDate }, endDate: { gte: startDate } },
      ],
    },
  })
  if (overlapping) {
    throw new Error('Já existe um pedido de ausência registado ou pendente para este colaborador no mesmo período.')
  }

  // 4. Se desconta do saldo de férias, validar disponibilidade
  const currentYear = startDate.getFullYear()
  let leaveBalance = null
  if (leaveType.deductsFromBalance) {
    leaveBalance = await getOrCreateLeaveBalance(employeeId, currentYear)
    const available = leaveBalance.entitledDays + leaveBalance.carriedOverDays - leaveBalance.usedDays - leaveBalance.pendingDays
    if (available < workingDaysCount) {
      throw new Error(`Saldo de férias insuficiente. Disponível: ${available} dias úteis; Solicitado: ${workingDaysCount} dias úteis.`)
    }
  }

  // 5. Verificar conflito de departamento (Aviso informativo)
  const colleaguesAbsent = await prisma.hrLeaveRequest.count({
    where: {
      status: 'APROVADO',
      startDate: { lte: endDate },
      endDate: { gte: startDate },
      employee: {
        departmentId: employee.departmentId,
        id: { not: employeeId },
      },
    },
  })

  // 6. Transacção: Gravar pedido + Atualizar dias pendentes + Notificar
  const request = await prisma.$transaction(async (tx) => {
    const created = await tx.hrLeaveRequest.create({
      data: {
        employeeId,
        leaveTypeId,
        startDate,
        endDate,
        workingDaysCount,
        reason,
        attachmentPath: attachmentPath || null,
        attachmentName: attachmentName || null,
        status: 'PENDENTE',
      },
    })

    if (leaveType.deductsFromBalance && leaveBalance) {
      await tx.hrLeaveBalance.update({
        where: { id: leaveBalance.id },
        data: { pendingDays: { increment: workingDaysCount } },
      })
    }

    await logAudit(
      {
        userId: actor.id,
        userName: actor.name || actor.email,
        userRole: actor.role,
        action: 'CRIAR',
        resource: 'AUSENCIA',
        resourceId: created.id,
        details: `Submissão de pedido de ausência "${leaveType.name}" (${workingDaysCount} dias úteis) para ${employee.fullName}.`,
        newValue: {
          leaveType: leaveType.name,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          workingDaysCount,
          reason,
        },
      },
      tx
    )

    // Notificação in-app para a equipa de RH
    await tx.hrNotification.create({
      data: {
        type: 'NOVO_PEDIDO_RH',
        title: `Novo Pedido de ${leaveType.name}`,
        message: `${employee.fullName} solicitou ${workingDaysCount} dias úteis de ausência (${startDate.toLocaleDateString('pt-AO')} a ${endDate.toLocaleDateString('pt-AO')}).`,
        link: '/rh/ausencias',
      },
    })

    return created
  })

  return {
    request,
    colleaguesAbsentWarning: colleaguesAbsent > 0 ? `${colleaguesAbsent} colega(s) do mesmo departamento (${employee.department.name}) já têm ausência aprovada neste intervalo.` : null,
  }
}

/**
 * Decisão sobre pedido de ausência (Aprovar / Rejeitar) com Regra dos 4 Olhos
 */
export async function reviewLeaveRequest(
  reviewer: HrUserContext,
  requestId: string,
  decision: 'APROVADO' | 'REJEITADO',
  reviewComment?: string
) {
  const request = await prisma.hrLeaveRequest.findUnique({
    where: { id: requestId },
    include: {
      employee: { include: { userRef: true } },
      leaveType: true,
    },
  })

  if (!request) throw new Error('Pedido de ausência não encontrado.')
  if (request.status !== 'PENDENTE') {
    throw new Error(`Este pedido já se encontra no estado "${request.status}".`)
  }

  // Validação da Regra dos 4 Olhos
  const requesterRole = request.employee.userRef?.role || 'FUNCIONARIO'
  const approvalCheck = canApproveRequest(reviewer, {
    role: requesterRole,
    employeeId: request.employeeId,
    userId: request.employee.userId,
  })

  if (!approvalCheck.allowed) {
    throw new Error(approvalCheck.reason || 'Não autorizado a aprovar este pedido.')
  }

  const currentYear = request.startDate.getFullYear()

  return prisma.$transaction(async (tx) => {
    // Atualizar saldo de férias se aplicável
    if (request.leaveType.deductsFromBalance) {
      const balance = await tx.hrLeaveBalance.findUnique({
        where: { employeeId_year: { employeeId: request.employeeId, year: currentYear } },
      })

      if (balance) {
        if (decision === 'APROVADO') {
          await tx.hrLeaveBalance.update({
            where: { id: balance.id },
            data: {
              pendingDays: Math.max(0, balance.pendingDays - request.workingDaysCount),
              usedDays: balance.usedDays + request.workingDaysCount,
            },
          })
        } else {
          // Rejeitado devolve dias pendentes
          await tx.hrLeaveBalance.update({
            where: { id: balance.id },
            data: {
              pendingDays: Math.max(0, balance.pendingDays - request.workingDaysCount),
            },
          })
        }
      }
    }

    const updated = await tx.hrLeaveRequest.update({
      where: { id: requestId },
      data: {
        status: decision,
        reviewedById: reviewer.id,
        reviewedByName: reviewer.name || reviewer.email,
        reviewComment: reviewComment || null,
        reviewedAt: new Date(),
      },
    })

    await logAudit(
      {
        userId: reviewer.id,
        userName: reviewer.name || reviewer.email,
        userRole: reviewer.role,
        action: 'APROVAR',
        resource: 'AUSENCIA',
        resourceId: requestId,
        details: `Decisão de ausência: ${decision} para ${request.employee.fullName} (${request.leaveType.name}, ${request.workingDaysCount} dias). Comentário: ${reviewComment || 'Nenhum'}.`,
        newValue: { decision, reviewComment },
      },
      tx
    )

    // Notificação in-app para o colaborador
    if (request.employee.userId) {
      await tx.hrNotification.create({
        data: {
          recipientUserId: request.employee.userId,
          employeeId: request.employeeId,
          type: 'DECISAO_PEDIDO',
          title: `Pedido de ${request.leaveType.name} ${decision === 'APROVADO' ? 'Aprovado' : 'Rejeitado'}`,
          message: `O seu pedido de ausência para o período ${request.startDate.toLocaleDateString('pt-AO')} a ${request.endDate.toLocaleDateString('pt-AO')} foi ${decision.toLowerCase()}.`,
          link: '/portal',
        },
      })
    }

    // Alerta por e-mail para o colaborador
    if (request.employee.email) {
      sendEmail({
        to: request.employee.email,
        subject: `[J.Matos RH] Decisão do Pedido de Ausência: ${decision}`,
        html: `
          <div style="font-family: sans-serif; color: #1A202C;">
            <h2>Olá, ${request.employee.fullName}</h2>
            <p>Informamos que o seu pedido de <strong>${request.leaveType.name}</strong> para o período de <strong>${request.startDate.toLocaleDateString('pt-AO')}</strong> a <strong>${request.endDate.toLocaleDateString('pt-AO')}</strong> foi <strong>${decision}</strong>.</p>
            ${reviewComment ? `<p><strong>Observações da Direcção de RH:</strong> ${reviewComment}</p>` : ''}
            <p>Pode consultar o seu saldo e histórico actualizado no <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/portal">Portal do Colaborador</a>.</p>
          </div>
        `,
      }).catch((e: any) => console.error('Erro ao enviar e-mail de notificação de ausência:', e))
    }

    return updated
  })
}

/**
 * Cancelamento de pedido pelo próprio colaborador
 */
export async function cancelLeaveRequest(actor: HrUserContext, requestId: string) {
  const request = await prisma.hrLeaveRequest.findUnique({
    where: { id: requestId },
    include: { leaveType: true },
  })

  if (!request) throw new Error('Pedido não encontrado.')

  if (actor.employeeId !== request.employeeId) {
    throw new Error('Não tem permissão para cancelar pedidos de outros colaboradores.')
  }

  if (request.status === 'CANCELADO' || request.status === 'REJEITADO') {
    throw new Error(`Este pedido já se encontra no estado "${request.status}".`)
  }

  const currentYear = request.startDate.getFullYear()

  return prisma.$transaction(async (tx) => {
    // Se estava aprovado ou pendente e descontava de férias, devolver dias ao saldo
    if (request.leaveType.deductsFromBalance) {
      const balance = await tx.hrLeaveBalance.findUnique({
        where: { employeeId_year: { employeeId: request.employeeId, year: currentYear } },
      })
      if (balance) {
        if (request.status === 'APROVADO') {
          await tx.hrLeaveBalance.update({
            where: { id: balance.id },
            data: { usedDays: Math.max(0, balance.usedDays - request.workingDaysCount) },
          })
        } else if (request.status === 'PENDENTE') {
          await tx.hrLeaveBalance.update({
            where: { id: balance.id },
            data: { pendingDays: Math.max(0, balance.pendingDays - request.workingDaysCount) },
          })
        }
      }
    }

    const updated = await tx.hrLeaveRequest.update({
      where: { id: requestId },
      data: { status: 'CANCELADO' },
    })

    await logAudit(
      {
        userId: actor.id,
        userName: actor.name || actor.email,
        userRole: actor.role,
        action: 'MUDAR_ESTADO',
        resource: 'AUSENCIA',
        resourceId: requestId,
        details: `Cancelamento de pedido de ausência pelo próprio colaborador (${request.workingDaysCount} dias devolvidos).`,
        newValue: { status: 'CANCELADO' },
      },
      tx
    )

    return updated
  })
}
