import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { generateBankTransferBatch } from '@/lib/hr/services/payroll-service'

/**
 * GET /api/rh/salarios/[code]/ficheiro-banco
 * Descarrega ficheiro de transferência bancária em lote (BAI, BFA, BIC, Millennium)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'EXPORTAR_FICHEIRO_BANCARIO')

    const { code } = await params
    const csvContent = await generateBankTransferBatch(code, session!)

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="transferencias-bancarias-${code}.csv"`,
      },
    })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}
