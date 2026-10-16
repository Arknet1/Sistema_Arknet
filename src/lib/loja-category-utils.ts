import { ProductCategory, StoreProduct } from './data-store'

/**
 * Função unificada de correspondência de categoria de produto.
 * Suporta sinónimos e variações comuns em e-commerce técnico.
 */
export function isCategoryMatch(productCat: string, selectedCat: string): boolean {
  if (!selectedCat || selectedCat === 'Todos') return true
  const pCat = (productCat || '').toLowerCase().trim()
  const sCat = selectedCat.toLowerCase().trim()
  if (pCat === sCat) return true
  if (sCat === 'redes e internet' && (pCat.includes('rede') || pCat.includes('internet'))) return true
  if (sCat === 'computadores e portáteis' && (pCat.includes('computador') || pCat.includes('portátil') || pCat.includes('notebook') || pCat.includes('ram'))) return true
  if (sCat === 'periféricos de computador' && (pCat.includes('periférico') || pCat.includes('mouse') || pCat.includes('teclado') || pCat.includes('rato'))) return true
  if (sCat === 'áudio' && (pCat.includes('áudio') || pCat.includes('som') || pCat.includes('coluna') || pCat.includes('headphone') || pCat.includes('auricular'))) return true
  if (sCat === 'impressoras e consumíveis' && (pCat.includes('impressora') || pCat.includes('toner') || pCat.includes('tinteiro') || pCat.includes('térmica'))) return true
  if (sCat === 'automação comercial' && (pCat.includes('pos') || pCat.includes('gaveta') || pCat.includes('biométrico') || pCat.includes('relógio') || pCat.includes('controlo'))) return true
  if (sCat === 'energia e proteção' && (pCat.includes('energia') || pCat.includes('ups') || pCat.includes('filtro') || pCat.includes('extensão') || pCat.includes('pilha'))) return true
  if (sCat === 'cabos e conectividade' && (pCat.includes('cabo') || pCat.includes('conector') || pCat.includes('rj45') || pCat.includes('adaptador') || pCat.includes('hdmi') || pCat.includes('splitter'))) return true
  return pCat.includes(sCat) || sCat.includes(pCat)
}

/**
 * Filtra categorias visíveis respeitando a flag hideWhenEmpty
 */
export function getVisibleCategories(categories: ProductCategory[], products: StoreProduct[]): ProductCategory[] {
  return categories.filter((c) => {
    if (c.name === 'Todos') return true
    if (c.hideWhenEmpty) {
      const count = products.filter((p) => isCategoryMatch(p.category, c.name)).length
      return count > 0
    }
    return true
  })
}
