import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { logAudit } from '@/lib/hr/audit'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'CONFIGURAR_PONTO_AUSENCIAS')

    let config = await prisma.hrConfig.findUnique({ where: { id: 'global' } })
    if (!config) {
      config = await prisma.hrConfig.create({
        data: { id: 'global' },
      })
    }

    const locations = await prisma.hrWorkLocation.findMany({ orderBy: { createdAt: 'desc' } })
    const leaveTypes = await prisma.hrLeaveType.findMany({ orderBy: { order: 'asc' } })
    const holidays = await prisma.hrHoliday.findMany({ orderBy: { date: 'asc' } })

    return NextResponse.json({
      success: true,
      data: {
        config,
        locations,
        leaveTypes,
        holidays,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao carregar configurações.' }, { status: 400 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'CONFIGURAR_PONTO_AUSENCIAS')

    const body = await request.json()
    const {
      punctualityToleranceMinutes,
      roundingMinutes,
      dailyOvertimeLimitMinutes,
      monthlyOvertimeLimitMinutes,
      checkInReminderMinutes,
      gpsRetentionMonths,
      annualLeaveDaysDefault,
      notifyEmail,
    } = body

    const previousConfig = await prisma.hrConfig.findUnique({ where: { id: 'global' } })

    const updated = await prisma.hrConfig.upsert({
      where: { id: 'global' },
      update: {
        punctualityToleranceMinutes: punctualityToleranceMinutes != null ? Number(punctualityToleranceMinutes) : undefined,
        roundingMinutes: roundingMinutes != null ? Number(roundingMinutes) : undefined,
        dailyOvertimeLimitMinutes: dailyOvertimeLimitMinutes != null ? Number(dailyOvertimeLimitMinutes) : null,
        monthlyOvertimeLimitMinutes: monthlyOvertimeLimitMinutes != null ? Number(monthlyOvertimeLimitMinutes) : null,
        checkInReminderMinutes: checkInReminderMinutes != null ? Number(checkInReminderMinutes) : undefined,
        gpsRetentionMonths: gpsRetentionMonths != null ? Number(gpsRetentionMonths) : undefined,
        annualLeaveDaysDefault: annualLeaveDaysDefault != null ? Number(annualLeaveDaysDefault) : undefined,
        notifyEmail: notifyEmail || undefined,
      },
      create: {
        id: 'global',
        punctualityToleranceMinutes: Number(punctualityToleranceMinutes) || 10,
        roundingMinutes: Number(roundingMinutes) || 0,
        dailyOvertimeLimitMinutes: dailyOvertimeLimitMinutes ? Number(dailyOvertimeLimitMinutes) : null,
        monthlyOvertimeLimitMinutes: monthlyOvertimeLimitMinutes ? Number(monthlyOvertimeLimitMinutes) : null,
        checkInReminderMinutes: Number(checkInReminderMinutes) || 15,
        gpsRetentionMonths: Number(gpsRetentionMonths) || 12,
        annualLeaveDaysDefault: Number(annualLeaveDaysDefault) || 22,
        notifyEmail: notifyEmail || 'rh@arknet.co.ao',
      },
    })

    await logAudit({
      userId: session?.id,
      userName: session?.name || session?.email || 'Sistema',
      userRole: session?.role || 'TECNICO_RH',
      action: 'EDITAR',
      resource: 'CONFIGURACAO',
      resourceId: 'global',
      details: 'Actualização das configurações de Ponto e Ausências.',
      oldValue: previousConfig,
      newValue: updated,
    })

    return NextResponse.json({
      success: true,
      message: 'Configurações actualizadas com sucesso.',
      data: updated,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao guardar configurações.' }, { status: 400 })
  }
}
