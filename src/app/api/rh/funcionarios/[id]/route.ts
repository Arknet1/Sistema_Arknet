import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan, can, maskSensitiveData } from '@/lib/hr/permissions'
import { recordHrAudit } from '@/lib/hr/audit'
import { Prisma } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getHrServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    const { id } = await params
    const employee = await prisma.hrEmployee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        directSupervisor: { select: { id: true, fullName: true, employeeNumber: true } },
        subordinates: { select: { id: true, fullName: true, employeeNumber: true } },
        userRef: { select: { id: true, email: true, role: true, status: true, mustChangePassword: true, lastLogin: true } },
        contracts: { orderBy: { createdAt: 'desc' } },
        documents: { where: { status: 'ACTIVO' }, orderBy: { createdAt: 'desc' } },
        careerHistory: { orderBy: { changeDate: 'desc' } },
      },
    })

    if (!employee) {
      return NextResponse.json({ error: 'Colaborador não encontrado.' }, { status: 404 })
    }

    // O técnico só pode consultar fichas de colaboradores; funcionários veem apenas a própria ficha.
    assertCan(session, 'VER_FICHA_FUNCIONARIO', 'FUNCIONARIO', {
      targetEmployeeId: employee.id,
      targetUserId: employee.userId,
      targetUserRole: employee.userRef?.role ?? null,
    })

    const canViewSensitive = can(session, 'VER_DADOS_SENSIVEIS', 'FUNCIONARIO', {
      targetEmployeeId: employee.id,
      targetUserId: employee.userId,
      targetUserRole: employee.userRef?.role ?? null,
    })

    const masked = maskSensitiveData(employee, canViewSensitive)
    return NextResponse.json({ success: true, employee: masked })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao carregar colaborador.' }, { status: 403 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getHrServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    const { id } = await params
    const current = await prisma.hrEmployee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        contracts: { where: { status: 'ACTIVO' } },
        userRef: { select: { role: true } },
      },
    })

    if (!current) {
      return NextResponse.json({ error: 'Colaborador não encontrado.' }, { status: 404 })
    }

    assertCan(session, 'EDITAR_FUNCIONARIO', 'FUNCIONARIO', {
      targetEmployeeId: current.id,
      targetUserId: current.userId,
      targetUserRole: current.userRef?.role ?? null,
    })

    const body = await request.json()

    // Atualização com transação atómica
    const updated = await prisma.$transaction(async (tx) => {
      const newStatus = body.status ? String(body.status).toUpperCase() : current.status
      const isDesligado = newStatus === 'DESLIGADO'

      // Se mudar para DESLIGADO:
      // REGRA 4: Funcionário DESLIGADO => utilizador inactivo, login bloqueado
      if (isDesligado && current.userId) {
        await tx.adminUser.update({
          where: { id: current.userId },
          data: { status: 'inactive' },
        })
      }

      // Se desligado, rescindir contratos activos
      if (isDesligado) {
        await tx.hrContract.updateMany({
          where: { employeeId: id, status: 'ACTIVO' },
          data: { status: 'RESCINDIDO' },
        })
      }

      // Se mudou de departamento ou cargo, registar no histórico de carreira
      const hasDeptChanged = body.departmentId && body.departmentId !== current.departmentId
      const hasPositionChanged = body.positionId && body.positionId !== current.positionId

      const empUpdated = await tx.hrEmployee.update({
        where: { id },
        data: {
          fullName: body.fullName ? String(body.fullName).trim() : current.fullName,
          phone: body.phone ? String(body.phone).trim() : current.phone,
          email: body.email ? String(body.email).trim().toLowerCase() : current.email,
          address: body.address ? String(body.address).trim() : current.address,
          city: body.city ? String(body.city).trim() : current.city,
          province: body.province ? String(body.province).trim() : current.province,
          bankName: body.bankName !== undefined ? body.bankName : current.bankName,
          bankIban: body.bankIban !== undefined ? (body.bankIban ? String(body.bankIban).trim().toUpperCase() : null) : current.bankIban,
          bankAccountNumber: body.bankAccountNumber !== undefined ? body.bankAccountNumber : current.bankAccountNumber,
          status: newStatus,
          departmentId: body.departmentId || current.departmentId,
          positionId: body.positionId || current.positionId,
          directSupervisorId: body.directSupervisorId !== undefined ? body.directSupervisorId : current.directSupervisorId,
        },
        include: { department: true, position: true },
      })

      if (hasDeptChanged || hasPositionChanged) {
        const activeContract = current.contracts[0]
        const salary = activeContract?.baseSalary || new Prisma.Decimal(0)

        await tx.hrCareerHistory.create({
          data: {
            employeeId: id,
            position: empUpdated.position.title,
            department: empUpdated.department.name,
            salary,
            changeReason: body.changeReason || (hasPositionChanged ? 'Promoção/Mudança de Cargo' : 'Transferência de Departamento'),
            changeDate: new Date(),
            registeredBy: session.name || session.email,
          },
        })
      }

      // REGRA 6: Auditoria na mesma transação com campos sensíveis mascarados
      await recordHrAudit(tx, {
        user: session,
        action: isDesligado ? 'MUDAR_ESTADO' : 'EDITAR',
        resource: 'FUNCIONARIO',
        resourceId: id,
        details: isDesligado
          ? `Desligou o colaborador ${current.fullName} (${current.employeeNumber}). Conta associada inativada.`
          : `Atualizou os dados da ficha do colaborador ${current.fullName}.`,
        oldValue: current,
        newValue: empUpdated,
      })

      return empUpdated
    })

    return NextResponse.json({ success: true, employee: updated })
  } catch (error: any) {
    const denied = error.message?.startsWith('Acesso negado:')
    return NextResponse.json({ error: error.message || 'Erro ao atualizar colaborador.' }, { status: denied ? 403 : 400 })
  }
}

// REGRA 5: Sem hard delete em funcionários! Só mudança de estado para DESLIGADO
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getHrServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    const { id } = await params
    const current = await prisma.hrEmployee.findUnique({
      where: { id },
      include: { userRef: { select: { role: true } } },
    })
    if (!current) {
      return NextResponse.json({ error: 'Colaborador não encontrado.' }, { status: 404 })
    }

    assertCan(session, 'DESLIGAR_FUNCIONARIO', 'FUNCIONARIO', {
      targetEmployeeId: current.id,
      targetUserId: current.userId,
      targetUserRole: current.userRef?.role ?? null,
    })

    // Desligar o colaborador e inativar o utilizador
    await prisma.$transaction(async (tx) => {
      if (current.userId) {
        await tx.adminUser.update({
          where: { id: current.userId },
          data: { status: 'inactive' },
        })
      }

      await tx.hrContract.updateMany({
        where: { employeeId: id, status: 'ACTIVO' },
        data: { status: 'RESCINDIDO' },
      })

      const updated = await tx.hrEmployee.update({
        where: { id },
        data: { status: 'DESLIGADO' },
      })

      await recordHrAudit(tx, {
        user: session,
        action: 'DESLIGAR',
        resource: 'FUNCIONARIO',
        resourceId: id,
        details: `Desligou o colaborador ${current.fullName} (${current.employeeNumber}). Utilizador inativado.`,
        oldValue: current,
        newValue: updated,
      })
    })

    return NextResponse.json({
      success: true,
      message: `Colaborador ${current.fullName} foi desligado com sucesso. A sua conta de acesso foi inativada.`,
    })
  } catch (error: any) {
    const denied = error.message?.startsWith('Acesso negado:')
    return NextResponse.json({ error: error.message || 'Erro ao desligar colaborador.' }, { status: denied ? 403 : 400 })
  }
}
