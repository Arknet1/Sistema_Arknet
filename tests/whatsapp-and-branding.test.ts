import { describe, it } from 'node:test'
import assert from 'node:assert'
import { JMATOS_CONFIG, buildLojaWhatsappMessage } from '../src/lib/empresas'
import { JMATOS_BANK_DETAILS, ARKNET_SERVICE_DETAILS } from '../src/lib/fatura-config'

describe('Identidades de Marca e Integração WhatsApp', () => {
  it('deve ter as constantes corretas da J.Matos Tecnologia', () => {
    assert.strictEqual(JMATOS_CONFIG.nome, 'J.Matos Tecnologia')
    assert.strictEqual(JMATOS_CONFIG.slogan, 'Soluções Tecnológicas')
    assert.strictEqual(JMATOS_CONFIG.logo, '/images/jmatos.png')
    assert.strictEqual(JMATOS_CONFIG.cores.primaria, '#1E78C2')
    assert.strictEqual(JMATOS_CONFIG.cores.destaque, '#F7941D')
  })

  it('deve formatar mensagens para o WhatsApp com o prefixo oficial da loja', () => {
    const raw = 'Gostaria de saber mais sobre o router Wi-Fi 6.'
    const prefixed = buildLojaWhatsappMessage(raw)
    assert.ok(prefixed.startsWith('Loja J.Matos Tecnologia:'))
    assert.ok(prefixed.includes(raw))

    // Se já tiver o prefixo, não deve duplicar
    const alreadyPrefixed = 'Loja J.Matos Tecnologia: Pedido #ORD-123'
    assert.strictEqual(buildLojaWhatsappMessage(alreadyPrefixed), alreadyPrefixed)
  })

  it('deve ter as coordenadas e dados fiscais oficiais da J.Matos para faturas de compra', () => {
    assert.strictEqual(JMATOS_BANK_DETAILS.holder, 'J.MATOS TECNOLOGIA, LDA.')
    assert.strictEqual(JMATOS_BANK_DETAILS.nif, '5412398760')
    assert.ok(JMATOS_BANK_DETAILS.baiIban.startsWith('AO06 0040'))
    assert.ok(JMATOS_BANK_DETAILS.bfaIban.startsWith('AO06 0006'))
    assert.ok(JMATOS_BANK_DETAILS.atlanticoIban.startsWith('AO06 0055'))
    assert.strictEqual(JMATOS_BANK_DETAILS.phone, '+244 935 208 449')
  })

  it('deve ter os dados de engenharia e telecomunicações da ARKNET para propostas de serviço', () => {
    assert.ok(ARKNET_SERVICE_DETAILS.company.includes('ARKNET Angola'))
    assert.strictEqual(ARKNET_SERVICE_DETAILS.nif, '5412398760')
    assert.strictEqual(ARKNET_SERVICE_DETAILS.phone, '+244 935 208 449')
    assert.strictEqual(ARKNET_SERVICE_DETAILS.email, 'comercial@arknet.co.ao')
  })
})

