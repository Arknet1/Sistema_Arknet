/**
 * Template Editorial de Newsletter ARKNET
 *
 * Design profissional, moderno e tecnológico alinhado com a identidade da ARKNET:
 * - Cabeçalho corporativo com logotipo e mini-menu
 * - Título moderno com tipografia limpa (sem caligrafia frágil)
 * - Foto de capa (hero) de alta definição
 * - Produtos em cartões retangulares 100% responsivos (fotos completas sem cortes circulares)
 * - Botão WhatsApp em verde oficial de alta visibilidade
 * - Rodapé corporativo escuro (#0b1329) idêntico ao website com botões sociais estilizados
 *
 * 100% compatível com Gmail (Desktop e Mobile), Outlook, Yahoo, Apple Mail e Webmail.
 */

import {
  BRAND,
  FONTS,
  FONT_IMPORTS,
  LINKS,
  LAYOUT,
  SOCIAL,
  CONTACTS,
  ASSETS,
  UNSUBSCRIBE_EMAIL,
  WHATSAPP,
  waLink,
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

export interface EditorialTemplateOptions {
  subject: string
  preheader?: string
  editionLabel?: string

  /** Conteúdo HTML do corpo principal */
  htmlBody: string

  /** Imagem de capa (hero) */
  coverImage?: string | null
  coverImageAlt?: string | null
  /** Título sobre a capa */
  coverTitle?: string
  coverSubtitle?: string

  /** 3 produtos em destaque */
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
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return 'Sob consulta'
  return (
    new Intl.NumberFormat('pt-AO', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + ' Kz'
  )
}

function toAbsolute(url: string | null | undefined, base: string): string {
  if (!url) return ''
  const t = url.trim()
  if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('data:') || t.startsWith('cid:')) {
    return t
  }
  const cleanBase = base.replace(/\/$/, '')
  const cleanPath = t.startsWith('/') ? t : `/${t}`
  return `${cleanBase}${cleanPath}`
}

function productUrl(prod: EditorialProduct, base: string): string {
  if (prod.slug) return `${base}/loja/${prod.slug}`
  return `${base}/loja`
}

// ---------------------------------------------------------------------------
// SECÇÕES DO TEMPLATE
// ---------------------------------------------------------------------------

function renderPreheader(text: string): string {
  return `<!--[if !mso]><!--><div style="display:none;font-size:1px;color:${BRAND.bgOuter};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${esc(text)}</div><!--<![endif]-->`
}

function renderHeader(base: string, editionLabel?: string): string {
  const logoUrl = toAbsolute(ASSETS.logo, base)
  const label = editionLabel || 'Edição Especial'

  const menuItems = [
    { label: 'Loja', href: LINKS.loja },
    { label: 'Equipamentos', href: LINKS.equipamentos },
    { label: 'Internet', href: LINKS.internet },
    { label: 'Serviços', href: LINKS.servicos },
    { label: 'Contacto', href: LINKS.contactos },
  ]

  const menuHtml = menuItems
    .map(
      (m) =>
        `<a href="${m.href}" target="_blank" style="color:#475569;text-decoration:none;font-family:${FONTS.heading};font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:0 7px;">${m.label}</a>`
    )
    .join(`<span style="color:#94a3b8;font-size:10px;">&bull;</span>`)

  return `
<!-- Linha Superior de Acento da Marca (Azul e Laranja J.Matos) -->
<tr>
  <td style="height: 4px; background: linear-gradient(90deg, #1E78C2 0%, #F7941D 100%); line-height: 4px; font-size: 1px;">
    &nbsp;
  </td>
</tr>

<!-- Cabeçalho Corporativo J.Matos Tecnologia -->
<tr>
  <td style="background-color: #ffffff; padding: 16px ${LAYOUT.sidePadding}px; border-bottom: 1px solid ${BRAND.border};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td valign="middle" align="left">
          <a href="${base}/loja" target="_blank" style="text-decoration:none;display:inline-block;">
            <img src="${logoUrl}" alt="J.Matos Tecnologia" height="42" style="display:block;height:42px;max-height:42px;width:auto;border:0;outline:none;" />
          </a>
        </td>
        <td align="right" valign="middle" class="hide-mobile">
          <div style="margin-bottom: 6px;">
            <span style="display:inline-block;font-family:${FONTS.heading};font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${BRAND.secondary};background-color:rgba(247,148,29,0.12);border:1px solid rgba(247,148,29,0.3);padding:3px 12px;border-radius:999px;">
              ${esc(label)}
            </span>
          </div>
          <div>${menuHtml}</div>
        </td>
      </tr>
    </table>
  </td>
</tr>`
}

function renderEditorialTitle(editionLabel?: string): string {
  const now = new Date()
  const monthYear = now.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
  const label = editionLabel || `Edição de ${monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}`

  return `
<!-- Bloco de Título Newsletter -->
<tr>
  <td align="center" style="background-color: #ffffff; padding: 32px ${LAYOUT.sidePadding}px 18px ${LAYOUT.sidePadding}px; border-bottom: 1px solid ${BRAND.borderLight};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 540px;">
      <tr>
        <td align="center" style="padding-bottom: 10px;">
          <span style="font-family: ${FONTS.heading}; font-size: 10px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; color: ${BRAND.primary}; background-color: rgba(30, 120, 194, 0.08); border: 1px solid rgba(30, 120, 194, 0.2); padding: 5px 16px; border-radius: 50px; display: inline-block;">
            LOJA &amp; NOVIDADES
          </span>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom: 6px;">
          <h1 style="font-family: ${FONTS.heading}; font-size: 32px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase; color: ${BRAND.textDark}; margin: 0; line-height: 1.15;">
            NEWSLETTER
          </h1>
        </td>
      </tr>
      <tr>
        <td align="center">
          <p style="font-family: ${FONTS.heading}; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; color: ${BRAND.textMuted}; margin: 0; line-height: 1.4;">
            ${esc(label)} &bull; Soluções Tecnológicas &amp; Equipamentos
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>`
}

function renderHeroCover(
  coverImage: string,
  coverAlt: string,
  title: string,
  subtitle: string,
  base: string
): string {
  const waHref = waLink(subtitle ? `Olá J.Matos Tecnologia! ${subtitle}` : undefined)

  return `
<!-- Imagem de Capa (Hero) -->
<tr>
  <td style="padding: 0; background-color: ${BRAND.bgDark}; line-height: 0;">
    <a href="${LINKS.loja}" target="_blank" style="display:block;text-decoration:none;">
      <img src="${coverImage}" alt="${esc(coverAlt)}" width="${LAYOUT.maxWidth}" style="display: block; width: 100%; max-width: ${LAYOUT.maxWidth}px; height: auto; border: 0; outline: none;" />
    </a>
  </td>
</tr>
${
  title
    ? `<tr>
  <td style="background-color: ${BRAND.bgDark}; padding: 22px ${LAYOUT.sidePadding}px 24px ${LAYOUT.sidePadding}px; text-align: center;">
    <h2 style="font-family: ${FONTS.heading}; font-size: 19px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #ffffff; margin: 0 0 6px 0; line-height: 1.3;">
      ${esc(title)}
    </h2>
    ${
      subtitle
        ? `<p style="font-family: ${FONTS.body}; font-size: 13px; color: #94a3b8; margin: 0 0 16px 0; line-height: 1.5;">${esc(subtitle)}</p>`
        : '<div style="height:10px;"></div>'
    }
    <a href="${waHref}" target="_blank" style="display: inline-block; font-family: ${FONTS.heading}; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #ffffff; text-decoration: none; background-color: ${BRAND.primary}; border-radius: 50px; padding: 10px 26px;">
      Saber Mais &bull; WhatsApp
    </a>
  </td>
</tr>`
    : ''
}`
}

function renderBodyContent(html: string): string {
  return `
<!-- Conteúdo Principal -->
<tr>
  <td style="background-color: #ffffff; padding: 28px ${LAYOUT.sidePadding}px 24px ${LAYOUT.sidePadding}px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="font-family: ${FONTS.body}; font-size: 14px; color: ${BRAND.textDark}; line-height: 1.75;">
          ${html}
        </td>
      </tr>
    </table>
  </td>
</tr>`
}

function renderSingleProduct(prod: EditorialProduct, base: string): string {
  const absImage = toAbsolute(prod.image, base)
  const alt = esc(prod.imageAlt || prod.name)
  const link = productUrl(prod, base)
  const price = formatPrice(prod.price)

  return `
<!--[if (gte mso 9)|(IE)]>
<td width="176" valign="top" style="padding: 0 6px;">
<![endif]-->
<div class="product-col" style="display: inline-block; vertical-align: top; width: 100%; max-width: 172px; margin: 0 4px 16px 4px; text-align: left; box-sizing: border-box;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid ${BRAND.border}; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 6px rgba(15,23,42,0.04);">
    <!-- Foto Retangular Contida (Sem Cortes) -->
    <tr>
      <td align="center" valign="middle" style="background-color: #f8fafc; padding: 14px 10px; height: 120px; border-bottom: 1px solid ${BRAND.borderLight};">
        <a href="${link}" target="_blank" style="text-decoration: none; display: block;">
          <img src="${absImage}" alt="${alt}" class="product-img" width="150" style="display: block; max-height: 110px; max-width: 150px; width: auto; height: auto; object-fit: contain; margin: 0 auto; border: 0;" />
        </a>
      </td>
    </tr>
    <!-- Detalhes do Produto -->
    <tr>
      <td style="padding: 12px 10px 14px 10px;">
        <h4 style="margin: 0 0 6px 0; font-family: ${FONTS.heading}; font-size: 11px; font-weight: 700; color: ${BRAND.textDark}; line-height: 1.35; min-height: 30px; overflow: hidden; text-transform: uppercase;">
          <a href="${link}" target="_blank" style="color: ${BRAND.textDark}; text-decoration: none;">
            ${esc(prod.name)}
          </a>
        </h4>
        <div style="margin-bottom: 10px;">
          <span style="font-family: ${FONTS.heading}; font-size: 14px; font-weight: 900; color: ${BRAND.primary}; display: block;">
            ${price}
          </span>
        </div>
        <a href="${link}" target="_blank" style="display: block; text-align: center; background-color: ${BRAND.primary}; color: #ffffff !important; font-family: ${FONTS.heading}; font-size: 10px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; text-decoration: none !important; padding: 8px 6px; border-radius: 6px;">
          Ver na Loja
        </a>
      </td>
    </tr>
  </table>
</div>
<!--[if (gte mso 9)|(IE)]>
</td>
<![endif]-->`
}

function renderFeaturedProducts(products: EditorialProduct[], base: string, isPreview: boolean): string {
  const valid = products.filter((p) => p && (p.name?.trim() || p.image?.trim()))

  if (valid.length === 0) {
    if (!isPreview) return ''
    return `
<!-- Secção Vazia Informativa para Preview -->
<tr>
  <td style="background-color: ${BRAND.bgLight}; padding: 20px ${LAYOUT.sidePadding}px; border-top: 1px solid ${BRAND.border};">
    <div style="background-color: #ffffff; border: 1px dashed ${BRAND.border}; border-radius: 10px; padding: 24px; text-align: center;">
      <p style="font-family: ${FONTS.heading}; font-size: 12px; font-weight: 700; color: ${BRAND.textMuted}; margin: 0 0 4px 0;">Produtos Mais Pedidos</p>
      <p style="font-family: ${FONTS.body}; font-size: 11px; color: ${BRAND.textFaded}; margin: 0;">Selecione até 3 produtos no editor para exibi-los aqui.</p>
    </div>
  </td>
</tr>`
  }

  const cardsHtml = valid.slice(0, 3).map((p) => renderSingleProduct(p, base)).join('')

  return `
<!-- Secção: Produtos Mais Pedidos (Responsiva) -->
<tr>
  <td style="background-color: ${BRAND.bgLight}; padding: 28px ${LAYOUT.sidePadding}px 14px ${LAYOUT.sidePadding}px; border-top: 1px solid ${BRAND.border};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding-bottom: 20px;">
          <span style="font-family: ${FONTS.heading}; font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: ${BRAND.primary}; display: block; margin-bottom: 4px;">
            EQUIPAMENTOS EM DESTAQUE
          </span>
          <h3 style="font-family: ${FONTS.heading}; font-size: 20px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; color: ${BRAND.textDark}; margin: 0 0 4px 0;">
            PRODUTOS MAIS PEDIDOS
          </h3>
          <p style="font-family: ${FONTS.body}; font-size: 12px; color: ${BRAND.textMuted}; margin: 0;">
            Disponíveis para entrega imediata em Luanda
          </p>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 0;">
          <!--[if (gte mso 9)|(IE)]>
          <table role="presentation" width="536" cellpadding="0" cellspacing="0" border="0" align="center"><tr>
          <![endif]-->
          ${cardsHtml}
          <!--[if (gte mso 9)|(IE)]>
          </tr></table>
          <![endif]-->
        </td>
      </tr>
    </table>
  </td>
</tr>`
}

function renderWhatsAppButton(): string {
  const href = waLink()

  return `
<!-- Botão WhatsApp de Alta Visibilidade -->
<tr>
  <td align="center" style="background-color: ${BRAND.bgLight}; padding: 6px ${LAYOUT.sidePadding}px 32px ${LAYOUT.sidePadding}px;">
    <a href="${href}" target="_blank" style="display: inline-block; background-color: ${BRAND.whatsappGreen}; color: #ffffff !important; font-family: ${FONTS.heading}; font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; text-decoration: none !important; border-radius: 50px; padding: 14px 34px; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.35);">
      Falar com a J.Matos no WhatsApp
    </a>
  </td>
</tr>`
}

function renderFooter(base: string, unsubEmail: string): string {
  const logoUrl = toAbsolute(ASSETS.logo, base)
  const fbIcon = toAbsolute(ASSETS.socialFacebook, base)
  const igIcon = toAbsolute(ASSETS.socialInstagram, base)
  const inIcon = toAbsolute(ASSETS.socialLinkedin, base)
  const waIcon = toAbsolute(ASSETS.socialWhatsapp, base)

  return `
<!-- Rodapé Corporativo J.Matos Tecnologia (Dark Navy Slate) -->
<tr>
  <td style="background-color: ${BRAND.bgDark}; padding: 36px ${LAYOUT.sidePadding}px 32px ${LAYOUT.sidePadding}px; border-top: 1px solid ${BRAND.borderDark}; text-align: center;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 540px; margin: 0 auto;">
      
      <!-- Logo J.Matos Tecnologia (centrada, fundo branco para contraste) -->
      <tr>
        <td align="center" style="padding-bottom: 8px;">
          <a href="${base}/loja" target="_blank" style="text-decoration: none; display: inline-block;">
            <div style="display: inline-block; background-color: #ffffff; border-radius: 10px; padding: 10px 20px;">
              <img src="${logoUrl}" alt="J.Matos Tecnologia" height="36" style="display:block;height:36px;max-height:36px;width:auto;border:0;outline:none;" />
            </div>
          </a>
        </td>
      </tr>

      <!-- Slogan -->
      <tr>
        <td align="center" style="padding-bottom: 20px;">
          <span style="font-family: ${FONTS.heading}; font-size: 13px; font-weight: 500; color: #94a3b8; letter-spacing: 0.3px;">
            Soluções Tecnológicas para a sua Empresa e Dia a Dia
          </span>
        </td>
      </tr>

      <!-- Redes Sociais — Ícones circulares limpos -->
      <tr>
        <td align="center" style="padding-bottom: 22px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
            <tr>
              <!-- Facebook -->
              <td style="padding: 0 5px;">
                <a href="${SOCIAL.facebook}" target="_blank" title="Facebook" style="text-decoration: none !important;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" valign="middle" style="width: 38px; height: 38px; background-color: #1e293b; border-radius: 50%; padding: 9px;">
                        <img src="${fbIcon}" alt="Facebook" width="20" height="20" style="display: block; width: 20px; height: 20px; border: 0; outline: none;" />
                      </td>
                    </tr>
                  </table>
                </a>
              </td>
              <!-- Instagram -->
              <td style="padding: 0 5px;">
                <a href="${SOCIAL.instagram}" target="_blank" title="Instagram" style="text-decoration: none !important;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" valign="middle" style="width: 38px; height: 38px; background-color: #1e293b; border-radius: 50%; padding: 9px;">
                        <img src="${igIcon}" alt="Instagram" width="20" height="20" style="display: block; width: 20px; height: 20px; border: 0; outline: none;" />
                      </td>
                    </tr>
                  </table>
                </a>
              </td>
              <!-- LinkedIn -->
              <td style="padding: 0 5px;">
                <a href="${SOCIAL.linkedin}" target="_blank" title="LinkedIn" style="text-decoration: none !important;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" valign="middle" style="width: 38px; height: 38px; background-color: #1e293b; border-radius: 50%; padding: 9px;">
                        <img src="${inIcon}" alt="LinkedIn" width="20" height="20" style="display: block; width: 20px; height: 20px; border: 0; outline: none;" />
                      </td>
                    </tr>
                  </table>
                </a>
              </td>
              <!-- WhatsApp -->
              <td style="padding: 0 5px;">
                <a href="${waLink()}" target="_blank" title="WhatsApp" style="text-decoration: none !important;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" valign="middle" style="width: 38px; height: 38px; background-color: #1e293b; border-radius: 50%; padding: 9px;">
                        <img src="${waIcon}" alt="WhatsApp" width="20" height="20" style="display: block; width: 20px; height: 20px; border: 0; outline: none;" />
                      </td>
                    </tr>
                  </table>
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Contactos Diretos -->
      <tr>
        <td align="center" style="padding-bottom: 18px; border-top: 1px solid #1e293b; padding-top: 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
            <tr>
              <td align="center" style="padding: 0 6px;">
                <span style="font-family: ${FONTS.body}; font-size: 12px; color: #94a3b8; line-height: 1.6;">Tel: <strong style="color: #cbd5e1;">${CONTACTS.phone}</strong></span>
              </td>
              <td style="color: #334155; font-size: 11px;">|</td>
              <td align="center" style="padding: 0 6px;">
                <span style="font-family: ${FONTS.body}; font-size: 12px; color: #94a3b8; line-height: 1.6;">Email: <strong style="color: #cbd5e1;">${CONTACTS.email}</strong></span>
              </td>
              <td style="color: #334155; font-size: 11px;">|</td>
              <td align="center" style="padding: 0 6px;">
                <span style="font-family: ${FONTS.body}; font-size: 12px; color: #94a3b8; line-height: 1.6;"><strong style="color: #cbd5e1;">${CONTACTS.address}</strong></span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Links Rápidos -->
      <tr>
        <td align="center" style="padding-bottom: 18px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
            <tr>
              <td style="padding: 0 8px;">
                <a href="${LINKS.loja}" target="_blank" style="font-family: ${FONTS.heading}; font-size: 11px; font-weight: 700; color: ${BRAND.accentCyan}; text-decoration: none;">
                  Loja Online
                </a>
              </td>
              <td style="color: #334155; font-size: 11px;">&bull;</td>
              <td style="padding: 0 8px;">
                <a href="${LINKS.servicos}" target="_blank" style="font-family: ${FONTS.heading}; font-size: 11px; font-weight: 700; color: ${BRAND.accentCyan}; text-decoration: none;">
                  Serviços
                </a>
              </td>
              <td style="color: #334155; font-size: 11px;">&bull;</td>
              <td style="padding: 0 8px;">
                <a href="${LINKS.site}" target="_blank" style="font-family: ${FONTS.heading}; font-size: 11px; font-weight: 700; color: ${BRAND.accentCyan}; text-decoration: none;">
                  Website Oficial
                </a>
              </td>
              <td style="color: #334155; font-size: 11px;">&bull;</td>
              <td style="padding: 0 8px;">
                <a href="${LINKS.contactos}" target="_blank" style="font-family: ${FONTS.heading}; font-size: 11px; font-weight: 700; color: ${BRAND.accentCyan}; text-decoration: none;">
                  Contactos
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Aviso Legal e Cancelar Subscrição -->
      <tr>
        <td align="center">
          <p style="font-family: ${FONTS.body}; font-size: 11px; color: #64748b; margin: 0 0 6px 0; line-height: 1.5;">
            &copy; 2026 J.Matos Tecnologia · Soluções Tecnológicas (Grupo ARKNET). Todos os direitos reservados.
          </p>
          <p style="font-family: ${FONTS.body}; font-size: 10px; color: #64748b; margin: 0; line-height: 1.5;">
            Recebeu este e-mail porque subscreveu as novidades da loja oficial J.Matos Tecnologia.<br />
            <a href="mailto:${unsubEmail}?subject=Cancelar%20Subscricao%20Newsletter&amp;body=Pretendo%20cancelar%20a%20minha%20subscricao%20da%20newsletter%20J.Matos." style="color: #94a3b8; text-decoration: underline;">
              Cancelar subscrição
            </a>
          </p>
        </td>
      </tr>

    </table>
  </td>
</tr>`
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
  const coverTitle = options.coverTitle || ''
  const coverSubtitle = options.coverSubtitle || ''

  // Imports de fontes
  const fontLinks = FONT_IMPORTS.map((u) => `<link href="${u}" rel="stylesheet" />`).join('\n    ')

  // Hero
  const heroHtml = absCover ? renderHeroCover(absCover, coverAlt, coverTitle, coverSubtitle, base) : ''

  // Corpo
  const bodyHtml = options.htmlBody?.trim() ? renderBodyContent(options.htmlBody) : ''

  // Produtos (Sem cortes circulares, retangulares e responsivos)
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
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
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
      body { margin: 0; padding: 0; width: 100% !important; background-color: ${BRAND.bgOuter}; }

      h1, h2, h3, h4, p, ul, ol { margin-top: 0; }
      h2 { font-size: 17px !important; font-weight: 800 !important; color: ${BRAND.textDark} !important; margin: 20px 0 10px 0 !important; border-left: 3px solid ${BRAND.primary} !important; padding-left: 10px !important; }
      p { margin-bottom: 14px !important; font-size: 14px !important; color: ${BRAND.textDark} !important; line-height: 1.7 !important; }
      ul, ol { margin-bottom: 16px !important; padding-left: 20px !important; color: ${BRAND.textDark} !important; }
      li { margin-bottom: 6px !important; line-height: 1.6 !important; font-size: 14px !important; }
      a { color: ${BRAND.primary} !important; text-decoration: underline !important; font-weight: 600 !important; }

      /* Responsivo Mobile */
      @media only screen and (max-width: 620px) {
        .email-container { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; }
        .hide-mobile { display: none !important; }
        .product-col {
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 auto 16px auto !important;
        }
        .product-img {
          max-height: 180px !important;
          max-width: 80% !important;
        }

      }
    </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bgOuter};font-family:${FONTS.body};">
  ${renderPreheader(preheader)}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND.bgOuter}; padding: 24px 8px;">
    <tr>
      <td align="center">
        <!-- Container Central da Newsletter -->
        <table role="presentation" class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: ${LAYOUT.maxWidth}px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 15px 35px rgba(0, 0, 0, 0.45);">
          ${renderHeader(base, editionLabel)}
          ${renderEditorialTitle(editionLabel)}
          ${heroHtml}
          ${bodyHtml}
          ${productsHtml}
          ${renderWhatsAppButton()}
          ${renderFooter(base, unsubEmail)}
        </table>
      </td>
    </tr>
  </table>

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
      '\n\nPRODUTOS EM DESTAQUE:\n' +
      options.featuredProducts
        .map((p) => `  - ${p.name}: ${formatPrice(p.price)} -> ${productUrl(p, base)}`)
        .join('\n')
  }

  return [
    'J.MATOS TECNOLOGIA - NEWSLETTER',
    '='.repeat(40),
    options.subject,
    '='.repeat(40),
    '',
    text,
    productsText,
    '',
    '-'.repeat(40),
    `Loja Online: ${base}/loja`,
    `Website: ${base}`,
    `WhatsApp: https://wa.me/${WHATSAPP.number}`,
    `Telefone: ${CONTACTS.phone}`,
    '',
    'Para cancelar a subscrição, responda a este e-mail.',
    'J.Matos Tecnologia · Soluções Tecnológicas (Grupo ARKNET) · Angola',
  ].join('\n')
}

export const generateEditorialNewsletterHtml = generateEditorialHtml
