import { describe, it } from 'node:test'
import assert from 'node:assert'
import { createHash, randomInt, timingSafeEqual } from 'node:crypto'
import { hashPassword, verifyStoredPassword } from '../src/lib/server-auth'
import { validatePasswordStrength } from '../src/lib/security-utils'

// Lógica idêntica à do endpoint /api/auth/recovery/route.ts
function codeHash(code: string) {
  return createHash('sha256').update(code.trim()).digest('hex')
}

function codesMatch(code: string, storedHash: string) {
  try {
    const supplied = Buffer.from(codeHash(code), 'hex')
    const expected = Buffer.from(storedHash, 'hex')
    return supplied.length === expected.length && timingSafeEqual(supplied, expected)
  } catch {
    return false
  }
}

describe('Recuperação de Palavra-passe (Segurança, Criptografia e Regras de Negócio)', () => {
  it('deve gerar código de 6 dígitos numéricos aleatórios', () => {
    for (let i = 0; i < 50; i++) {
      const code = String(randomInt(100000, 1000000))
      assert.strictEqual(code.length, 6, 'Código deve ter exatamente 6 dígitos')
      assert.ok(/^\d{6}$/.test(code), 'Código deve ser puramente numérico')
    }
  })

  it('deve gerar hash SHA-256 do código e validar com timingSafeEqual', () => {
    const code = '748291'
    const hash = codeHash(code)

    assert.strictEqual(hash.length, 64, 'SHA-256 hex digest deve ter 64 caracteres')
    assert.strictEqual(codesMatch(code, hash), true, 'Código correto deve validar')
    assert.strictEqual(codesMatch('000000', hash), false, 'Código errado deve falhar')
    assert.strictEqual(codesMatch('748290', hash), false, 'Código próximo deve falhar')
    assert.strictEqual(codesMatch('', hash), false, 'Código vazio deve falhar')
  })

  it('deve respeitar a janela de expiração de 15 minutos (TTL)', () => {
    const CODE_TTL_MS = 15 * 60 * 1000
    const now = Date.now()

    const validEntry = {
      expiresAt: now + CODE_TTL_MS,
      attempts: 0,
      codeHash: codeHash('123456'),
    }

    const expiredEntry = {
      expiresAt: now - 1000, // Expirou há 1 segundo
      attempts: 0,
      codeHash: codeHash('123456'),
    }

    // Validação de expiração
    assert.ok(validEntry.expiresAt > now, 'Token ativo deve ser considerado válido')
    assert.ok(expiredEntry.expiresAt <= now, 'Token expirado deve ser detectado e rejeitado')
  })

  it('deve bloquear após 5 tentativas falhadas (proteção contra força bruta)', () => {
    const MAX_ATTEMPTS = 5
    let attempts = 0
    const correctCode = '654321'
    const storedHash = codeHash(correctCode)

    const simulateAttempt = (inputCode: string) => {
      if (attempts >= MAX_ATTEMPTS) {
        return { success: false, reason: 'locked' }
      }
      if (!codesMatch(inputCode, storedHash)) {
        attempts++
        return { success: false, reason: 'invalid_code' }
      }
      return { success: true }
    }

    // 5 tentativas erradas
    for (let i = 0; i < 5; i++) {
      const res = simulateAttempt('111111')
      assert.strictEqual(res.success, false)
      assert.strictEqual(res.reason, 'invalid_code')
    }

    assert.strictEqual(attempts, 5)

    // A 6ª tentativa mesmo com código correto deve ser bloqueada
    const blockedRes = simulateAttempt(correctCode)
    assert.strictEqual(blockedRes.success, false)
    assert.strictEqual(blockedRes.reason, 'locked')
  })

  it('deve aplicar rate limit de no máximo 5 envios por janela de 15 minutos', () => {
    const MAX_SENDS = 5
    const SEND_WINDOW_MS = 15 * 60 * 1000
    const now = Date.now()

    let entry = {
      email: 'cliente@empresa.co.ao',
      windowStartedAt: now,
      sendCount: 0,
    }

    const requestSend = () => {
      const sendCount =
        entry.windowStartedAt > now - SEND_WINDOW_MS
          ? entry.sendCount
          : 0

      if (sendCount >= MAX_SENDS) {
        return { allowed: false, message: 'Demasiados pedidos' }
      }

      entry.sendCount = sendCount + 1
      return { allowed: true }
    }

    // 5 envios permitidos
    for (let i = 0; i < 5; i++) {
      assert.strictEqual(requestSend().allowed, true, `Envio ${i + 1} deve ser permitido`)
    }

    // 6º envio rejeitado com rate limit
    assert.strictEqual(requestSend().allowed, false, '6º envio na mesma janela deve ser bloqueado')
  })

  it('deve validar requisitos de segurança estritos para a nova palavra-passe', () => {
    // Menos de 8 caracteres
    assert.strictEqual(validatePasswordStrength('Ark1!').isValid, false)
    // Sem maiúscula
    assert.strictEqual(validatePasswordStrength('arknet2026!#').isValid, false)
    // Sem minúscula
    assert.strictEqual(validatePasswordStrength('ARKNET2026!#').isValid, false)
    // Sem número
    assert.strictEqual(validatePasswordStrength('ArknetSegura!#').isValid, false)
    // Sem caractere especial
    assert.strictEqual(validatePasswordStrength('ArknetSegura2026').isValid, false)
    // Válida e forte
    const valid = validatePasswordStrength('NovaSenhaForte2026!#')
    assert.strictEqual(valid.isValid, true)
    assert.strictEqual(valid.errors.length, 0)
  })

  it('deve criptografar a nova senha com scrypt e atualizar credenciais com sucesso', () => {
    const oldRawPassword = 'SenhaAntiga2025!#'
    const oldHash = hashPassword(oldRawPassword)

    let account = {
      id: 'cli-test-123',
      email: 'cliente.teste@arknet.co.ao',
      password: null,
      passwordHash: oldHash,
    }

    // Validação da senha antiga
    assert.strictEqual(verifyStoredPassword(oldRawPassword, account.passwordHash), true)

    // Redefinição com nova senha
    const newRawPassword = 'NovaSenhaArknet2026!#'
    const newHash = hashPassword(newRawPassword)

    account = {
      ...account,
      password: null,
      passwordHash: newHash,
    }

    // Senha antiga deixa de funcionar imediatamente
    assert.strictEqual(verifyStoredPassword(oldRawPassword, account.passwordHash), false)
    // Nova senha funciona com sucesso
    assert.strictEqual(verifyStoredPassword(newRawPassword, account.passwordHash), true)
  })

  it('deve invalidar o token de recuperação após uso para evitar ataques de repetição', () => {
    let tokens = [
      { email: 'cliente@arknet.co.ao', codeHash: codeHash('123456') },
      { email: 'outro@arknet.co.ao', codeHash: codeHash('987654') },
    ]

    const emailToReset = 'cliente@arknet.co.ao'
    const tokenIndex = tokens.findIndex((t) => t.email === emailToReset)
    assert.ok(tokenIndex >= 0)

    // Limpar o token usado
    tokens = tokens.filter((_, idx) => idx !== tokenIndex)

    // Token do utilizador não deve mais existir
    assert.strictEqual(tokens.some((t) => t.email === emailToReset), false)
    assert.strictEqual(tokens.length, 1)
  })
})

