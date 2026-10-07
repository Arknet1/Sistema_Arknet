import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/tickets/admin-auth-guard'
import { getTickets } from '@/lib/tickets/ticket-service'
import { TICKET_TYPE_CONFIG, TICKET_CATEGORY_CONFIG, TICKET_STATUS_CONFIG, TICKET_PRIORITY_CONFIG } from '@/lib/tickets/types'

export async function GET(request: NextRequest) {
  const auth = requireAdminAuth(request)
  if (!auth.isAuthorized) return auth.response!

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || undefined
    const status = searchParams.get('status') || undefined
    const category = searchParams.get('category') || undefined
    const priority = searchParams.get('priority') || undefined
    const q = searchParams.get('q') || undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined

    // Busca até 1000 tickets para o exportador
    const { tickets } = await getTickets({
      type,
      status,
      category,
      priority,
      q,
      startDate,
      endDate,
      page: 1,
      limit: 1000,
    })

    const rows: string[] = []

    // Header
    rows.push(
      [
        'Protocolo',
        'Tipo',
        'Categoria',
        'Prioridade',
        'Estado',
        'Nome do Contacto',
        'E-mail',
        'Telefone',
        'Assunto',
        'Nº Encomenda',
        'Data Criação',
        'Data Resolução',
        'Mensagem',
      ]
        .map((cell) => `"${cell.replace(/"/g, '""')}"`)
        .join(';')
    )

    // Data rows
    for (const t of tickets) {
      const typeLabel = TICKET_TYPE_CONFIG[t.type]?.label || t.type
      const catLabel = (TICKET_CATEGORY_CONFIG as any)[t.category]?.label || t.category
      const statusLabel = TICKET_STATUS_CONFIG[t.status]?.label || t.status
      const priorityLabel = TICKET_PRIORITY_CONFIG[t.priority]?.label || t.priority
      const createdDate = new Date(t.createdAt).toLocaleString('pt-AO')
      const resolvedDate = t.resolvedAt ? new Date(t.resolvedAt).toLocaleString('pt-AO') : ''

      const cleanMessage = t.message.replace(/\r?\n/g, ' ').substring(0, 300)

      rows.push(
        [
          t.protocol,
          typeLabel,
          catLabel,
          priorityLabel,
          statusLabel,
          t.name,
          t.email,
          t.phone || '',
          t.subject,
          t.orderNumber || '',
          createdDate,
          resolvedDate,
          cleanMessage,
        ]
          .map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`)
          .join(';')
      )
    }

    const csvContent = '\uFEFF' + rows.join('\r\n')
    const fileName = `tickets_arknet_${new Date().toISOString().split('T')[0]}.csv`

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error: any) {
    console.error('[API /api/admin/tickets/export GET Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao gerar exportação CSV.' },
      { status: 500 }
    )
  }
}
