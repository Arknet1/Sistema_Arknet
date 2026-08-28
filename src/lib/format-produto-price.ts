/** Formata preço em Kz; `null` ou `<= 0` = produto que está por entrar ("Em Breve"). */
export function formatProdutoPrice(price: number | null): string {
  if (price === null || price <= 0) return 'Em Breve'
  return price
    .toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })
    .replace('AOA', 'Kz')
}

export function formatLinhaPreco(price: number | null, quantity: number): string {
  if (price === null || price <= 0) return 'Em Breve'
  return formatProdutoPrice(price * quantity)
}
