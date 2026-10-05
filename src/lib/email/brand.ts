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
  /** Azul corporativo ARKNET — botões, links, destaques */
  primary: '#1e60b6',
  /** Variante mais escura do primário — hover, gradientes */
  primaryDark: '#154a8c',

  /** Vermelho de destaque — banners de oferta, badges */
  secondary: '#e30613',
  /** Variante mais escura do secundário */
  secondaryDark: '#b8050f',

  /** Fundo geral do email (cinza muito suave) */
  bgLight: '#f5f7fa',
  /** Fundo de blocos escuros (cabeçalho, hero, rodapé) */
  bgDark: '#0f172a',
  /** Fundo intermédio para cards de produto */
  bgCard: '#ffffff',
  /** Fundo de secções alternadas */
  bgSection: '#f8fafc',

  /** Cor do texto principal */
  textDark: '#0f172a',
  /** Texto secundário / subtítulos */
  textMuted: '#64748b',
  /** Texto sobre fundo escuro */
  textLight: '#ffffff',
  /** Texto terciário / rodapé */
  textFaded: '#94a3b8',

  /** Bordas finas e separadores */
  border: '#e2e8f0',
  /** Borda mais suave */
  borderLight: '#f1f5f9',

  /** Branco puro */
  white: '#ffffff',
} as const

// ---------------------------------------------------------------------------
// TIPOGRAFIA (fontes seguras para email + Google Fonts como enhancement)
// ---------------------------------------------------------------------------

export const FONTS = {
  /** Font stack para títulos — Montserrat carrega via Google Fonts, Arial como fallback */
  heading: "'Montserrat', 'Helvetica Neue', Arial, sans-serif",
  /** Font stack para corpo de texto */
  body: "'Helvetica Neue', Arial, 'Segoe UI', sans-serif",
  /** Fonte manuscrita decorativa — Allura via Google Fonts, cursive como fallback */
  script: "'Allura', 'Brush Script MT', cursive",
  /** Fonte mono para códigos promocionais */
  mono: "'Courier New', Courier, monospace",
} as const

/** URLs do Google Fonts para importar no <head> do email (alguns clientes suportam) */
export const FONT_IMPORTS = [
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap',
  'https://fonts.googleapis.com/css2?family=Allura&display=swap',
] as const

// ---------------------------------------------------------------------------
// LINKS E CONTACTOS
// ---------------------------------------------------------------------------

export const LINKS = {
  site: 'https://arknet.co.ao',
  loja: 'https://arknet.co.ao/loja',
  contactos: 'https://arknet.co.ao/contactos',
  novidades: 'https://arknet.co.ao/#novidades',
  kits: 'https://arknet.co.ao/loja?cat=kits',
  internet: 'https://arknet.co.ao/loja?cat=internet',
  equipamentos: 'https://arknet.co.ao/loja?cat=equipamentos',
} as const

export const WHATSAPP = {
  /** Número de WhatsApp formatado para wa.me (sem + nem espaços) */
  number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^0-9]/g, '') || '244935208449',
  /** Mensagem pré-preenchida genérica */
  defaultMsg: 'Olá ARKNET! Vi a vossa newsletter e gostaria de saber mais.',
} as const

export const SOCIAL = {
  facebook: 'https://www.facebook.com/p/Arknet-61563707010243/',
  instagram: 'https://www.instagram.com/p/DYRqhy6DNS6/',
  linkedin: 'https://www.linkedin.com/company/arknet-oficial/',
} as const

export const ASSETS = {
  logo: '/images/arknet-logo.png',
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
  sidePadding: 32,
  /** Padding lateral em mobile */
  mobilePadding: 16,
  /** Tamanho dos círculos de produto */
  productCircle: 140,
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
  return waLink(`Olá ARKNET! Vi o produto "${productName}" na newsletter e gostaria de encomendar.`)
}
