import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { recordHrAudit } from '@/lib/hr/audit'

export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    assertCan(session, 'GERIR_CARGOS', 'CARGO')

    const positions = await prisma.hrPosition.findMany({
      include: {
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { title: 'asc' },
    })

    return NextResponse.json({ success: true, positions })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao listar cargos.' }, { status: 403 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    assertCan(session, 'GERIR_CARGOS', 'CARGO')

    const body = await request.json()
    const title = String(body.title || '').trim()
    const code = String(body.code || '').trim().toUpperCase()
    const level = String(body.level || 'Junior').trim()
    const salaryCategory = String(body.salaryCategory || 'CAT-A').trim().toUpperCase()
    const description = body.description ? String(body.description).trim() : null

    if (!title || !code) {
      return NextResponse.json({ error: 'Título e código do cargo são obrigatórios.' }, { status: 400 })
    }

    const existingCode = await prisma.hrPosition.findUnique({ where: { code } })
    if (existingCode) {
      return NextResponse.json({ error: `Já existe um cargo com o código "${code}".` }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.hrPosition.create({
        data: {
          title,
          code,
          level,
          salaryCategory,
          description,
          active: true,
        },
      })

      await recordHrAudit(tx, {
        user: session,
        action: 'CRIAR',
        resource: 'CARGO',
        resourceId: created.id,
        details: `Criou o cargo ${created.title} (${created.code}).`,
        newValue: created,
      })

      return created
    })

    return NextResponse.json({ success: true, position: result }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar cargo.' }, { status: 400 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    assertCan(session, 'GERIR_CARGOS', 'CARGO')

    const body = await request.json()
    const id = String(body.id || '').trim()
    if (!id) {
      return NextResponse.json({ error: 'ID do cargo obrigatório.' }, { status: 400 })
    }

    const current = await prisma.hrPosition.findUnique({ where: { id } })
    if (!current) {
      return NextResponse.json({ error: 'Cargo não encontrado.' }, { status: 404 })
    }

    const title = body.title ? String(body.title).trim() : current.title
    const code = body.code ? String(body.code).trim().toUpperCase() : current.code
    const level = body.level ? String(body.level).trim() : current.level
    const salaryCategory = body.salaryCategory ? String(body.salaryCategory).trim().toUpperCase() : current.salaryCategory
    const description = body.description !== undefined ? body.description : current.description
    const active = body.active !== undefined ? Boolean(body.active) : current.active

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.hrPosition.update({
        where: { id },
        data: {
          title,
          code,
          level,
          salaryCategory,
          description,
          active,
        },
      })

      await recordHrAudit(tx, {
        user: session,
        action: 'EDITAR',
        resource: 'CARGO',
        resourceId: updated.id,
        details: `Atualizou o cargo ${updated.title} (${updated.code}).`,
        oldValue: current,
        newValue: updated,
      })

      return updated
    })

    return NextResponse.json({ success: true, position: result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar cargo.' }, { status: 400 })
  }
}
