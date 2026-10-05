import {
  generateEditorialNewsletterHtml,
  generateEditorialPlainText,
  EditorialProduct,
  EditorialPromo,
  EditorialTemplateOptions,
} from './email/editorial-template'
import { BRAND, FONTS, LINKS, WHATSAPP, SOCIAL } from './email/brand'

export {
  generateEditorialNewsletterHtml,
  generateEditorialPlainText,
  BRAND,
  FONTS,
  LINKS,
  WHATSAPP,
  SOCIAL,
}
export type { EditorialProduct, EditorialPromo, EditorialTemplateOptions }

export interface ProductBlockData {
  id?: string
  name: string
  price?: number | null
  image: string
  imageAlt?: string
  slug?: string
  description?: string
  whatsappPhone?: string
}

export interface ImageBlockData {
  url: string
  alt: string
  caption?: string
  linkUrl?: string
}

export interface EditorialPromoData {
  kitName: string
  discountPercent: number
  promoCode: string
  linkUrl?: string
}

export interface NewsletterTemplateOptions {
  subject: string
  htmlBody: string
  templateType?: 'editorial' | 'classic'
  editionLabel?: string
  preheader?: string
  coverImage?: string | null
  coverImageAlt?: string | null
  coverTitle?: string
  coverSubtitle?: string
  offerBannerImage?: string | null
  offerBannerAlt?: string | null
  offerBannerLink?: string | null
  promo?: EditorialPromoData | null
  featuredProducts?: ProductBlockData[] | null
  siteUrl?: string
  whatsappNumber?: string
  unsubscribeEmail?: string
  isPreview?: boolean
}

/**
 * Retorna a URL base do site absoluta
 */
export function getBaseSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
  if (envUrl && envUrl.trim()) {
    return envUrl.replace(/\/$/, '')
  }
  return 'https://arknet.co.ao'
}

/**
 * Converte caminhos relativos (/uploads/...) em URLs absolutas
 */
export function toAbsoluteUrl(url: string | null | undefined, baseUrl: string = getBaseSiteUrl()): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('cid:')) {
    return trimmed
  }
  const cleanBase = baseUrl.replace(/\/$/, '')
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return `${cleanBase}${cleanPath}`
}

/**
 * Formata valor em Kwanzas (AOA / Kz)
 */
export function formatCurrencyAOA(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'Sob consulta'
  }
  return (
    new Intl.NumberFormat('pt-AO', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + ' Kz'
  )
}

/**
 * Sanitiza HTML básico para newsletter, removendo scripts e atributos perigosos
 */
export function sanitizeNewsletterHtml(rawHtml: string): string {
  if (!rawHtml) return ''

  let clean = rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/href\s*=\s*(['"])javascript:[^'"]*\1/gi, 'href="#"')

  return clean
}

/**
 * Transforma todas as imagens e links com caminhos relativos em URLs absolutas dentro do HTML
 */
export function makeHtmlUrlsAbsolute(html: string, baseUrl: string = getBaseSiteUrl()): string {
  if (!html) return ''

  return html
    .replace(/src=(["'])(.*?)\1/gi, (match, quote, src) => {
      if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:') || src.startsWith('cid:')) {
        return match
      }
      return `src=${quote}${toAbsoluteUrl(src, baseUrl)}${quote}`
    })
    .replace(/href=(["'])(.*?)\1/gi, (match, quote, href) => {
      if (
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#')
      ) {
        return match
      }
      return `href=${quote}${toAbsoluteUrl(href, baseUrl)}${quote}`
    })
}

/**
 * Gera bloco HTML de imagem responsiva
 */
export function buildImageBlockHtml(data: ImageBlockData, baseUrl: string = getBaseSiteUrl()): string {
  const absUrl = toAbsoluteUrl(data.url, baseUrl)
  const altText = data.alt ? data.alt.replace(/"/g, '&quot;') : 'Fotografia ARKNET'
  const captionHtml = data.caption
    ? `<div style="margin: 8px auto 0 auto; max-width: 500px; font-size: 12px; color: #64748b; text-align: center; line-height: 1.4;">${data.caption}</div>`
    : ''

  const imgTag = `<img src="${absUrl}" alt="${altText}" width="536" style="display: block; width: 100%; max-width: 536px; height: auto; border: 0; outline: none; border-radius: 8px; border: 1px solid #e2e8f0;" />`

  const content = data.linkUrl
    ? `<a href="${toAbsoluteUrl(data.linkUrl, baseUrl)}" target="_blank" style="text-decoration: none; display: block;">${imgTag}</a>`
    : imgTag

  return `
<!-- Bloco de Imagem -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 22px 0;">
  <tr>
    <td align="center" style="padding: 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="max-width: 536px; width: 100%;">
        <tr>
          <td align="center">
            ${content}
            ${captionHtml}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`
}

/**
 * Gera bloco HTML individual de produto com foco na loja
 */
export function buildProductBlockHtml(product: ProductBlockData, baseUrl: string = getBaseSiteUrl()): string {
  const absImage = toAbsoluteUrl(product.image, baseUrl)
  const altText = (product.imageAlt || product.name || 'Produto ARKNET').replace(/"/g, '&quot;')
  const productUrl = product.slug
    ? `${baseUrl}/loja/${product.slug}`
    : product.id
    ? `${baseUrl}/loja?id=${product.id}`
    : `${baseUrl}/loja`

  const priceText = formatCurrencyAOA(product.price)
  const rawPhone = (product.whatsappPhone || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+244923000000').replace(/[^0-9]/g, '')
  const whatsappMsg = encodeURIComponent(`Olá ARKNET! Vi o produto "${product.name}" na newsletter e gostaria de encomendar.`)
  const whatsappUrl = `https://wa.me/${rawPhone}?text=${whatsappMsg}`

  return `
<!-- Bloco de Produto ARKNET -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 18px 0; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
  <tr>
    <td style="padding: 16px; background-color: #f8fafc; border-bottom: 1px solid #f1f5f9;" align="center">
      <a href="${productUrl}" target="_blank" style="text-decoration: none; display: block;">
        <img src="${absImage}" alt="${altText}" width="220" height="160" style="display: block; width: 100%; max-width: 220px; height: auto; max-height: 170px; object-fit: contain; margin: 0 auto; border: 0;" />
      </a>
    </td>
  </tr>
  <tr>
    <td style="padding: 16px 18px 18px 18px; background-color: #ffffff;">
      <h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 800; color: #0f172a; line-height: 1.35;">
        <a href="${productUrl}" target="_blank" style="color: #0f172a; text-decoration: none;">
          ${product.name}
        </a>
      </h3>

      ${
        product.description
          ? `<p style="margin: 0 0 12px 0; font-size: 12px; color: #64748b; line-height: 1.5;">${product.description}</p>`
          : '<div style="height: 4px;"></div>'
      }

      <div style="margin-bottom: 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px;">
        <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; display: block;">Preço:</span>
        <span style="font-size: 17px; font-weight: 900; color: #0284c7;">${priceText}</span>
      </div>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="left" style="padding-right: 4px; width: 50%;">
            <a href="${productUrl}" target="_blank" style="display: block; text-align: center; background-color: #0f172a; color: #ffffff !important; font-size: 11px; font-weight: 700; text-decoration: none !important; padding: 10px 10px; border-radius: 6px;">
              Ver na Loja
            </a>
          </td>
          <td align="right" style="padding-left: 4px; width: 50%;">
            <a href="${whatsappUrl}" target="_blank" style="display: block; text-align: center; background-color: #16a34a; color: #ffffff !important; font-size: 11px; font-weight: 700; text-decoration: none !important; padding: 10px 10px; border-radius: 6px;">
              WhatsApp
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`
}

/**
 * Gera bloco dos 3 Produtos "Mais Pedidos" da Loja ARKNET
 */
export function buildFeaturedProductsSectionHtml(
  products: ProductBlockData[] | null | undefined,
  baseUrl: string = getBaseSiteUrl(),
  isPreview: boolean = false
): string {
  const validProducts = (products || []).filter((p) => p && (p.name?.trim() || p.image?.trim()))

  if (validProducts.length === 0) {
    if (!isPreview) return ''
    // Exemplo de pré-visualização quando vazio
    return `
<!-- Bloco de Exemplo de Produtos (Apenas Pré-visualização) -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0 20px 0; border-top: 1px solid #e2e8f0; padding-top: 24px;">
  <tr>
    <td style="padding-bottom: 14px;">
      <h2 style="font-size: 17px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">
        PRODUTOS MAIS PEDIDOS DA LOJA
      </h2>
      <p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0;">
        (Espaço configurável no editor com até 3 produtos da loja)
      </p>
    </td>
  </tr>
  <tr>
    <td>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; padding: 24px; text-align: center;">
        <tr>
          <td>
            <p style="font-size: 13px; font-weight: 700; color: #64748b; margin: 0 0 4px 0;">Nenhum produto selecionado no momento</p>
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">Carregue as fotos e nomes dos 3 produtos no painel de administração para exibi-los aqui.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`
  }

  const productCardsHtml = validProducts.slice(0, 3).map((prod) => buildProductBlockHtml(prod, baseUrl)).join('')

  return `
<!-- Secção: Os 3 Produtos Mais Pedidos -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0 16px 0; border-top: 1px solid #e2e8f0; padding-top: 24px;">
  <tr>
    <td style="padding-bottom: 10px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <h2 style="font-size: 17px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">
              PRODUTOS MAIS PEDIDOS
            </h2>
            <p style="font-size: 12px; color: #64748b; margin: 3px 0 0 0;">
              Equipamentos com entrega imediata em Luanda
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td>
      ${productCardsHtml}
    </td>
  </tr>
</table>
`
}

/**
 * Gera o template HTML clássico da Newsletter (versão corporativa anterior)
 */
export function generateClassicNewsletterHtml(options: NewsletterTemplateOptions): string {
  const baseUrl = options.siteUrl || getBaseSiteUrl()
  const sanitizedBody = sanitizeNewsletterHtml(options.htmlBody)
  const processedBody = makeHtmlUrlsAbsolute(sanitizedBody, baseUrl)
  const absCoverImage = options.coverImage ? toAbsoluteUrl(options.coverImage, baseUrl) : null
  const coverAlt = (options.coverImageAlt || options.subject || 'Capa ARKNET Newsletter').replace(/"/g, '&quot;')
  
  const absOfferBanner = options.offerBannerImage ? toAbsoluteUrl(options.offerBannerImage, baseUrl) : null
  const offerAlt = (options.offerBannerAlt || 'Banner de Oferta ARKNET').replace(/"/g, '&quot;')
  const offerLink = options.offerBannerLink ? toAbsoluteUrl(options.offerBannerLink, baseUrl) : `${baseUrl}/loja`

  const unsubscribeEmail = options.unsubscribeEmail || process.env.SMTP_USER || 'arknet40@gmail.com'

  const currentDate = new Date().toLocaleDateString('pt-PT', {
    month: 'long',
    year: 'numeric',
  })

  // Bloco dos 3 Produtos
  const featuredProductsHtml = buildFeaturedProductsSectionHtml(options.featuredProducts, baseUrl, options.isPreview)

  // Banner de Oferta
  let offerBannerHtml = ''
  if (absOfferBanner) {
    offerBannerHtml = `
<!-- Banner de Oferta Especial -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0 16px 0;">
  <tr>
    <td align="center" style="padding: 0;">
      <a href="${offerLink}" target="_blank" style="text-decoration: none; display: block;">
        <img src="${absOfferBanner}" alt="${offerAlt}" width="536" style="display: block; width: 100%; max-width: 536px; height: auto; border: 0; outline: none; border-radius: 8px; border: 1px solid #e2e8f0;" />
      </a>
    </td>
  </tr>
</table>
`
  } else if (options.isPreview && !options.htmlBody?.includes('<img')) {
    // Apenas informativo na pré-visualização se o admin quiser ver onde ficaria
    offerBannerHtml = ''
  }

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="pt">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${options.subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #0b1329; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    
    h1, h2, h3, h4, p, ul, ol { margin-top: 0; }
    h2 { font-size: 18px !important; font-weight: 800 !important; color: #0f172a !important; margin: 22px 0 10px 0 !important; border-left: 3px solid #0284c7 !important; padding-left: 10px !important; }
    p { margin-bottom: 14px !important; font-size: 15px !important; color: #334155 !important; line-height: 1.7 !important; }
    ul, ol { margin-bottom: 16px !important; padding-left: 22px !important; color: #334155 !important; }
    li { margin-bottom: 6px !important; line-height: 1.6 !important; font-size: 14px !important; }
    a { color: #0284c7 !important; text-decoration: underline !important; font-weight: 600 !important; }
    blockquote { margin: 16px 0 !important; padding: 10px 16px !important; background: #f8fafc !important; border-left: 3px solid #0284c7 !important; font-style: italic !important; color: #475569 !important; border-radius: 0 6px 6px 0 !important; }
    hr { border: none !important; border-top: 1px solid #e2e8f0 !important; margin: 24px 0 !important; }

    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; }
      .fluid-img { width: 100% !important; max-width: 100% !important; height: auto !important; }
      .mobile-padding { padding-left: 18px !important; padding-right: 18px !important; }
      .mobile-center { text-align: center !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1329; color: #1e293b; -webkit-font-smoothing: antialiased; line-height: 1.6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0b1329; padding: 32px 8px;">
    <tr>
      <td align="center">
        <!-- Container Principal -->
        <table role="presentation" class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 15px 35px rgba(0, 0, 0, 0.35);">
          
          <!-- Linha Superior de Acento Azul -->
          <tr>
            <td style="height: 3px; background-color: #0284c7; line-height: 3px; font-size: 1px;">
              &nbsp;
            </td>
          </tr>

          <!-- Header Corporativo ARKNET -->
          <tr>
            <td style="padding: 28px 32px 24px 32px; background-color: #0f172a; text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <span style="font-size: 28px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">
                      ARKNET<span style="color: #38bdf8;">.</span>
                    </span>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 4px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">
                      Loja Online & Tecnologia · Angola
                    </div>
                    <div style="display: inline-block; margin-top: 10px; background-color: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.25); padding: 4px 14px; border-radius: 999px; font-size: 11px; color: #38bdf8; font-weight: 600;">
                      Edição · ${currentDate}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${
            absCoverImage
              ? `<!-- Imagem de Capa / Banner -->
          <tr>
            <td style="padding: 0; background-color: #0f172a; line-height: 0;">
              <img src="${absCoverImage}" alt="${coverAlt}" width="600" class="fluid-img" style="display: block; width: 100%; max-width: 600px; height: auto; max-height: 340px; object-fit: cover; border: 0;" />
            </td>
          </tr>`
              : options.isPreview
              ? `<!-- Placeholder de Capa (Pré-visualização) -->
          <tr>
            <td style="padding: 36px 20px; background-color: #1e293b; text-align: center; color: #94a3b8;">
              <p style="margin: 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                Espaço para Imagem de Capa (Opcional)
              </p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">
                Recomendado: 1200 x 600 px (apenas visível se carregada uma imagem)
              </p>
            </td>
          </tr>`
              : ''
          }

          <!-- Assunto da Mensagem -->
          <tr>
            <td class="mobile-padding" style="padding: 28px 32px 16px 32px; border-bottom: 1px solid #f1f5f9; background-color: #ffffff;">
              <h1 style="font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; line-height: 1.35; letter-spacing: -0.3px;">
                ${options.subject}
              </h1>
            </td>
          </tr>

          <!-- Corpo Principal da Newsletter -->
          <tr>
            <td class="mobile-padding" style="padding: 22px 32px 24px 32px; background-color: #ffffff;">
              <div style="font-size: 15px; color: #334155; line-height: 1.7;">
                ${processedBody}
              </div>

              ${offerBannerHtml}

              ${featuredProductsHtml}
            </td>
          </tr>

          <!-- Botao Principal de Acesso a Loja / Portal Geral -->
          <tr>
            <td class="mobile-padding" style="padding: 8px 32px 32px 32px; background-color: #ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="${baseUrl}/loja" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff !important; font-size: 13px; font-weight: 800; text-decoration: none !important; padding: 14px 34px; border-radius: 8px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);">
                      Ver Catálogo Completo na Loja ARKNET
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Rodapé Corporativo ARKNET -->
          <tr>
            <td class="mobile-padding" style="padding: 26px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <div style="font-size: 14px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin-bottom: 4px;">
                ARKNET Angola
              </div>
              <p style="font-size: 11px; color: #64748b; margin: 0 0 14px 0; line-height: 1.5;">
                Equipamentos de Rede, Informática e Tecnologia · Luanda, Angola
              </p>

              <!-- Links Rápidos -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 16px auto;">
                <tr>
                  <td align="center" style="font-size: 12px;">
                    <a href="${baseUrl}/loja" style="color: #0284c7 !important; text-decoration: none !important; font-weight: 700; padding: 0 8px;">Loja Online</a>
                    <span style="color: #cbd5e1;">|</span>
                    <a href="${baseUrl}" style="color: #0284c7 !important; text-decoration: none !important; font-weight: 700; padding: 0 8px;">Website Oficial</a>
                    <span style="color: #cbd5e1;">|</span>
                    <a href="${baseUrl}/contactos" style="color: #0284c7 !important; text-decoration: none !important; font-weight: 700; padding: 0 8px;">Contactos</a>
                  </td>
                </tr>
              </table>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0 14px 0;" />

              <p style="font-size: 10px; color: #94a3b8; margin: 0; line-height: 1.6;">
                Recebeu este e-mail porque subscreveu as novidades no portal ARKNET.
                <br />
                Para deixar de receber novidades da loja, 
                <a href="mailto:${unsubscribeEmail}?subject=Cancelar%20Subscricao%20Newsletter&body=Pretendo%20cancelar%20a%20minha%20subscricao%20da%20newsletter%20ARKNET." style="color: #64748b !important; text-decoration: underline !important;">
                  cancele a subscrição aqui
                </a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Converte o HTML clássico para texto simples limpo
 */
export function generateClassicNewsletterPlainText(
  subject: string,
  htmlBody: string,
  baseUrl: string = getBaseSiteUrl(),
  featuredProducts?: ProductBlockData[] | null
): string {
  const textContent = htmlBody
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
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  let productsText = ''
  if (featuredProducts && featuredProducts.length > 0) {
    productsText = '\n\nPRODUTOS EM DESTAQUE:\n' + featuredProducts.map((p) => `- ${p.name}: ${formatCurrencyAOA(p.price)}`).join('\n')
  }

  return `ARKNET NEWSLETTER\n================================\n${subject}\n================================\n\n${textContent}${productsText}\n\n--------------------------------\nLoja ARKNET: ${baseUrl}/loja\nWebsite: ${baseUrl}\nPara cancelar a subscrição, responda a este e-mail solicitando a remoção.\nARKNET Angola · Luanda`
}

/**
 * Função principal que gera o HTML da Newsletter ARKNET.
 * Por defeito, gera o novo Template Editorial moderno com fotos circulares e paleta da marca.
 * Se options.templateType === 'classic', gera o formato corporativo anterior.
 */
export function generateFullNewsletterHtml(options: NewsletterTemplateOptions): string {
  if (options.templateType === 'classic') {
    return generateClassicNewsletterHtml(options)
  }

  // Converter ProductBlockData em EditorialProduct
  const editorialProducts: EditorialProduct[] | null = options.featuredProducts
    ? options.featuredProducts.map((p) => ({
        name: p.name,
        price: p.price,
        image: p.image,
        imageAlt: p.imageAlt,
        slug: p.slug,
        description: p.description,
      }))
    : null

  return generateEditorialNewsletterHtml({
    subject: options.subject,
    preheader: options.preheader,
    editionLabel: options.editionLabel,
    htmlBody: options.htmlBody,
    coverImage: options.coverImage,
    coverImageAlt: options.coverImageAlt,
    coverTitle: options.coverTitle,
    coverSubtitle: options.coverSubtitle,
    offerBannerImage: options.offerBannerImage,
    offerBannerAlt: options.offerBannerAlt,
    offerBannerLink: options.offerBannerLink,
    promo: options.promo,
    featuredProducts: editorialProducts,
    siteUrl: options.siteUrl,
    unsubscribeEmail: options.unsubscribeEmail,
    isPreview: options.isPreview,
  })
}

/**
 * Função principal para gerar a versão de texto simples da newsletter
 */
export function generateNewsletterPlainText(
  subject: string,
  htmlBody: string,
  baseUrl: string = getBaseSiteUrl(),
  featuredProducts?: ProductBlockData[] | null,
  templateType?: 'editorial' | 'classic',
  promo?: EditorialPromoData | null
): string {
  if (templateType === 'classic') {
    return generateClassicNewsletterPlainText(subject, htmlBody, baseUrl, featuredProducts)
  }

  const editorialProducts: EditorialProduct[] | null = featuredProducts
    ? featuredProducts.map((p) => ({
        name: p.name,
        price: p.price,
        image: p.image,
        imageAlt: p.imageAlt,
        slug: p.slug,
        description: p.description,
      }))
    : null

  return generateEditorialPlainText({
    subject,
    htmlBody,
    siteUrl: baseUrl,
    featuredProducts: editorialProducts,
    promo,
  })
}
