import { NextResponse } from 'next/server'
import { readServerDb, writeServerDb, getInitialServerDb } from '@/lib/server-db'

export async function GET() {
  try {
    const db = readServerDb()
    return NextResponse.json({ success: true, db }, { status: 200 })
  } catch (error) {
    console.error('[API /api/db GET] Erro:', error)
    return NextResponse.json({ success: false, message: 'Erro ao carregar banco de dados' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, message: 'Dados inválidos' }, { status: 400 })
    }

    if (body.action === 'reset') {
      const initial = getInitialServerDb()
      writeServerDb(initial)
      return NextResponse.json({ success: true, message: 'Base de dados restaurada com sucesso', db: initial }, { status: 200 })
    }

    // Se enviou objeto completo do db ou payload de atualização
    const dataToSave = body.db ? body.db : body
    const success = writeServerDb(dataToSave)

    if (!success) {
      return NextResponse.json({ success: false, message: 'Falha ao gravar base de dados no servidor' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Base de dados atualizada com sucesso' }, { status: 200 })
  } catch (error) {
    console.error('[API /api/db POST] Erro:', error)
    return NextResponse.json({ success: false, message: 'Erro ao processar requisição' }, { status: 500 })
  }
}
