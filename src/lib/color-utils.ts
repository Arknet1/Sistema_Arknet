/**
 * Utilitários de Cor e Reconhecimento de Hex para Opções de Produtos (ARKNET)
 */

export const COLOR_HEX_MAP: Record<string, string> = {
  // Preto / Escuro
  preto: '#111827',
  preta: '#111827',
  black: '#111827',
  negro: '#111827',
  dark: '#111827',
  escuro: '#1F2937',

  // Branco / Claro
  branco: '#FFFFFF',
  branca: '#FFFFFF',
  white: '#FFFFFF',
  claro: '#F8FAFC',

  // Cinzento / Grafite / Prata
  cinza: '#64748B',
  cinzento: '#64748B',
  gray: '#64748B',
  grey: '#64748B',
  grafite: '#374151',
  graphite: '#374151',
  chumbo: '#334155',
  'space gray': '#374151',
  'cinzento sideral': '#374151',
  sideral: '#374151',
  prata: '#CBD5E1',
  prateado: '#CBD5E1',
  silver: '#CBD5E1',
  aluminio: '#E2E8F0',
  'alumínio': '#E2E8F0',

  // Dourado / Ouro / Bronze
  dourado: '#F59E0B',
  dourada: '#F59E0B',
  ouro: '#F59E0B',
  gold: '#F59E0B',
  champagne: '#FDE68A',
  bronze: '#92400E',

  // Azul
  azul: '#1E40AF',
  blue: '#1E40AF',
  'azul marinho': '#1E3A8A',
  'azul escuro': '#172554',
  'azul royal': '#2563EB',
  'azul celeste': '#38BDF8',
  'azul claro': '#60A5FA',
  navy: '#1E3A8A',
  indigo: '#4338CA',
  'índigo': '#4338CA',
  sky: '#0EA5E9',

  // Verde
  verde: '#15803D',
  green: '#15803D',
  'verde escuro': '#14532D',
  'verde tropa': '#3F6212',
  'verde militar': '#3F6212',
  'verde floresta': '#166534',
  oliva: '#4D7C0F',
  olive: '#4D7C0F',
  menta: '#6EE7B7',
  mint: '#6EE7B7',
  esmeralda: '#059669',
  emerald: '#059669',

  // Vermelho / Bordô / Vinho
  vermelho: '#DC2626',
  vermelha: '#DC2626',
  red: '#DC2626',
  bordo: '#881337',
  'bordô': '#881337',
  vinho: '#7F1D1D',
  carmim: '#991B1B',
  rubi: '#BE123C',
  ruby: '#BE123C',

  // Rosa / Rosê
  rosa: '#EC4899',
  pink: '#EC4899',
  rose: '#FB7185',
  'rosé': '#FB7185',
  'rosa claro': '#FBCFE8',
  magenta: '#D946EF',

  // Roxo / Violeta / Lilás
  roxo: '#7E22CE',
  roxa: '#7E22CE',
  purple: '#7E22CE',
  violeta: '#8B5CF6',
  violet: '#8B5CF6',
  lilas: '#C084FC',
  'lilás': '#C084FC',
  purpura: '#6B21A8',
  'púrpura': '#6B21A8',

  // Laranja / Coral / Âmbar
  laranja: '#EA580C',
  orange: '#EA580C',
  coral: '#F97316',
  ambar: '#D97706',
  'âmbar': '#D97706',

  // Amarelo
  amarelo: '#EAB308',
  amarela: '#EAB308',
  yellow: '#EAB308',

  // Castanho / Marrom
  castanho: '#78350F',
  castanha: '#78350F',
  marrom: '#78350F',
  brown: '#78350F',
  chocolate: '#451A03',
  caramelo: '#B45309',

  // Bege / Nude / Areia
  bege: '#D6C0B3',
  beige: '#D6C0B3',
  nude: '#E7D4C0',
  areia: '#E2D9CC',
  sand: '#E2D9CC',
  creme: '#FEF3C7',
  cream: '#FEF3C7',

  // Ciano / Turquesa
  ciano: '#06B6D4',
  cyan: '#06B6D4',
  turquesa: '#0D9488',
  turquoise: '#0D9488',
  teal: '#0F766E',
}

/**
 * Deduz o código hex a partir do nome de uma cor em português ou inglês
 */
export function guessColorHex(colorName: string): string {
  if (!colorName || typeof colorName !== 'string') return '#94A3B8'
  const clean = colorName.trim().toLowerCase()

  // 1. Correspondência exata
  if (COLOR_HEX_MAP[clean]) return COLOR_HEX_MAP[clean]

  // 2. Se for um código hex válido inserido diretamente (#fff, #123456)
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(clean)) {
    return clean.toUpperCase()
  }

  // 3. Correspondência parcial / substrings
  for (const [key, hex] of Object.entries(COLOR_HEX_MAP)) {
    if (clean.includes(key) || key.includes(clean)) return hex
  }

  // 4. Fallback padrão elegante (slate)
  return '#64748B'
}

/**
 * Verifica se um nome de atributo representa uma Cor
 */
export function isColorOption(optionName: string): boolean {
  if (!optionName || typeof optionName !== 'string') return false
  const clean = optionName.trim().toLowerCase()
  return (
    clean.includes('cor') ||
    clean.includes('cores') ||
    clean.includes('color') ||
    clean.includes('colour') ||
    clean.includes('acabamento') ||
    clean.includes('tonalidade')
  )
}
