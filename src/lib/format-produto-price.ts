/** Formata preço em Kz; `null` = sob consulta (hífen). */
export function formatProdutoPrice(price: number | null): string {
  if (price === null) return '-'
  return price
    .toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })
    .replace('AOA', 'Kz')
}

export function formatLinhaPreco(price: number | null, quantity: number): string {
  if (price === null) return '-'
  return formatProdutoPrice(price * quantity)
}
