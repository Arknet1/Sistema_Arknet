import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan, can } from '@/lib/hr/permissions'
import { recordHrAudit } from '@/lib/hr/audit'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    assertCan(session, 'VER_CONTRATO', 'CONTRATO')

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')?.trim() || ''
    const employeeId = searchParams.get('employeeId')?.trim() || ''
    const expiringSoon = searchParams.get('expiringSoon') === 'true'

    const where: any = {}
    if (status) where.status = status
    if (employeeId) where.employeeId = employeeId

    if (expiringSoon) {
      const now = new Date()
      const future = new Date()
      future.setDate(now.getDate() + 45) // Próximos 45 dias
      where.status = 'ACTIVO'
      where.endDate = { lte: future, gte: now }
    }

    const contracts = await prisma.hrContract.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeNumber: true,
            department: { select: { id: true, name: true } },
            position: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const canViewSensitive = can(session, 'VER_DADOS_SENSIVEIS', 'CONTRATO')

    const sanitized = contracts.map((ctr) => ({
      ...ctr,
      baseSalary: canViewSensitive ? ctr.baseSalary : undefined,
    }))

    return NextResponse.json({ success: true, contracts: sanitized })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao listar contratos.' }, { status: 403 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    assertCan(session, 'CRIAR_CONTRATO', 'CONTRATO')

    const body = await request.json()
    const employeeId = String(body.employeeId || '').trim()
    const type = String(body.type || 'INDETERMINADO').trim().toUpperCase()
    const startDate = body.startDate ? new Date(body.startDate) : null
    const endDate = body.endDate ? new Date(body.endDate) : null
    const baseSalaryNum = body.baseSalary !== undefined ? Number(body.baseSalary) : null
    const workDays = String(body.workDays || 'SEG-SEX').trim()
    const dailyHours = body.dailyHours ? Number(body.dailyHours) : 8.0
    const weeklyHours = body.weeklyHours ? Number(body.weeklyHours) : 40.0
    const status = String(body.status || 'RASCUNHO').trim().toUpperCase()

    if (!employeeId || !startDate || baseSalaryNum === null || isNaN(baseSalaryNum)) {
      return NextResponse.json({
        error: 'Preencha o colaborador, a data de início e o salário base.',
      }, { status: 400 })
    }

    // REGRA 8: Contrato a termo exige endDate!
    const requiresEndDate = type === 'DETERMINADO' || type === 'ESTAGIO' || type === 'PRESTACAO_SERVICOS'
    if (requiresEndDate && !endDate) {
      return NextResponse.json({
        error: `Contratos do tipo "${type}" exigem obrigatoriamente a data de término (endDate).`,
      }, { status: 400 })
    }

    if (endDate && endDate <= startDate) {
      return NextResponse.json({
        error: 'A data de término deve ser posterior à data de início do contrato.',
      }, { status: 400 })
    }

    const employee = await prisma.hrEmployee.findUnique({
      where: { id: employeeId },
      include: { contracts: { where: { status: 'ACTIVO' } } },
    })

    if (!employee) {
      return NextResponse.json({ error: 'Colaborador não encontrado.' }, { status: 404 })
    }

    if (employee.status === 'DESLIGADO') {
      return NextResponse.json({ error: 'Não é permitido criar contratos para colaboradores desligados.' }, { status: 400 })
    }

    // REGRA 8: No máximo 1 contrato ACTIVO por funcionário!
    if (status === 'ACTIVO' && employee.contracts.length > 0) {
      return NextResponse.json({
        error: `O colaborador já possui um contrato ativo (${employee.contracts[0].contractNumber}). Encerre ou rescinda o contrato anterior antes de ativar um novo.`,
      }, { status: 400 })
    }

    // Gerar número de contrato sequencial
    const count = await prisma.hrContract.count()
    const contractNumber = body.contractNumber
      ? String(body.contractNumber).trim().toUpperCase()
      : `ARK-CTR-2026-${String(count + 1).padStart(3, '0')}`

    const isApproved = status === 'ACTIVO'

    const result = await prisma.$transaction(async (tx) => {
      const contract = await tx.hrContract.create({
        data: {
          contractNumber,
          employeeId,
          type,
          startDate,
          endDate,
          baseSalary: new Prisma.Decimal(baseSalaryNum),
          workDays,
          dailyHours: new Prisma.Decimal(dailyHours),
          weeklyHours: new Prisma.Decimal(weeklyHours),
          status,
          approvedBy: isApproved ? session.name || session.email : null,
          approvedAt: isApproved ? new Date() : null,
          createdBy: session.name || session.email,
        },
        include: { employee: true },
      })

      // REGRA 6: Auditoria na mesma transação com salário confidencial
      await recordHrAudit(tx, {
        user: session,
        action: 'CRIAR',
        resource: 'CONTRATO',
        resourceId: contract.id,
        details: `Criou o contrato ${contract.contractNumber} (${contract.type}) para ${contract.employee.fullName}.`,
        newValue: contract,
      })

      return contract
    })

    return NextResponse.json({ success: true, contract: result }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar contrato.' }, { status: 400 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    assertCan(session, 'EDITAR_CONTRATO', 'CONTRATO')

    const body = await request.json()
    const id = String(body.id || '').trim()
    if (!id) {
      return NextResponse.json({ error: 'ID do contrato obrigatório.' }, { status: 400 })
    }

    const current = await prisma.hrContract.findUnique({
      where: { id },
      include: { employee: { include: { contracts: { where: { status: 'ACTIVO' } } } } },
    })

    if (!current) {
      return NextResponse.json({ error: 'Contrato não encontrado.' }, { status: 404 })
    }

    const newStatus = body.status ? String(body.status).toUpperCase() : current.status
    const isActivating = newStatus === 'ACTIVO' && current.status !== 'ACTIVO'

    // REGRA 8: No máximo 1 contrato ACTIVO por funcionário!
    if (isActivating) {
      const otherActive = current.employee.contracts.find((c) => c.id !== id)
      if (otherActive) {
        return NextResponse.json({
          error: `O colaborador já possui um contrato ativo (${otherActive.contractNumber}). Não é permitido ter mais de um contrato ativo.`,
        }, { status: 400 })
      }
    }

    const type = body.type ? String(body.type).toUpperCase() : current.type
    const startDate = body.startDate ? new Date(body.startDate) : current.startDate
    const endDate = body.endDate !== undefined ? (body.endDate ? new Date(body.endDate) : null) : current.endDate

    // REGRA 8: Contrato a termo exige endDate
    const requiresEndDate = type === 'DETERMINADO' || type === 'ESTAGIO' || type === 'PRESTACAO_SERVICOS'
    if (requiresEndDate && !endDate) {
      return NextResponse.json({
        error: `Contratos do tipo "${type}" exigem obrigatoriamente data de término.`,
      }, { status: 400 })
    }

    const baseSalary = body.baseSalary !== undefined ? new Prisma.Decimal(body.baseSalary) : current.baseSalary
    const workDays = body.workDays || current.workDays
    const dailyHours = body.dailyHours !== undefined ? new Prisma.Decimal(body.dailyHours) : current.dailyHours
    const weeklyHours = body.weeklyHours !== undefined ? new Prisma.Decimal(body.weeklyHours) : current.weeklyHours

    const updated = await prisma.$transaction(async (tx) => {
      const contract = await tx.hrContract.update({
        where: { id },
        data: {
          type,
          startDate,
          endDate,
          baseSalary,
          workDays,
          dailyHours,
          weeklyHours,
          status: newStatus,
          approvedBy: isActivating ? session.name || session.email : current.approvedBy,
          approvedAt: isActivating ? new Date() : current.approvedAt,
        },
      })

      await recordHrAudit(tx, {
        user: session,
        action: isActivating ? 'APROVAR' : 'EDITAR',
        resource: 'CONTRATO',
        resourceId: id,
        details: isActivating
          ? `Aprovou e ativou o contrato ${contract.contractNumber}.`
          : `Atualizou o contrato ${contract.contractNumber}.`,
        oldValue: current,
        newValue: contract,
      })

      return contract
    })

    return NextResponse.json({ success: true, contract: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar contrato.' }, { status: 400 })
  }
}

// REGRA 5: Sem hard delete em contratos! Só mudança de estado
export async function DELETE(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    assertCan(session, 'EDITAR_CONTRATO', 'CONTRATO')

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID do contrato obrigatório.' }, { status: 400 })
    }

    const current = await prisma.hrContract.findUnique({ where: { id } })
    if (!current) {
      return NextResponse.json({ error: 'Contrato não encontrado.' }, { status: 404 })
    }

    const updated = await prisma.$transaction(async (tx) => {
      const rescinded = await tx.hrContract.update({
        where: { id },
        data: { status: 'RESCINDIDO' },
      })

      await recordHrAudit(tx, {
        user: session,
        action: 'MUDAR_ESTADO',
        resource: 'CONTRATO',
        resourceId: id,
        details: `Rescindiu o contrato ${current.contractNumber} (soft delete).`,
        oldValue: current,
        newValue: rescinded,
      })

      return rescinded
    })

    return NextResponse.json({ success: true, message: `Contrato ${updated.contractNumber} rescindido com sucesso.` })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao rescindir contrato.' }, { status: 400 })
  }
}
