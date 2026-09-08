/** Formata preço em Kz; `null` ou `<= 0` = produto sob consulta ou em trânsito. */
export function formatProdutoPrice(price: number | null): string {
  if (price === null || price <= 0) return 'Sob Consulta'
  return price
    .toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })
    .replace('AOA', 'Kz')
}

export function formatLinhaPreco(price: number | null, quantity: number): string {
  if (price === null || price <= 0) return 'Sob Consulta'
  return formatProdutoPrice(price * quantity)
}

