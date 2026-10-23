import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { getPrivateDocumentFile } from '@/lib/hr/storage'
import { recordHrAudit } from '@/lib/hr/audit'
import fs from 'fs'

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
    const document = await prisma.hrDocument.findUnique({
      where: { id },
      include: { employee: true },
    })

    if (!document) {
      return NextResponse.json({ error: 'Documento não encontrado.' }, { status: 404 })
    }

    // REGRA 6 e 10: Validação estrita de permissão no servidor
    // Funcionário só descarrega se for o titular do documento!
    assertCan(session, 'DESCARREGAR_DOCUMENTO', 'DOCUMENTO', {
      targetEmployeeId: document.employeeId,
      targetUserId: document.employee.userId,
    })

    const { absolutePath, fileSize } = getPrivateDocumentFile(document.storagePath)

    // Auditar o download confidencial
    await recordHrAudit(prisma, {
      user: session,
      action: 'ACESSO_SENSIVEL',
      resource: 'DOCUMENTO',
      resourceId: document.id,
      details: `Descarregou o documento privado "${document.title}" (${document.fileName}) de ${document.employee.fullName}.`,
    })

    const fileBuffer = await fs.promises.readFile(absolutePath)

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': document.mimeType || 'application/octet-stream',
        'Content-Length': String(fileSize),
        'Content-Disposition': `attachment; filename="${encodeURIComponent(document.fileName)}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao descarregar documento.' }, { status: 403 })
  }
}
