import { describe, it } from 'node:test'
import assert from 'node:assert'
import { hashPassword, verifyStoredPassword, createSessionToken, verifySessionToken } from '../src/lib/server-auth'
import { validatePasswordStrength } from '../src/lib/security-utils'

describe('Autenticação e Segurança (Criptografia & Sessões)', () => {
  it('deve gerar hash scrypt seguro e validar a palavra-passe correta', () => {
    const rawPassword = 'SenhaSuperSegura2026!'
    const hash = hashPassword(rawPassword)

    assert.ok(hash.startsWith('$scrypt$'), 'O hash deve usar o algoritmo scrypt')
    assert.strictEqual(verifyStoredPassword(rawPassword, hash), true, 'A senha correta deve ser validada')
    assert.strictEqual(verifyStoredPassword('SenhaErrada123', hash), false, 'Senha incorreta deve ser rejeitada')
  })

  it('deve rejeitar senhas vazias ou nulas', () => {
    assert.strictEqual(verifyStoredPassword('', '$scrypt$fake'), false)
    assert.strictEqual(verifyStoredPassword('12345', null), false)
  })

  it('deve validar critérios estritos de complexidade de palavra-passe', () => {
    // Senha fraca (sem maiúscula, número ou símbolo)
    const weak = validatePasswordStrength('fraca')
    assert.strictEqual(weak.isValid, false)
    assert.ok(weak.errors.length > 0)

    // Senha forte completa
    const strong = validatePasswordStrength('ArknetPro2026!#')
    assert.strictEqual(strong.isValid, true)
    assert.strictEqual(strong.errors.length, 0)
  })

  it('deve criar e verificar tokens de sessão JWT com HMAC-SHA256', () => {
    const payload = {
      userId: 'usr-admin-test',
      email: 'admin@arknet.co.ao',
      role: 'admin',
    }

    const token = createSessionToken(payload, 3600)
    assert.ok(typeof token === 'string' && token.includes('.'), 'O token deve ter formato payload.assinatura')

    const verified = verifySessionToken(token)
    assert.ok(verified !== null, 'O token deve ser validado com sucesso')
    assert.strictEqual(verified?.userId, payload.userId)
    assert.strictEqual(verified?.email, payload.email)
    assert.strictEqual(verified?.role, payload.role)
  })

  it('deve rejeitar tokens adulterados', () => {
    const payload = {
      userId: 'usr-admin-test',
      email: 'admin@arknet.co.ao',
      role: 'admin',
    }

    const token = createSessionToken(payload, 3600)
    const [body, sig] = token.split('.')
    const tamperedToken = `${body}tampered.${sig}`

    const verified = verifySessionToken(tamperedToken)
    assert.strictEqual(verified, null, 'Token adulterado deve ser rejeitado')
  })
})
