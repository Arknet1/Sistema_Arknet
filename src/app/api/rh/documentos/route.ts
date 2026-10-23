import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { savePrivateDocument } from '@/lib/hr/storage'
import { recordHrAudit } from '@/lib/hr/audit'

export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    assertCan(session, 'CARREGAR_DOCUMENTO', 'DOCUMENTO')

    const searchParams = request.nextUrl.searchParams
    const employeeId = searchParams.get('employeeId')?.trim() || ''
    const type = searchParams.get('type')?.trim() || ''
    const expiringSoon = searchParams.get('expiringSoon') === 'true'

    const where: any = { status: 'ACTIVO' }
    if (employeeId) where.employeeId = employeeId
    if (type) where.type = type

    if (expiringSoon) {
      const now = new Date()
      const future = new Date()
      future.setDate(now.getDate() + 30)
      where.expiresAt = { lte: future, gte: now }
    }

    const documents = await prisma.hrDocument.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeNumber: true,
            department: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, documents })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao listar documentos.' }, { status: 403 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    assertCan(session, 'CARREGAR_DOCUMENTO', 'DOCUMENTO')

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const employeeId = String(formData.get('employeeId') || '').trim()
    const title = String(formData.get('title') || '').trim()
    const type = String(formData.get('type') || 'OUTRO').trim().toUpperCase()
    const expiresAtRaw = formData.get('expiresAt') ? String(formData.get('expiresAt')) : null

    if (!file || !employeeId || !title) {
      return NextResponse.json({ error: 'Ficheiro, colaborador e título são obrigatórios.' }, { status: 400 })
    }

    const employee = await prisma.hrEmployee.findUnique({ where: { id: employeeId } })
    if (!employee) {
      return NextResponse.json({ error: 'Colaborador não encontrado.' }, { status: 404 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Guardar no armazenamento privado (fora da pasta de deploy e com path traversal protection)
    const saved = await savePrivateDocument(buffer, file.name, file.type)

    const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null

    const result = await prisma.$transaction(async (tx) => {
      const doc = await tx.hrDocument.create({
        data: {
          employeeId,
          title,
          type,
          storagePath: saved.storagePath,
          fileName: saved.fileName,
          fileSize: saved.fileSize,
          mimeType: saved.mimeType,
          expiresAt,
          status: 'ACTIVO',
          uploadedById: session.id,
          uploadedByName: session.name || session.email,
        },
        include: { employee: true },
      })

      // REGRA 6: Auditoria com transacção
      await recordHrAudit(tx, {
        user: session,
        action: 'CRIAR',
        resource: 'DOCUMENTO',
        resourceId: doc.id,
        details: `Carregou o documento privado "${doc.title}" (${doc.type}) para ${doc.employee.fullName}.`,
        newValue: { id: doc.id, title: doc.title, type: doc.type, fileName: doc.fileName },
      })

      return doc
    })

    return NextResponse.json({ success: true, document: result }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao carregar documento.' }, { status: 400 })
  }
}

// REGRA 5: Sem hard delete em documentos! Só mudança de estado para ARQUIVADO
export async function DELETE(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    assertCan(session, 'ARQUIVAR_DOCUMENTO', 'DOCUMENTO')

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID do documento obrigatório.' }, { status: 400 })
    }

    const current = await prisma.hrDocument.findUnique({
      where: { id },
      include: { employee: true },
    })

    if (!current) {
      return NextResponse.json({ error: 'Documento não encontrado.' }, { status: 404 })
    }

    const updated = await prisma.$transaction(async (tx) => {
      const archived = await tx.hrDocument.update({
        where: { id },
        data: { status: 'ARQUIVADO' },
      })

      await recordHrAudit(tx, {
        user: session,
        action: 'MUDAR_ESTADO',
        resource: 'DOCUMENTO',
        resourceId: id,
        details: `Arquivou o documento "${current.title}" de ${current.employee.fullName} (soft delete).`,
        oldValue: current,
        newValue: archived,
      })

      return archived
    })

    return NextResponse.json({ success: true, message: `Documento "${updated.title}" arquivado com sucesso.` })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao arquivar documento.' }, { status: 400 })
  }
}
