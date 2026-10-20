export function formatProdutoPrice(price: number | null | undefined): string {
  if (price == null || typeof price !== 'number' || isNaN(price) || price <= 0) return 'Sob Consulta'
  return price
    .toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })
    .replace('AOA', 'Kz')
}

export function formatLinhaPreco(price: number | null | undefined, quantity: number): string {
  if (price == null || typeof price !== 'number' || isNaN(price) || price <= 0) return 'Sob Consulta'
  return formatProdutoPrice(price * (quantity || 1))
}

