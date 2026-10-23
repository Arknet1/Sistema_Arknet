import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { recordHrAudit } from '@/lib/hr/audit'

export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Sessão inválida ou não autenticada.' }, { status: 401 })
    }

    assertCan(session, 'GERIR_DEPARTAMENTOS', 'DEPARTAMENTO')

    const departments = await prisma.hrDepartment.findMany({
      include: {
        parent: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, departments })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao listar departamentos.' }, { status: 403 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    assertCan(session, 'GERIR_DEPARTAMENTOS', 'DEPARTAMENTO')

    const body = await request.json()
    const name = String(body.name || '').trim()
    const code = String(body.code || '').trim().toUpperCase()
    const description = body.description ? String(body.description).trim() : null
    const parentId = body.parentId ? String(body.parentId).trim() : null
    const managerId = body.managerId ? String(body.managerId).trim() : null

    if (!name || !code) {
      return NextResponse.json({ error: 'Nome e código do departamento são obrigatórios.' }, { status: 400 })
    }

    // Verificar unicidade do código
    const existingCode = await prisma.hrDepartment.findUnique({ where: { code } })
    if (existingCode) {
      return NextResponse.json({ error: `Já existe um departamento com o código "${code}".` }, { status: 400 })
    }

    // Criar com auditoria na mesma transacção
    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.hrDepartment.create({
        data: {
          name,
          code,
          description,
          parentId,
          managerId,
          active: true,
        },
      })

      await recordHrAudit(tx, {
        user: session,
        action: 'CRIAR',
        resource: 'DEPARTAMENTO',
        resourceId: created.id,
        details: `Criou o departamento ${created.name} (${created.code}).`,
        newValue: created,
      })

      return created
    })

    return NextResponse.json({ success: true, department: result }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar departamento.' }, { status: 400 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    assertCan(session, 'GERIR_DEPARTAMENTOS', 'DEPARTAMENTO')

    const body = await request.json()
    const id = String(body.id || '').trim()
    if (!id) {
      return NextResponse.json({ error: 'ID do departamento obrigatório.' }, { status: 400 })
    }

    const current = await prisma.hrDepartment.findUnique({ where: { id } })
    if (!current) {
      return NextResponse.json({ error: 'Departamento não encontrado.' }, { status: 404 })
    }

    const name = body.name ? String(body.name).trim() : current.name
    const code = body.code ? String(body.code).trim().toUpperCase() : current.code
    const description = body.description !== undefined ? body.description : current.description
    const parentId = body.parentId !== undefined ? (body.parentId ? String(body.parentId).trim() : null) : current.parentId
    const managerId = body.managerId !== undefined ? (body.managerId ? String(body.managerId).trim() : null) : current.managerId
    const active = body.active !== undefined ? Boolean(body.active) : current.active

    // REGRA 8: Departamento não pode ser antecessor de si próprio
    if (parentId) {
      if (parentId === id) {
        return NextResponse.json({ error: 'Um departamento não pode ser o seu próprio departamento superior.' }, { status: 400 })
      }

      // Validar ciclo hierárquico
      let ancestorId: string | null = parentId
      const visited = new Set<string>([id])

      while (ancestorId) {
        if (visited.has(ancestorId)) {
          return NextResponse.json(
            { error: 'Ciclo hierárquico detectado. O departamento superior escolhido já descende deste departamento.' },
            { status: 400 }
          )
        }
        visited.add(ancestorId)
        const currentCheckId: string = ancestorId
        const ancestor: { parentId: string | null } | null = await prisma.hrDepartment.findUnique({
          where: { id: currentCheckId },
          select: { parentId: true },
        })
        ancestorId = ancestor ? ancestor.parentId : null
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.hrDepartment.update({
        where: { id },
        data: {
          name,
          code,
          description,
          parentId,
          managerId,
          active,
        },
      })

      await recordHrAudit(tx, {
        user: session,
        action: 'EDITAR',
        resource: 'DEPARTAMENTO',
        resourceId: updated.id,
        details: `Atualizou o departamento ${updated.name} (${updated.code}).`,
        oldValue: current,
        newValue: updated,
      })

      return updated
    })

    return NextResponse.json({ success: true, department: result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar departamento.' }, { status: 400 })
  }
}
