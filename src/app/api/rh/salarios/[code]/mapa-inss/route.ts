import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { generateInssDeclaration } from '@/lib/hr/services/payroll-service'

/**
 * GET /api/rh/salarios/[code]/mapa-inss
 * Descarrega o Mapa Oficial de Remunerações para a Segurança Social (INSS Angola — 11%)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'EXPORTAR_MAPA_INSS')

    const { code } = await params
    const csvContent = await generateInssDeclaration(code, session!)

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="mapa-inss-${code}.csv"`,
      },
    })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}
