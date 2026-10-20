import { describe, it } from 'node:test'
import assert from 'node:assert'
import { formatProdutoPrice, formatLinhaPreco } from '../src/lib/format-produto-price'

describe('Formatação de Preços e Cálculos da Loja', () => {
  it('deve formatar valores em Kwanzas (Kz) corretamente', () => {
    const formatted = formatProdutoPrice(250000)
    assert.ok(formatted.includes('Kz'), 'Deve conter o símbolo Kz')
    assert.ok(formatted.includes('250'), 'Deve conter o valor base formatado')
  })

  it('deve formatar valores nulos ou zero como Sob Consulta', () => {
    assert.strictEqual(formatProdutoPrice(null), 'Sob Consulta')
    assert.strictEqual(formatProdutoPrice(undefined), 'Sob Consulta')
    assert.strictEqual(formatProdutoPrice(0), 'Sob Consulta')
  })

  it('deve calcular linhas de encomenda com quantidade corretamente', () => {
    const linePrice = formatLinhaPreco(50000, 3)
    assert.ok(linePrice.includes('150'), '3 x 50.000 deve ser 150.000 Kz')
    assert.ok(linePrice.includes('Kz'))
  })

  it('deve retornar Sob Consulta para linhas com preço indefinido', () => {
    assert.strictEqual(formatLinhaPreco(null, 2), 'Sob Consulta')
  })
})
