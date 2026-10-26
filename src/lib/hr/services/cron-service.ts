import { PrismaClient } from '@prisma/client'
import { getLuandaDateString, isWorkingDayOfWeek } from './time-service'
import { sendEmail } from '../alerts'

const prisma = new PrismaClient()

/**
 * Tarefa Agendada 1: Lembrete de Marcação de Ponto
 * Avisa colaboradores que ainda não marcaram entrada X minutos após o início previsto,
 * exceto quem está em férias/licença ou em feriado.
 */
export async function runCheckInReminderTask() {
  const now = new Date()
  const todayStr = getLuandaDateString(now)

  // 1. Verificar se hoje é feriado
  const holiday = await prisma.hrHoliday.findUnique({
    where: { date: todayStr },
  })
  if (holiday) {
    return { skipped: true, reason: `Hoje é feriado: ${holiday.name}` }
  }

  const config = await prisma.hrConfig.findUnique({ where: { id: 'global' } })
  const reminderMinutes = config?.checkInReminderMinutes ?? 15

  // 2. Colaboradores activos com contrato activo
  const activeEmployees = await prisma.hrEmployee.findMany({
    where: { status: 'ACTIVO' },
    include: {
      contracts: { where: { status: 'ACTIVO' }, take: 1 },
      userRef: true,
    },
  })

  let remindedCount = 0

  for (const emp of activeEmployees) {
    const contract = emp.contracts[0]
    if (!contract) continue

    // Verifica se hoje é dia de trabalho para este colaborador
    const isWorkDay = isWorkingDayOfWeek(now, contract.workDays)
    if (!isWorkDay) continue

    // Verifica se está em licença ou férias aprovadas
    const todayDate = new Date(now)
    todayDate.setHours(0, 0, 0, 0)
    const onLeave = await prisma.hrLeaveRequest.findFirst({
      where: {
        employeeId: emp.id,
        status: 'APROVADO',
        startDate: { lte: todayDate },
        endDate: { gte: todayDate },
      },
    })
    if (onLeave) continue

    // Verifica se já picou ponto hoje
    const workDay = await prisma.hrWorkDay.findUnique({
      where: { employeeId_date: { employeeId: emp.id, date: todayStr } },
      include: { timeEntries: true },
    })

    const hasCheckIn = workDay && workDay.timeEntries.some((e) => e.type === 'ENTRADA')
    if (hasCheckIn) continue

    // Verifica se já foi enviado lembrete hoje (prevenção de duplicados com HrAlertLog)
    const alreadyAlerted = await prisma.hrAlertLog.findFirst({
      where: {
        alertType: 'LEMBRETE_PONTO',
        targetId: emp.id,
        sentAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        },
      },
    })
    if (alreadyAlerted) continue

    // Criar notificação in-app
    if (emp.userId) {
      await prisma.hrNotification.create({
        data: {
          recipientUserId: emp.userId,
          employeeId: emp.id,
          type: 'LEMBRETE_PONTO',
          title: 'Lembrete de Ponto',
          message: 'Ainda não registou a sua entrada de hoje. Aceda ao portal para picar o ponto.',
          link: '/portal',
        },
      })
    }

    // Registar em HrAlertLog para evitar duplicados
    await prisma.hrAlertLog.create({
      data: {
        alertType: 'LEMBRETE_PONTO',
        targetId: emp.id,
        channel: 'EMAIL',
        sentTo: emp.email,
        metadata: JSON.stringify({ employeeNumber: emp.employeeNumber, date: todayStr }),
      },
    })

    // Enviar e-mail de lembrete
    sendEmail({
      to: emp.email,
      subject: '[J.Matos RH] Lembrete de Registo de Ponto',
      html: `
        <div style="font-family: sans-serif; color: #1A202C;">
          <h2>Olá, ${emp.fullName}</h2>
          <p>Constatámos que ainda não registou a sua entrada para o dia de hoje (<strong>${todayStr}</strong>).</p>
          <p>Por favor, aceda ao <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/portal">Portal do Colaborador</a> para picar o ponto.</p>
        </div>
      `,
    }).catch((e: any) => console.error('Erro no envio de email de lembrete:', e))

    remindedCount++
  }

  return { success: true, remindedCount }
}

/**
 * Tarefa Agendada 2: Fecho do Dia
 * Assinala "saída em falta" nos dias sem saída registada e notifica funcionário e RH
 */
export async function runDayClosingTask() {
  const now = new Date()
  const todayStr = getLuandaDateString(now)

  // Encontrar dias de hoje ou dias anteriores sem saída registada
  const incompleteWorkDays = await prisma.hrWorkDay.findMany({
    where: {
      isComplete: false,
      actualIn: { not: null },
      actualOut: null,
      status: { not: 'SAIDA_EM_FALTA' },
    },
    include: {
      employee: { include: { userRef: true } },
    },
  })

  let updatedCount = 0

  for (const wd of incompleteWorkDays) {
    await prisma.hrWorkDay.update({
      where: { id: wd.id },
      data: { status: 'SAIDA_EM_FALTA' },
    })

    // Notificar colaborador
    if (wd.employee.userId) {
      await prisma.hrNotification.create({
        data: {
          recipientUserId: wd.employee.userId,
          employeeId: wd.employeeId,
          type: 'SAIDA_EM_FALTA',
          title: 'Saída em Falta',
          message: `O dia de trabalho ${wd.date} foi encerrado sem marcação de saída. Por favor, submeta um pedido de correcção com o horário real.`,
          link: '/portal',
        },
      })
    }

    // Notificar RH
    await prisma.hrNotification.create({
      data: {
        type: 'SAIDA_EM_FALTA',
        title: 'Saída em Falta Detectada',
        message: `O colaborador ${wd.employee.fullName} (${wd.employee.employeeNumber}) não registou a saída para o dia ${wd.date}.`,
        link: '/rh/ponto',
      },
    })

    updatedCount++
  }

  return { success: true, updatedCount }
}

/**
 * Tarefa Agendada 3: Limpeza de Dados de Geolocalização (GPS)
 * Purga latitude e longitude de registos anteriores ao período de retenção (default 12 meses)
 */
export async function runGpsCleanupTask() {
  const config = await prisma.hrConfig.findUnique({ where: { id: 'global' } })
  const retentionMonths = config?.gpsRetentionMonths ?? 12

  const cutoffDate = new Date()
  cutoffDate.setMonth(cutoffDate.getMonth() - retentionMonths)

  const result = await prisma.hrTimeEntry.updateMany({
    where: {
      createdAt: { lt: cutoffDate },
      OR: [
        { latitude: { not: null } },
        { longitude: { not: null } },
      ],
    },
    data: {
      latitude: null,
      longitude: null,
      accuracyMeters: null,
    },
  })

  return { success: true, cleanedCount: result.count }
}
