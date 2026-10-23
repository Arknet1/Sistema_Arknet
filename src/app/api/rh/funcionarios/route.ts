import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan, can, maskSensitiveData } from '@/lib/hr/permissions'
import { recordHrAudit } from '@/lib/hr/audit'
import { hashPassword } from '@/lib/server-auth'
import { randomBytes } from 'crypto'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    assertCan(session, 'LISTAR_FUNCIONARIOS', 'FUNCIONARIO')

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')?.trim() || ''
    const departmentId = searchParams.get('departmentId')?.trim() || ''
    const status = searchParams.get('status')?.trim() || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '15', 10)))
    const skip = (page - 1) * limit

    const where: any = {}

    if (departmentId) {
      where.departmentId = departmentId
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { employeeNumber: { contains: search } },
        { biNumber: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ]
    }

    const [total, rawEmployees] = await Promise.all([
      prisma.hrEmployee.count({ where }),
      prisma.hrEmployee.findMany({
        where,
        skip,
        take: limit,
        include: {
          department: { select: { id: true, name: true, code: true } },
          position: { select: { id: true, title: true, level: true, salaryCategory: true } },
          directSupervisor: { select: { id: true, fullName: true, employeeNumber: true } },
          userRef: { select: { id: true, email: true, role: true, status: true, mustChangePassword: true } },
          contracts: {
            where: { status: 'ACTIVO' },
            take: 1,
            select: { id: true, contractNumber: true, type: true, startDate: true, endDate: true, baseSalary: true, status: true },
          },
        },
        orderBy: { fullName: 'asc' },
      }),
    ])

    const canViewSensitive = can(session, 'VER_DADOS_SENSIVEIS', 'FUNCIONARIO')
    const employees = rawEmployees.map((emp) => maskSensitiveData(emp, canViewSensitive))

    return NextResponse.json({
      success: true,
      employees,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao listar colaboradores.' }, { status: 403 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    assertCan(session, 'CRIAR_FUNCIONARIO', 'FUNCIONARIO')

    const body = await request.json()
    const fullName = String(body.fullName || '').trim()
    const biNumber = String(body.biNumber || '').trim().toUpperCase()
    const email = String(body.email || '').trim().toLowerCase()
    const phone = String(body.phone || '').trim()
    const birthDate = body.birthDate ? new Date(body.birthDate) : null
    const admissionDate = body.admissionDate ? new Date(body.admissionDate) : new Date()
    const departmentId = String(body.departmentId || '').trim()
    const positionId = String(body.positionId || '').trim()
    const directSupervisorId = body.directSupervisorId ? String(body.directSupervisorId).trim() : null
    const address = String(body.address || 'Luanda').trim()
    const city = String(body.city || 'Luanda').trim()
    const province = String(body.province || 'Luanda').trim()
    const gender = body.gender || 'M'

    // Dados bancários (opcionais na admissão)
    const bankName = body.bankName ? String(body.bankName).trim() : null
    const bankIban = body.bankIban ? String(body.bankIban).trim().toUpperCase() : null
    const bankAccountNumber = body.bankAccountNumber ? String(body.bankAccountNumber).trim() : null

    if (!fullName || !biNumber || !email || !birthDate || !departmentId || !positionId) {
      return NextResponse.json({
        error: 'Preencha os campos obrigatórios: Nome Completo, BI, E-mail, Data de Nascimento, Departamento e Cargo.',
      }, { status: 400 })
    }

    // REGRA 8: BI único
    const existingBi = await prisma.hrEmployee.findUnique({ where: { biNumber } })
    if (existingBi) {
      return NextResponse.json({ error: `Já existe um funcionário cadastrado com o BI "${biNumber}".` }, { status: 400 })
    }

    const existingEmail = await prisma.hrEmployee.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: `O e-mail "${email}" já está associado a outro funcionário.` }, { status: 400 })
    }

    // Gerar número de funcionário sequencial se não fornecido
    let employeeNumber = body.employeeNumber ? String(body.employeeNumber).trim().toUpperCase() : ''
    if (!employeeNumber) {
      const count = await prisma.hrEmployee.count()
      employeeNumber = `ARK-EMP-${String(count + 1).padStart(3, '0')}`
    }

    // Criar funcionário, histórico de carreira e opcionalmente utilizador do sistema na mesma transacção
    const result = await prisma.$transaction(async (tx) => {
      let createdUserId: string | null = null
      let temporaryPassword: string | null = null

      // REGRA 4: Criar utilizador a partir da ficha com senha temporária e troca obrigatória
      if (body.createSystemUser) {
        temporaryPassword = `Arknet${randomBytes(3).toString('hex')}!2026`
        const passwordHash = hashPassword(temporaryPassword)

        const user = await tx.adminUser.create({
          data: {
            name: fullName,
            email,
            passwordHash,
            role: 'FUNCIONARIO',
            status: 'active',
            mustChangePassword: true, // REGRA 4: Troca obrigatória no primeiro acesso
          },
        })
        createdUserId = user.id
      }

      const employee = await tx.hrEmployee.create({
        data: {
          employeeNumber,
          fullName,
          biNumber,
          birthDate,
          gender,
          phone,
          email,
          address,
          city,
          province,
          bankName,
          bankIban,
          bankAccountNumber,
          admissionDate,
          status: 'ACTIVO',
          departmentId,
          positionId,
          directSupervisorId,
          userId: createdUserId,
        },
        include: {
          department: true,
          position: true,
        },
      })

      // Registar histórico inicial de carreira
      const initialSalary = body.initialSalary ? new Prisma.Decimal(body.initialSalary) : new Prisma.Decimal(0)
      await tx.hrCareerHistory.create({
        data: {
          employeeId: employee.id,
          position: employee.position.title,
          department: employee.department.name,
          salary: initialSalary,
          changeReason: 'Admissão Inicial',
          changeDate: admissionDate,
          registeredBy: session.name || session.email,
        },
      })

      // REGRA 6: Auditoria na mesma transacção com dados mascarados
      await recordHrAudit(tx, {
        user: session,
        action: 'CRIAR',
        resource: 'FUNCIONARIO',
        resourceId: employee.id,
        details: `Admitiu o colaborador ${employee.fullName} (${employee.employeeNumber}).`,
        newValue: employee,
      })

      return { employee, temporaryPassword }
    })

    return NextResponse.json({
      success: true,
      employee: result.employee,
      temporaryPassword: result.temporaryPassword,
      message: result.temporaryPassword
        ? `Funcionário admitido com sucesso. Conta criada com a senha temporária: ${result.temporaryPassword}`
        : 'Funcionário admitido com sucesso.',
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar colaborador.' }, { status: 400 })
  }
}
