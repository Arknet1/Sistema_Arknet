/**
 * ARKNET - Constantes visuais da marca para templates de email
 *
 * Todas as cores, fontes e links usados nos templates de email da newsletter
 * estão centralizados aqui. Para mudar a aparência de todos os emails,
 * basta alterar os valores neste ficheiro.
 *
 * Cores extraídas de: src/app/main.css (variáveis @theme)
 */

// ---------------------------------------------------------------------------
// CORES DA MARCA
// ---------------------------------------------------------------------------

export const BRAND = {
  /** Azul corporativo J.Matos Tecnologia (#1E78C2) — botões, links, destaques */
  primary: '#1E78C2',
  /** Variante mais escura do primário J.Matos (#165ea0) — hover, gradientes */
  primaryDark: '#165ea0',

  /** Laranja de destaque J.Matos Tecnologia (#F7941D) — badges e acentos da marca */
  secondary: '#F7941D',
  /** Variante mais escura do secundário (#d97d10) */
  secondaryDark: '#d97d10',

  /** Laranja de destaque oficial J.Matos */
  accentCyan: '#F7941D',

  /** Verde oficial WhatsApp */
  whatsappGreen: '#16a34a',
  whatsappGreenDark: '#15803d',

  /** Fundo geral externo do email (dark navy premium corporativo) */
  bgOuter: '#0b1329',
  /** Fundo geral interno */
  bgLight: '#f8fafc',
  /** Fundo de blocos escuros (cabeçalho e rodapé) */
  bgDark: '#0b1329',
  headerBg: '#0f172a',
  /** Fundo intermédio para cards de produto */
  bgCard: '#ffffff',
  /** Fundo de secções alternadas */
  bgSection: '#f1f5f9',

  /** Cor do texto principal */
  textDark: '#0f172a',
  /** Texto secundário / subtítulos */
  textMuted: '#475569',
  /** Texto sobre fundo escuro */
  textLight: '#ffffff',
  /** Texto terciário / rodapé */
  textFaded: '#94a3b8',

  /** Bordas finas e separadores */
  border: '#e2e8f0',
  /** Borda mais suave */
  borderLight: '#f1f5f9',
  /** Borda escura para footer e header */
  borderDark: '#1e293b',

  /** Branco puro */
  white: '#ffffff',
} as const

// ---------------------------------------------------------------------------
// TIPOGRAFIA (fontes seguras para email + Montserrat como principal)
// ---------------------------------------------------------------------------

export const FONTS = {
  /** Font stack para títulos — Montserrat moderno */
  heading: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  /** Font stack para corpo de texto */
  body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  /** Subtítulo moderno sem caligrafia manuscrita frágil */
  subheading: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  /** Fonte mono para códigos promocionais / referências */
  mono: "'Courier New', Courier, monospace",
} as const

/** URLs do Google Fonts para importar no <head> do email (Montserrat limpo) */
export const FONT_IMPORTS = [
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap',
] as const

// ---------------------------------------------------------------------------
// LINKS E CONTACTOS
// ---------------------------------------------------------------------------

export const LINKS = {
  site: 'https://arknet.co.ao',
  loja: 'https://arknet.co.ao/loja',
  contactos: 'https://arknet.co.ao/contactos',
  servicos: 'https://arknet.co.ao/servicos',
  projetos: 'https://arknet.co.ao/projetos',
  novidades: 'https://arknet.co.ao/#novidades',
  kits: 'https://arknet.co.ao/loja?cat=kits',
  internet: 'https://arknet.co.ao/loja?cat=internet',
  equipamentos: 'https://arknet.co.ao/loja?cat=equipamentos',
} as const

export const CONTACTS = {
  phone: '+244 935 208 449',
  email: 'comercial@jmatos.co.ao',
  address: 'Luanda, Angola',
  companyName: 'J.Matos Tecnologia',
  slogan: 'Soluções Tecnológicas',
} as const

export const WHATSAPP = {
  /** Número de WhatsApp formatado para wa.me (sem + nem espaços) */
  number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^0-9]/g, '') || '244935208449',
  /** Mensagem pré-preenchida genérica */
  defaultMsg: 'Olá J.Matos Tecnologia! Vi a vossa newsletter e gostaria de saber mais.',
} as const

export const SOCIAL = {
  facebook: 'https://www.facebook.com/p/Arknet-61563707010243/',
  instagram: 'https://www.instagram.com/p/DYRqhy6DNS6/',
  linkedin: 'https://www.linkedin.com/company/arknet-oficial/',
  whatsapp: 'https://wa.me/244935208449',
} as const

export const ASSETS = {
  logo: '/images/jmatos.png',
  logoAlt: 'J.Matos Tecnologia',
  socialFacebook: '/images/social/facebook.png',
  socialInstagram: '/images/social/instagram.png',
  socialLinkedin: '/images/social/linkedin.png',
  socialWhatsapp: '/images/social/whatsapp.png',
} as const

export const UNSUBSCRIBE_EMAIL = process.env.SMTP_USER || 'arknet40@gmail.com'

// ---------------------------------------------------------------------------
// DIMENSÕES DO TEMPLATE
// ---------------------------------------------------------------------------

export const LAYOUT = {
  /** Largura máxima do email em pixels */
  maxWidth: 600,
  /** Padding lateral do conteúdo */
  sidePadding: 24,
  /** Padding lateral em mobile */
  mobilePadding: 16,
  /** Largura máxima do card de produto no grid desktop */
  productCardMaxWidth: 176,
  /** Altura máxima da foto do produto dentro do card */
  productImageHeight: 120,
} as const

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

/** Gera um link wa.me com mensagem pré-preenchida */
export function waLink(message?: string): string {
  const msg = encodeURIComponent(message || WHATSAPP.defaultMsg)
  return `https://wa.me/${WHATSAPP.number}?text=${msg}`
}

/** Gera um link wa.me para encomendar um produto específico */
export function waProductLink(productName: string): string {
  return waLink(`Olá J.Matos Tecnologia! Vi o produto "${productName}" na newsletter e gostaria de encomendar.`)
}
