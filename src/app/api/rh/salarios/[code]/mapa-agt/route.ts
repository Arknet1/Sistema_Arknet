import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { generateAgtModel2Declaration } from '@/lib/hr/services/payroll-service'

/**
 * GET /api/rh/salarios/[code]/mapa-agt
 * Descarrega a Declaração Modelo 2 do IRT para a AGT (Administração Geral Tributária de Angola)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'EXPORTAR_MAPA_AGT')

    const { code } = await params
    const csvContent = await generateAgtModel2Declaration(code, session!)

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="declaracao-agt-modelo2-${code}.csv"`,
      },
    })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}
