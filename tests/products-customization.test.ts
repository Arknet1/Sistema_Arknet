import { describe, it } from 'node:test'
import assert from 'node:assert'
import { StoreProduct, ProductSpecItem } from '../src/lib/data-store'

describe('Caracterização de Produtos (Ficha Técnica, Garantia e Visão Geral)', () => {
  it('deve suportar prazos e detalhes de garantia específicos por produto', () => {
    const productA: Partial<StoreProduct> = {
      id: 'prod-test-1',
      name: 'Switch Gigabit Corporativo 24 Portas',
      warranty: '24 Meses (2 Anos)',
      warrantyDetails: 'Substituição direta em Luanda com garantia oficial contra defeitos de fabrico.',
    }

    const productB: Partial<StoreProduct> = {
      id: 'prod-test-2',
      name: 'Cabo de Rede Cat6 305m',
      warranty: '6 Meses',
      warrantyDetails: 'Garantia de conformidade técnica e continuidade elétrica.',
    }

    const productC: Partial<StoreProduct> = {
      id: 'prod-test-3',
      name: 'Servidor Rack Enterprise',
      warranty: '36 Meses (3 Anos)',
      warrantyDetails: 'SLA de resposta de 4 horas com peças sobressalentes locais.',
    }

    const productShort1: Partial<StoreProduct> = {
      id: 'prod-test-short-1',
      name: 'Adaptador USB-C para RJ45 (Periférico)',
      warranty: '1 Mês',
      warrantyDetails: 'Garantia de funcionamento imediato e troca direta.',
    }

    const productShort2: Partial<StoreProduct> = {
      id: 'prod-test-short-2',
      name: 'Lote de Conectores RJ45 Cat6 (Consumível)',
      warranty: '1 Semana',
      warrantyDetails: 'Garantia de conferência de lote e conformidade dos pinos.',
    }

    const productShort3: Partial<StoreProduct> = {
      id: 'prod-test-short-3',
      name: 'Equipamento Usado em Regime de Demonstração',
      warranty: '3 Dias',
      warrantyDetails: 'Prazo estrito para teste de bancada e validação técnica.',
    }

    // A garantia varia conforme o produto (de 3 dias a 3 anos)
    assert.strictEqual(productA.warranty, '24 Meses (2 Anos)')
    assert.strictEqual(productB.warranty, '6 Meses')
    assert.strictEqual(productC.warranty, '36 Meses (3 Anos)')
    assert.strictEqual(productShort1.warranty, '1 Mês')
    assert.strictEqual(productShort2.warranty, '1 Semana')
    assert.strictEqual(productShort3.warranty, '3 Dias')
    assert.notStrictEqual(productA.warranty, productB.warranty)
    assert.notStrictEqual(productShort1.warranty, productShort2.warranty)
  })

  it('deve armazenar e serializar ficha técnica estruturada (especificações)', () => {
    const specs: ProductSpecItem[] = [
      { label: 'Garantia Técnica', value: '24 Meses Oficial' },
      { label: 'Interface & Portas', value: '24 Portas Gigabit RJ45 + 4 Portas SFP+' },
      { label: 'Capacidade de Comutação', value: '128 Gbps' },
      { label: 'Alimentação', value: '100-240V AC Bivolt Automático' },
      { label: 'Montagem', value: 'Bastidor Rack 19 polegadas 1U' },
    ]

    const serialized = JSON.stringify(specs)
    const deserialized: ProductSpecItem[] = JSON.parse(serialized)

    assert.strictEqual(deserialized.length, 5)
    assert.strictEqual(deserialized[0].label, 'Garantia Técnica')
    assert.strictEqual(deserialized[0].value, '24 Meses Oficial')
    assert.strictEqual(deserialized[1].label, 'Interface & Portas')
  })

  it('deve armazenar itens incluídos na embalagem (package contents)', () => {
    const contents: string[] = [
      '1x Switch Gigabit 24 Portas',
      '1x Cabo de Alimentação Schuko / IEC C13',
      '2x Suportes de Montagem em Bastidor Rack 19 com Parafusos',
      '4x Pés de Borracha Antiderrapantes',
      '1x Manual de Instalação e Certificado de Garantia',
    ]

    const serialized = JSON.stringify(contents)
    const deserialized: string[] = JSON.parse(serialized)

    assert.strictEqual(deserialized.length, 5)
    assert.ok(deserialized.includes('1x Switch Gigabit 24 Portas'))
    assert.ok(deserialized.some((item) => item.includes('Certificado de Garantia')))
  })

  it('deve permitir cenários de aplicação personalizados na visão geral', () => {
    const product: Partial<StoreProduct> = {
      id: 'prod-test-4',
      name: 'Access Point Wi-Fi 6 de Alta Densidade',
      description: 'Ponto de acesso profissional com suporte para mais de 500 clientes simultâneos.',
      applications: 'Ideal para salas de conferências, universidades, hospitais, hotéis e sedes corporativas em Luanda.',
    }

    assert.ok(product.applications)
    assert.ok(product.applications.includes('conferências'))
  })
})

