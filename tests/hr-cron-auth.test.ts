import assert from 'node:assert/strict'
import { test } from 'node:test'
import { NextRequest } from 'next/server'
import { isAuthorizedCronRequest } from '../src/lib/hr/cron-auth'

test('Cron RH rejeita pedidos quando CRON_SECRET não está configurado', () => {
  const previousSecret = process.env.CRON_SECRET
  delete process.env.CRON_SECRET
  try {
    const request = new NextRequest('http://localhost/api/rh/cron/alertas', { method: 'POST' })
    assert.equal(isAuthorizedCronRequest(request), false)
  } finally {
    if (previousSecret === undefined) delete process.env.CRON_SECRET
    else process.env.CRON_SECRET = previousSecret
  }
})

test('Cron RH aceita o segredo enviado no cabeçalho Bearer', () => {
  const previousSecret = process.env.CRON_SECRET
  process.env.CRON_SECRET = 'cron-secret-test-only'
  try {
    const request = new NextRequest('http://localhost/api/rh/cron/fecho-dia', {
      method: 'POST',
      headers: { authorization: 'Bearer cron-secret-test-only' },
    })
    assert.equal(isAuthorizedCronRequest(request), true)
  } finally {
    if (previousSecret === undefined) delete process.env.CRON_SECRET
    else process.env.CRON_SECRET = previousSecret
  }
})

test('Cron RH rejeita segredo incorrecto e aceita o cabeçalho dedicado', () => {
  const previousSecret = process.env.CRON_SECRET
  process.env.CRON_SECRET = 'cron-secret-test-only'
  try {
    const wrongRequest = new NextRequest('http://localhost/api/rh/cron/limpeza-gps', {
      method: 'POST',
      headers: { 'x-cron-secret': 'wrong-secret' },
    })
    const validRequest = new NextRequest('http://localhost/api/rh/cron/lembrete-ponto', {
      method: 'POST',
      headers: { 'x-cron-secret': 'cron-secret-test-only' },
    })
    assert.equal(isAuthorizedCronRequest(wrongRequest), false)
    assert.equal(isAuthorizedCronRequest(validRequest), true)
  } finally {
    if (previousSecret === undefined) delete process.env.CRON_SECRET
    else process.env.CRON_SECRET = previousSecret
  }
})
