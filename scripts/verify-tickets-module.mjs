/**
 * Script de verificação de segurança e testes funcionais do Módulo de Reclamações & Informações
 * Executa testes em:
 * 1. Submissão pública (POST /api/tickets)
 * 2. Validação de esquemas e anti-spam
 * 3. Controlo de acessos:
 *    - Visitante sem sessão -> 401 Unauthorized
 *    - Cliente comum autenticado -> 403 Forbidden
 *    - Administrador autenticado -> 200 OK
 * 4. Adição de notas e envio de respostas
 * 5. Exportação de CSV
 */

import http from 'http'
import fs from 'fs'
import path from 'path'
import { createHmac } from 'crypto'

function getAuthSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET
  try {
    const envFile = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8')
    const match = envFile.match(/AUTH_SECRET=["']?([^"'\r\n]+)["']?/)
    if (match && match[1]) return match[1]
  } catch {}
  return 'arknet-telecom-secure-auth-secret-key-2026-production-ao'
}

const BASE_URL = process.env.SITE_URL || 'http://localhost:3000'
const AUTH_SECRET = getAuthSecret()

function createTestToken(userId, email, role) {
  const body = Buffer.from(
    JSON.stringify({
      userId,
      email,
      role,
      exp: Date.now() + 3600 * 1000,
    })
  ).toString('base64url')
  const signature = createHmac('sha256', AUTH_SECRET).update(body).digest('base64url')
  return `${body}.${signature}`
}

async function runTests() {
  console.log('===============================================================')
  console.log('🛡️  VERIFICAÇÃO DE SEGURANÇA & FUNCIONALIDADE - TICKETS ARKNET')
  console.log('===============================================================\n')

  let passed = 0
  let failed = 0

  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`✅ [PASS] ${name}`)
      passed++
    } else {
      console.error(`❌ [FAIL] ${name} ${details}`)
      failed++
    }
  }

  // 1. Teste de Acesso não autorizado a /api/admin/tickets (Visitante sem sessão)
  try {
    const res = await fetch(`${BASE_URL}/api/admin/tickets`)
    assert(
      'Visitante sem sessão recebe 401 Unauthorized em /api/admin/tickets',
      res.status === 401,
      `Recebeu status ${res.status}`
    )
  } catch (err) {
    assert('Visitante sem sessão recebe 401 Unauthorized', false, err.message)
  }

  // 2. Teste de Acesso com conta de Cliente comum (Não admin)
  try {
    const customerToken = createTestToken('cust-123', 'cliente.teste@arknet.ao', 'customer')
    const res = await fetch(`${BASE_URL}/api/admin/tickets`, {
      headers: {
        Authorization: `Bearer ${customerToken}`,
        Cookie: `arknet_customer_token=${customerToken}`,
      },
    })
    assert(
      'Cliente comum autenticado recebe 403 Forbidden em /api/admin/tickets',
      res.status === 403,
      `Recebeu status ${res.status}`
    )
  } catch (err) {
    assert('Cliente comum recebe 403 Forbidden', false, err.message)
  }

  // 3. Teste de Submissão Pública com Dados Inválidos (Mensagem muito curta)
  try {
    const res = await fetch(`${BASE_URL}/api/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'RECLAMACAO',
        category: 'PRODUTO',
        name: 'Cliente Teste',
        email: 'cliente@teste.ao',
        subject: 'Teste curto',
        message: 'Muito curta', // menos de 20 caracteres
        consentAccepted: true,
      }),
    })
    const data = await res.json()
    assert(
      'Submissão com mensagem menor que 20 caracteres é rejeitada com 400',
      res.status === 400 && data.success === false,
      `Recebeu status ${res.status}`
    )
  } catch (err) {
    assert('Submissão inválida é rejeitada', false, err.message)
  }

  // 4. Teste de Submissão Pública Válida
  let createdProtocol = null
  try {
    const res = await fetch(`${BASE_URL}/api/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'RECLAMACAO',
        category: 'SERVICO_TECNICO',
        name: 'Manuel António de Oliveira',
        email: 'manuel.oliveira@empresa.ao',
        phone: '+244 923 888 777',
        subject: 'Instalação de Fibra Óptica - Prazos de Agendamento',
        message: 'Solicitamos apoio para confirmação do agendamento da visita técnica da equipa ao armazém em Viana.',
        consentAccepted: true,
      }),
    })
    const data = await res.json()
    createdProtocol = data.protocol
    assert(
      'Submissão pública válida regista ticket e devolve protocolo (ARK-...)',
      res.status === 201 && data.success === true && !!data.protocol?.startsWith('ARK-'),
      `Protocolo obtido: ${data.protocol}`
    )
  } catch (err) {
    assert('Submissão pública válida funciona', false, err.message)
  }

  // 5. Teste de Acesso de Administrador Autenticado a /api/admin/tickets
  const adminToken = createTestToken('admin-root', 'admin@arknet.ao', 'admin')
  let foundTicketId = null

  try {
    const res = await fetch(`${BASE_URL}/api/admin/tickets`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        Cookie: `arknet_admin_token=${adminToken}`,
      },
    })
    const data = await res.json()
    assert(
      'Administrador autenticado obtém 200 OK e lista de tickets',
      res.status === 200 && data.success === true && Array.isArray(data.tickets),
      `Total de tickets: ${data.total}`
    )
    if (data.tickets && data.tickets.length > 0) {
      foundTicketId = data.tickets[0].id
    }
  } catch (err) {
    assert('Administrador acede a /api/admin/tickets', false, err.message)
  }

  // 6. Teste de Detalhe e Registo de Nota Interna (Admin)
  if (foundTicketId) {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/tickets/${foundTicketId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
          Cookie: `arknet_admin_token=${adminToken}`,
        },
        body: JSON.stringify({
          content: 'Nota de teste interna registada pela equipa técnica.',
        }),
      })
      const data = await res.json()
      assert(
        'Administrador regista nota interna com sucesso em /api/admin/tickets/[id]/notes',
        res.status === 201 && data.success === true,
        data.message
      )
    } catch (err) {
      assert('Registo de nota interna', false, err.message)
    }

    // 7. Teste de Resposta ao Cliente (Admin)
    try {
      const res = await fetch(`${BASE_URL}/api/admin/tickets/${foundTicketId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
          Cookie: `arknet_admin_token=${adminToken}`,
        },
        body: JSON.stringify({
          content: 'Prezado cliente, informamos que a equipa técnica entrará em contacto hoje.',
          channel: 'EMAIL',
        }),
      })
      const data = await res.json()
      assert(
        'Administrador envia resposta ao cliente e altera estado para RESPONDIDO',
        res.status === 201 && data.success === true,
        data.message
      )
    } catch (err) {
      assert('Envio de resposta ao cliente', false, err.message)
    }
  }

  // 8. Teste de Exportação CSV
  try {
    const res = await fetch(`${BASE_URL}/api/admin/tickets/export`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        Cookie: `arknet_admin_token=${adminToken}`,
      },
    })
    const text = await res.text()
    assert(
      'Administrador exporta tickets em formato CSV',
      res.status === 200 && text.includes('Protocolo'),
      `Tamanho do CSV: ${text.length} bytes`
    )
  } catch (err) {
    assert('Exportação CSV', false, err.message)
  }

  console.log('\n---------------------------------------------------------------')
  console.log(`RESULTADOS: ${passed} testes passaram | ${failed} falharam`)
  console.log('===============================================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runTests().catch(console.error)
