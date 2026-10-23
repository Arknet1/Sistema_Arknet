import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getHrServerSession } from '@/lib/hr/server-session'

export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    if (!session.employeeId) {
      return NextResponse.json({
        error: 'Esta conta de utilizador não possui uma ficha de colaborador associada.',
      }, { status: 404 })
    }

    const employee = await prisma.hrEmployee.findUnique({
      where: { id: session.employeeId },
      include: {
        department: { select: { id: true, name: true, code: true } },
        position: { select: { id: true, title: true, level: true, salaryCategory: true } },
        directSupervisor: { select: { id: true, fullName: true, employeeNumber: true } },
        contracts: {
          where: { status: 'ACTIVO' },
          select: {
            id: true,
            contractNumber: true,
            type: true,
            startDate: true,
            endDate: true,
            baseSalary: true,
            workDays: true,
            dailyHours: true,
            weeklyHours: true,
            status: true,
          },
        },
        documents: {
          where: { status: 'ACTIVO' },
          select: {
            id: true,
            title: true,
            type: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
            expiresAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        careerHistory: {
          orderBy: { changeDate: 'desc' },
        },
      },
    })

    if (!employee) {
      return NextResponse.json({ error: 'Ficha de colaborador não encontrada.' }, { status: 404 })
    }

    if (employee.status === 'DESLIGADO') {
      return NextResponse.json({ error: 'Colaborador desligado.' }, { status: 403 })
    }

    return NextResponse.json({ success: true, employee })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao carregar dados do portal.' }, { status: 500 })
  }
}
