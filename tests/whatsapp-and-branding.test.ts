import { describe, it } from 'node:test'
import assert from 'node:assert'
import { JMATOS_CONFIG, buildLojaWhatsappMessage } from '../src/lib/empresas'

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
})
