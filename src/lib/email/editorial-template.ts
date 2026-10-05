/**
 * Template Editorial de Newsletter ARKNET
 *
 * Design minimalista com foco em produtos da loja:
 * - Cabeçalho com letras espaçadas e mini-menu
 * - Bloco editorial com título grande e frase manuscrita
 * - Foto de capa escura com overlay
 * - Banner de oferta na cor secundária
 * - 3 produtos em círculos ("Mais pedidos")
 * - Botão único de contacto WhatsApp
 * - Rodapé com redes sociais e cancelar subscrição
 *
 * Compatível com Gmail, Outlook, Yahoo, Apple Mail e smartphones.
 * HTML com tabelas e estilos inline; largura máxima 600px.
 */

import {
  BRAND,
  FONTS,
  FONT_IMPORTS,
  LINKS,
  LAYOUT,
  SOCIAL,
  ASSETS,
  UNSUBSCRIBE_EMAIL,
  waLink,
  waProductLink,
} from './brand'

// ---------------------------------------------------------------------------
// TIPOS
// ---------------------------------------------------------------------------

export interface EditorialProduct {
  name: string
  price?: number | null
  image: string
  imageAlt?: string
  slug?: string
  description?: string
}

export interface EditorialPromo {
  kitName: string
  discountPercent: number
  promoCode: string
  linkUrl?: string
}

export interface EditorialTemplateOptions {
  subject: string
  preheader?: string
  editionLabel?: string

  /** Conteúdo HTML do corpo principal (entre capa e produtos) */
  htmlBody: string

  /** Imagem de capa (hero) */
  coverImage?: string | null
  coverImageAlt?: string | null
  /** Título sobre a capa */
  coverTitle?: string
  coverSubtitle?: string

  /** Banner de oferta (opcional) */
  offerBannerImage?: string | null
  offerBannerAlt?: string | null
  offerBannerLink?: string | null
  promo?: EditorialPromo | null

  /** 3 produtos "Mais pedidos" */
  featuredProducts?: EditorialProduct[] | null

  siteUrl?: string
  unsubscribeEmail?: string
  isPreview?: boolean
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function esc(text: string | undefined | null): string {
  if (!text) return ''
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return 'Sob consulta'
  return new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) + ' Kz'
}

function toAbsolute(url: string | null | undefined, base: string): string {
  if (!url) return ''
  const t = url.trim()
  if (t.startsWith('http') || t.startsWith('data:') || t.startsWith('cid:')) return t
  return `${base.replace(/\/$/, '')}${t.startsWith('/') ? '' : '/'}${t}`
}

function productUrl(prod: EditorialProduct, base: string): string {
  if (prod.slug) return `${base}/loja/${prod.slug}`
  return `${base}/loja`
}

// ---------------------------------------------------------------------------
// SECÇÕES DO TEMPLATE
// ---------------------------------------------------------------------------

function renderPreheader(text: string): string {
  return `<!--[if !mso]><!--><div style="display:none;font-size:1px;color:${BRAND.bgLight};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${esc(text)}</div><!--<![endif]-->`
}

function renderHeader(base: string): string {
  const logoUrl = toAbsolute(ASSETS.logo, base)
  const menuItems = [
    { label: 'Novidades', href: LINKS.novidades },
    { label: 'Kits', href: LINKS.kits },
    { label: 'Internet', href: LINKS.internet },
    { label: 'Equipamentos', href: LINKS.equipamentos },
    { label: 'Contacto', href: LINKS.contactos },
  ]
  const menuHtml = menuItems
    .map(
      (m) =>
        `<a href="${m.href}" target="_blank" style="color:${BRAND.textFaded};text-decoration:none;font-family:${FONTS.body};font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;padding:0 8px;">${m.label}</a>`
    )
    .join(`<span style="color:${BRAND.border};">|</span>`)

  return `
<!-- Cabeçalho ARKNET -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.bgLight};">
  <tr><td align="center" style="padding:20px ${LAYOUT.sidePadding}px 0 ${LAYOUT.sidePadding}px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:${LAYOUT.maxWidth}px;">
      <tr>
        <td style="padding:16px 0 16px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td valign="middle">
                <a href="${base}" target="_blank" style="text-decoration:none;display:inline-block;">
                  <img src="${logoUrl}" alt="ARKNET" height="42" style="display:block;height:42px;max-height:42px;width:auto;border:0;outline:none;" />
                </a>
              </td>
              <td align="right" valign="middle" class="hide-mobile">
                ${menuHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td style="height:1px;background-color:${BRAND.border};font-size:0;line-height:0;">&nbsp;</td></tr>
    </table>
  </td></tr>
</table>`
}

function renderEditorialTitle(editionLabel: string): string {
  const now = new Date()
  const monthYear = now.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
  const label = editionLabel || `Edição de ${monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}`

  return `
<!-- Bloco Editorial -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.bgLight};">
  <tr><td align="center" style="padding:0 ${LAYOUT.sidePadding}px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:${LAYOUT.maxWidth}px;">
      <tr><td align="center" style="padding:32px 0 8px 0;">
        <span style="font-family:${FONTS.body};font-size:10px;font-weight:800;letter-spacing:4px;text-transform:uppercase;color:${BRAND.primary};background-color:rgba(30,96,182,0.08);padding:5px 16px;border-radius:50px;display:inline-block;">LOJA &amp; NOVIDADES</span>
      </td></tr>
      <tr><td align="center" style="padding:4px 0 4px 0;">
        <h1 style="font-family:${FONTS.heading};font-size:36px;font-weight:900;letter-spacing:8px;text-transform:uppercase;color:${BRAND.textDark};margin:0;line-height:1.1;">NEWSLETTER</h1>
      </td></tr>
      <tr><td align="center" style="padding:4px 0 24px 0;">
        <span style="font-family:${FONTS.script};font-size:24px;color:${BRAND.primary};font-weight:400;font-style:italic;">${esc(label)}</span>
      </td></tr>
    </table>
  </td></tr>
</table>`
}

function renderHeroCover(
  coverImage: string,
  coverAlt: string,
  title: string,
  subtitle: string,
  base: string
): string {
  const waHref = waLink(subtitle ? `Olá ARKNET! ${subtitle}` : undefined)

  return `
<!-- Imagem de Capa + Bloco Escuro -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.bgLight};">
  <tr><td align="center" style="padding:0 ${LAYOUT.sidePadding}px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:${LAYOUT.maxWidth}px;overflow:hidden;">
      <!-- Foto de Capa -->
      <tr><td style="padding:0;">
        <img src="${coverImage}" alt="${esc(coverAlt)}" width="${LAYOUT.maxWidth}" style="display:block;width:100%;max-width:${LAYOUT.maxWidth}px;height:auto;border:0;outline:none;" />
      </td></tr>
      <!-- Bloco Escuro -->
      <tr><td style="background-color:${BRAND.bgDark};padding:28px ${LAYOUT.sidePadding}px 32px ${LAYOUT.sidePadding}px;">
        <h2 style="font-family:${FONTS.heading};font-size:20px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:${BRAND.textLight};margin:0 0 8px 0;line-height:1.3;">${esc(title)}</h2>
        ${subtitle ? `<p style="font-family:${FONTS.body};font-size:13px;color:${BRAND.textFaded};margin:0 0 22px 0;line-height:1.6;">${esc(subtitle)}</p>` : '<div style="height:14px;"></div>'}
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr><td>
            <a href="${waHref}" target="_blank" style="display:inline-block;font-family:${FONTS.heading};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${BRAND.textLight};text-decoration:none;border:1.5px solid ${BRAND.textFaded};border-radius:50px;padding:10px 28px;">Pedir agora</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </td></tr>
</table>`
}

function renderHeroPlaceholder(): string {
  return `
<!-- Placeholder de Capa (apenas na pre-visualizacao) -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.bgLight};">
  <tr><td align="center" style="padding:0 ${LAYOUT.sidePadding}px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:${LAYOUT.maxWidth}px;">
      <tr><td style="background-color:${BRAND.bgDark};padding:60px ${LAYOUT.sidePadding}px;text-align:center;">
        <p style="font-family:${FONTS.body};font-size:13px;color:${BRAND.textFaded};margin:0;">Carregue a imagem de capa no editor para ver o resultado aqui.</p>
      </td></tr>
    </table>
  </td></tr>
</table>`
}

function renderBodyContent(html: string): string {
  return `
<!-- Corpo da Newsletter -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.bgLight};">
  <tr><td align="center" style="padding:0 ${LAYOUT.sidePadding}px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:${LAYOUT.maxWidth}px;background-color:${BRAND.white};">
      <tr><td style="padding:28px ${LAYOUT.sidePadding}px;">
        <div style="font-family:${FONTS.body};font-size:14px;color:${BRAND.textDark};line-height:1.75;">
          ${html}
        </div>
      </td></tr>
    </table>
  </td></tr>
</table>`
}

function renderPromoBanner(promo: EditorialPromo, base: string): string {
  const link = promo.linkUrl || LINKS.loja

  return `
<!-- Banner de Oferta -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.bgLight};">
  <tr><td align="center" style="padding:0 ${LAYOUT.sidePadding}px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:${LAYOUT.maxWidth}px;background-color:${BRAND.secondary};overflow:hidden;">
      <tr><td style="padding:32px ${LAYOUT.sidePadding}px;text-align:center;">
        <span style="font-family:${FONTS.body};font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,0.7);">Oferta Especial</span>
        <h3 style="font-family:${FONTS.heading};font-size:20px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:${BRAND.white};margin:10px 0 6px 0;">${esc(promo.kitName)}</h3>
        <div style="font-family:${FONTS.heading};font-size:52px;font-weight:900;color:${BRAND.white};line-height:1;margin:8px 0 16px 0;">-${promo.discountPercent}%</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
          <tr><td style="background-color:${BRAND.white};border-radius:50px;padding:8px 24px;">
            <span style="font-family:${FONTS.mono};font-size:14px;font-weight:700;letter-spacing:3px;color:${BRAND.secondary};">${esc(promo.promoCode)}</span>
          </td></tr>
        </table>
        <div style="height:16px;"></div>
        <a href="${link}" target="_blank" style="font-family:${FONTS.heading};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${BRAND.white};text-decoration:none;border:1.5px solid rgba(255,255,255,0.5);border-radius:50px;padding:10px 28px;display:inline-block;">Ver Oferta</a>
      </td></tr>
    </table>
  </td></tr>
</table>`
}

function renderOfferBannerImage(image: string, alt: string, link: string): string {
  return `
<!-- Banner de Oferta (Imagem) -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.bgLight};">
  <tr><td align="center" style="padding:8px ${LAYOUT.sidePadding}px 0 ${LAYOUT.sidePadding}px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:${LAYOUT.maxWidth}px;">
      <tr><td align="center">
        <a href="${link}" target="_blank" style="text-decoration:none;display:block;">
          <img src="${image}" alt="${esc(alt)}" width="${LAYOUT.maxWidth - 2 * LAYOUT.sidePadding}" style="display:block;width:100%;max-width:${LAYOUT.maxWidth - 2 * LAYOUT.sidePadding}px;height:auto;border:0;outline:none;border-radius:8px;" />
        </a>
      </td></tr>
    </table>
  </td></tr>
</table>`
}

function renderSingleProduct(prod: EditorialProduct, base: string): string {
  const absImage = toAbsolute(prod.image, base)
  const alt = esc(prod.imageAlt || prod.name)
  const link = productUrl(prod, base)
  const price = formatPrice(prod.price)
  const cs = LAYOUT.productCircle

  return `
<td align="center" valign="top" style="padding:8px;" class="product-col">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
    <!-- Foto Circular -->
    <tr><td align="center" style="padding-bottom:12px;">
      <a href="${link}" target="_blank" style="text-decoration:none;display:block;">
        <div style="width:${cs}px;height:${cs}px;border-radius:50%;overflow:hidden;border:2px solid ${BRAND.border};margin:0 auto;">
          <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" style="width:${cs}px;height:${cs}px;" arcsize="50%" stroke="false"><v:fill type="frame" src="${absImage}" /><![endif]-->
          <img src="${absImage}" alt="${alt}" width="${cs}" height="${cs}" style="display:block;width:${cs}px;height:${cs}px;object-fit:cover;border-radius:50%;border:0;" />
          <!--[if mso]></v:roundrect><![endif]-->
        </div>
      </a>
    </td></tr>
    <!-- Etiqueta com nome -->
    <tr><td align="center" style="padding-bottom:6px;">
      <span style="display:inline-block;font-family:${FONTS.heading};font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${BRAND.textDark};background-color:${BRAND.bgSection};border:1px solid ${BRAND.border};border-radius:50px;padding:5px 14px;line-height:1.3;">${esc(prod.name)}</span>
    </td></tr>
    <!-- Preco -->
    <tr><td align="center">
      <span style="font-family:${FONTS.body};font-size:14px;font-weight:800;color:${BRAND.primary};">${price}</span>
    </td></tr>
  </table>
</td>`
}

function renderFeaturedProducts(products: EditorialProduct[], base: string, isPreview: boolean): string {
  const valid = products.filter((p) => p.name?.trim() || p.image?.trim())

  if (valid.length === 0) {
    if (!isPreview) return ''
    return `
<!-- Placeholder de Produtos (apenas na pre-visualizacao) -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.bgLight};">
  <tr><td align="center" style="padding:8px ${LAYOUT.sidePadding}px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:${LAYOUT.maxWidth}px;background-color:${BRAND.white};">
      <tr><td align="center" style="padding:32px;">
        <span style="font-family:${FONTS.body};font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${BRAND.textMuted};">Mais Pedidos</span>
        <p style="font-family:${FONTS.body};font-size:12px;color:${BRAND.textFaded};margin:8px 0 0 0;">Selecione 3 produtos no editor para exibir aqui.</p>
      </td></tr>
    </table>
  </td></tr>
</table>`
  }

  const cols = valid.slice(0, 3).map((p) => renderSingleProduct(p, base)).join('')

  return `
<!-- Secção: Mais Pedidos -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.bgLight};">
  <tr><td align="center" style="padding:8px ${LAYOUT.sidePadding}px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:${LAYOUT.maxWidth}px;background-color:${BRAND.white};">
      <!-- Separador fino -->
      <tr><td style="padding:0 ${LAYOUT.sidePadding}px;"><div style="height:1px;background-color:${BRAND.border};"></div></td></tr>
      <!-- Titulo -->
      <tr><td align="center" style="padding:28px 0 6px 0;">
        <span style="font-family:${FONTS.body};font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${BRAND.textMuted};">Os Nossos</span>
      </td></tr>
      <tr><td align="center" style="padding:0 0 24px 0;">
        <span style="font-family:${FONTS.heading};font-size:22px;font-weight:900;letter-spacing:5px;text-transform:uppercase;color:${BRAND.textDark};">MAIS PEDIDOS</span>
      </td></tr>
      <!-- Produtos em Colunas -->
      <tr><td style="padding:0 8px 24px 8px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr class="products-row">${cols}</tr>
        </table>
      </td></tr>
    </table>
  </td></tr>
</table>`
}

function renderWhatsAppButton(): string {
  const href = waLink()

  return `
<!-- Botao WhatsApp -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.bgLight};">
  <tr><td align="center" style="padding:4px ${LAYOUT.sidePadding}px 8px ${LAYOUT.sidePadding}px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:${LAYOUT.maxWidth}px;background-color:${BRAND.white};">
      <tr><td align="center" style="padding:8px 0 32px 0;">
        <a href="${href}" target="_blank" style="display:inline-block;font-family:${FONTS.heading};font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${BRAND.textDark};text-decoration:none;border:1.5px solid ${BRAND.textDark};border-radius:50px;padding:14px 36px;">Falar com a ARKNET no WhatsApp</a>
      </td></tr>
    </table>
  </td></tr>
</table>`
}

function renderFooter(base: string, unsubEmail: string): string {
  const logoUrl = toAbsolute(ASSETS.logo, base)
  const fbIcon = toAbsolute(ASSETS.socialFacebook, base)
  const igIcon = toAbsolute(ASSETS.socialInstagram, base)
  const inIcon = toAbsolute(ASSETS.socialLinkedin, base)
  const waIcon = toAbsolute(ASSETS.socialWhatsapp, base)

  const socialItems = [
    { img: fbIcon, href: SOCIAL.facebook, label: 'Facebook' },
    { img: igIcon, href: SOCIAL.instagram, label: 'Instagram' },
    { img: inIcon, href: SOCIAL.linkedin, label: 'LinkedIn' },
    { img: waIcon, href: waLink(), label: 'WhatsApp' },
  ]
  const socialHtml = socialItems
    .map(
      (s) =>
        `<td style="padding:0 8px;" align="center">
          <a href="${s.href}" target="_blank" title="${s.label}" style="display:inline-block;text-decoration:none;">
            <img src="${s.img}" alt="${s.label}" width="32" height="32" style="display:block;width:32px;height:32px;border:0;border-radius:50%;" />
          </a>
        </td>`
    )
    .join('')

  return `
<!-- Rodape -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.bgLight};">
  <tr><td align="center" style="padding:0 ${LAYOUT.sidePadding}px 36px ${LAYOUT.sidePadding}px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:${LAYOUT.maxWidth}px;">
      <!-- Separador -->
      <tr><td style="height:1px;background-color:${BRAND.border};font-size:0;line-height:0;">&nbsp;</td></tr>

      <!-- Logotipo ARKNET no Rodapé -->
      <tr><td align="center" style="padding:28px 0 12px 0;">
        <a href="${base}" target="_blank" style="text-decoration:none;display:inline-block;">
          <img src="${logoUrl}" alt="ARKNET" height="32" style="display:block;height:32px;max-height:32px;width:auto;border:0;margin:0 auto;" />
        </a>
      </td></tr>

      <!-- Slogan Decorativo -->
      <tr><td align="center" style="padding:0 0 18px 0;">
        <span style="font-family:${FONTS.script};font-size:22px;color:${BRAND.primary};font-style:italic;">Conectividade e Tecnologia para o seu dia a dia</span>
      </td></tr>

      <!-- Redes Sociais com Ícones Reais -->
      <tr><td align="center" style="padding:0 0 20px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
          <tr>${socialHtml}</tr>
        </table>
      </td></tr>

      <!-- Links Rápidos -->
      <tr><td align="center" style="padding:0 0 16px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
          <tr>
            <td style="padding:0 8px;"><a href="${LINKS.loja}" target="_blank" style="font-family:${FONTS.body};font-size:11px;font-weight:700;color:${BRAND.primary};text-decoration:none;">Loja Online</a></td>
            <td style="color:${BRAND.border}; font-size:11px;">|</td>
            <td style="padding:0 8px;"><a href="${LINKS.site}" target="_blank" style="font-family:${FONTS.body};font-size:11px;font-weight:700;color:${BRAND.primary};text-decoration:none;">Website Oficial</a></td>
            <td style="color:${BRAND.border}; font-size:11px;">|</td>
            <td style="padding:0 8px;"><a href="${LINKS.contactos}" target="_blank" style="font-family:${FONTS.body};font-size:11px;font-weight:700;color:${BRAND.primary};text-decoration:none;">Contactos</a></td>
          </tr>
        </table>
      </td></tr>

      <!-- Cancelar Subscrição -->
      <tr><td align="center" style="padding:0 0 8px 0;">
        <span style="font-family:${FONTS.body};font-size:10px;color:${BRAND.textFaded};line-height:1.6;">
          Recebeu este e-mail porque subscreveu as novidades da loja ARKNET.<br/>
          <a href="mailto:${unsubEmail}?subject=Cancelar%20Subscricao%20Newsletter&body=Pretendo%20cancelar%20a%20minha%20subscricao%20da%20newsletter%20ARKNET." style="color:${BRAND.textMuted};text-decoration:underline;">Cancelar subscrição</a>
        </span>
      </td></tr>
    </table>
  </td></tr>
</table>`
}

// ---------------------------------------------------------------------------
// GERADOR PRINCIPAL
// ---------------------------------------------------------------------------

export function generateEditorialHtml(options: EditorialTemplateOptions): string {
  const base = (options.siteUrl || LINKS.site).replace(/\/$/, '')
  const unsubEmail = options.unsubscribeEmail || UNSUBSCRIBE_EMAIL
  const preheader = options.preheader || options.subject
  const editionLabel = options.editionLabel || ''

  const absCover = options.coverImage ? toAbsolute(options.coverImage, base) : null
  const coverAlt = options.coverImageAlt || options.subject || 'ARKNET Newsletter'
  const coverTitle = options.coverTitle || options.subject || ''
  const coverSubtitle = options.coverSubtitle || ''

  const absOfferBanner = options.offerBannerImage ? toAbsolute(options.offerBannerImage, base) : null
  const offerAlt = options.offerBannerAlt || 'Oferta Especial ARKNET'
  const offerLink = options.offerBannerLink ? toAbsolute(options.offerBannerLink, base) : LINKS.loja

  // Imports de fontes
  const fontLinks = FONT_IMPORTS.map((u) => `<link href="${u}" rel="stylesheet" />`).join('\n    ')

  // Hero
  let heroHtml = ''
  if (absCover) {
    heroHtml = renderHeroCover(absCover, coverAlt, coverTitle, coverSubtitle, base)
  } else if (options.isPreview) {
    heroHtml = renderHeroPlaceholder()
  }

  // Corpo
  const bodyHtml = options.htmlBody?.trim() ? renderBodyContent(options.htmlBody) : ''

  // Promo / Banner de oferta
  let promoHtml = ''
  if (options.promo && options.promo.kitName) {
    promoHtml = renderPromoBanner(options.promo, base)
  } else if (absOfferBanner) {
    promoHtml = renderOfferBannerImage(absOfferBanner, offerAlt, offerLink)
  }

  // Produtos
  const productsHtml = renderFeaturedProducts(
    options.featuredProducts || [],
    base,
    options.isPreview || false
  )

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="pt">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="format-detection" content="telephone=no, address=no, email=no, date=no" />
    <title>${esc(options.subject)}</title>
    <!--[if !mso]><!-->
    ${fontLinks}
    <!--<![endif]-->
    <style type="text/css">
      /* Reset */
      body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
      body { margin: 0; padding: 0; width: 100% !important; background-color: ${BRAND.bgLight}; }

      /* Responsivo */
      @media only screen and (max-width: 620px) {
        .hide-mobile { display: none !important; }
        .products-row td.product-col {
          display: block !important;
          width: 100% !important;
          padding: 16px 0 !important;
        }
      }
    </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bgLight};font-family:${FONTS.body};">
  ${renderPreheader(preheader)}

  ${renderHeader(base)}
  ${renderEditorialTitle(editionLabel)}
  ${heroHtml}
  ${bodyHtml}
  ${promoHtml}
  ${productsHtml}
  ${renderWhatsAppButton()}
  ${renderFooter(base, unsubEmail)}

</body>
</html>`
}

// ---------------------------------------------------------------------------
// VERSÃO TEXTO SIMPLES
// ---------------------------------------------------------------------------

export function generateEditorialPlainText(options: EditorialTemplateOptions): string {
  const base = (options.siteUrl || LINKS.site).replace(/\/$/, '')
  const text = (options.htmlBody || '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<li>/gi, ' - ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  let productsText = ''
  if (options.featuredProducts && options.featuredProducts.length > 0) {
    productsText =
      '\n\nMAIS PEDIDOS:\n' +
      options.featuredProducts.map((p) => `  - ${p.name}: ${formatPrice(p.price)}`).join('\n')
  }

  let promoText = ''
  if (options.promo && options.promo.kitName) {
    promoText = `\n\nOFERTA ESPECIAL: ${options.promo.kitName} — ${options.promo.discountPercent}% de desconto\nCodigo: ${options.promo.promoCode}`
  }

  return [
    'ARKNET NEWSLETTER',
    '=' .repeat(40),
    options.subject,
    '=' .repeat(40),
    '',
    text,
    promoText,
    productsText,
    '',
    '-'.repeat(40),
    `Loja: ${base}/loja`,
    `Website: ${base}`,
    `WhatsApp: https://wa.me/${LINKS.site.includes('arknet') ? '244935208449' : ''}`,
    '',
    'Para cancelar a subscricao, responda a este e-mail.',
    'ARKNET - Tecnologia e Conectividade',
  ].join('\n')
}

export const generateEditorialNewsletterHtml = generateEditorialHtml

