import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionToken } from '@/lib/edge-auth'

/**
 * Middleware de Segurança Global ARKNET
 * Aplica cabeçalhos HTTP de segurança estritos e verifica a autenticação para rotas protegidas.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // 1. Configurar Cabeçalhos HTTP de Segurança
  response.headers.set('X-Frame-Options', 'DENY') // Previne ataques de Clickjacking
  response.headers.set('X-Content-Type-Options', 'nosniff') // Previne MIME-sniffing
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https: data:; img-src 'self' data: https: http: blob:; connect-src 'self' https: http: wss: ws:; frame-ancestors 'none';"
  )

  // 2. Proteção de Rotas de Loja e Uploads (/admin, /api/admin/*, /api/upload)
  // REGRA INEGOCIÁVEL 1: Exige ADMINISTRADOR (ou admin/editor). TECNICO_RH e FUNCIONARIO nunca acedem à loja.
  const isStoreAdminApi = pathname.startsWith('/api/admin/') || pathname === '/api/upload'
  const isStoreAdminPage = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')

  if (isStoreAdminApi) {
    const authHeader = request.headers.get('authorization')
    const adminCookie = request.cookies.get('arknet_admin_token')?.value
    const token = authHeader?.replace('Bearer ', '') || adminCookie

    if (!token) {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Autenticação obrigatória.' },
        { status: 401 }
      )
    }

    const payload = await verifySessionToken(token)
    const roleUpper = payload?.role?.toUpperCase()
    const canAccessStore = roleUpper === 'ADMINISTRADOR' || payload?.role === 'admin' || payload?.role === 'editor'

    if (!payload || !canAccessStore) {
      return NextResponse.json(
        { error: 'Acesso negado. A gestão da loja e uploads exige perfil de Administrador.' },
        { status: 403 }
      )
    }
  }

  if (isStoreAdminPage) {
    const adminCookie = request.cookies.get('arknet_admin_token')?.value
    if (!adminCookie) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const payload = await verifySessionToken(adminCookie)
    const roleUpper = payload?.role?.toUpperCase()
    const canAccessStore = roleUpper === 'ADMINISTRADOR' || payload?.role === 'admin' || payload?.role === 'editor'

    if (!payload || !canAccessStore) {
      // Se for Técnico de RH tentando aceder à loja, redireciona para o painel de RH
      if (roleUpper === 'TECNICO_RH') {
        return NextResponse.redirect(new URL('/rh', request.url))
      }
      // Se for Funcionário tentando aceder à loja, redireciona para o Portal
      return NextResponse.redirect(new URL('/portal', request.url))
    }
  }

  // 3. Proteção de Rotas do Painel de Recursos Humanos (/rh e /api/rh/*)
  // Apenas ADMINISTRADOR e TECNICO_RH. FUNCIONARIO é expressamente bloqueado!
  const isHrApi = pathname.startsWith('/api/rh/')
  const isHrLoginPage = pathname === '/rh/entrar'
  const isHrPage = (pathname === '/rh' || pathname.startsWith('/rh/')) && !isHrLoginPage

  // Se já estiver na página de login do RH (/rh/entrar) e já tiver sessão válida, redireciona
  if (isHrLoginPage) {
    const adminCookie = request.cookies.get('arknet_admin_token')?.value
    if (adminCookie) {
      const payload = await verifySessionToken(adminCookie)
      if (payload) {
        const roleUpper = payload?.role?.toUpperCase()
        if (roleUpper === 'FUNCIONARIO') {
          return NextResponse.redirect(new URL('/portal', request.url))
        }
        if (roleUpper === 'TECNICO_RH' || roleUpper === 'ADMINISTRADOR' || payload?.role === 'admin') {
          return NextResponse.redirect(new URL('/rh', request.url))
        }
      }
    }
  }

  // Endpoints cron validam CRON_SECRET localmente; não usam uma sessão de RH interactiva.
  const isCronWebhook = pathname.startsWith('/api/rh/cron/')

  if (isHrApi && !isCronWebhook) {
    const authHeader = request.headers.get('authorization')
    const adminCookie = request.cookies.get('arknet_admin_token')?.value
    const token = authHeader?.replace('Bearer ', '') || adminCookie

    if (!token) {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Autenticação obrigatória para o módulo de RH.' },
        { status: 401 }
      )
    }

    const payload = await verifySessionToken(token)
    const roleUpper = payload?.role?.toUpperCase()
    const isHrManager = roleUpper === 'ADMINISTRADOR' || payload?.role === 'admin' || roleUpper === 'TECNICO_RH'

    if (!payload || !isHrManager) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas Administradores e Técnicos de RH podem aceder a estas operações.' },
        { status: 403 }
      )
    }
  }

  if (isHrPage) {
    const adminCookie = request.cookies.get('arknet_admin_token')?.value
    if (!adminCookie) {
      const loginUrl = new URL('/rh/entrar', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const payload = await verifySessionToken(adminCookie)
    const roleUpper = payload?.role?.toUpperCase()
    const isHrManager = roleUpper === 'ADMINISTRADOR' || payload?.role === 'admin' || roleUpper === 'TECNICO_RH'

    if (!payload || !isHrManager) {
      // Funcionário comum tentando aceder ao painel de RH é enviado para o seu Portal
      return NextResponse.redirect(new URL('/portal', request.url))
    }
  }

  // 4. Proteção do Portal do Funcionário (/portal e /api/portal/*)
  const isPortalApi = pathname.startsWith('/api/portal/')
  const isPortalPage = pathname === '/portal' || pathname.startsWith('/portal/')

  if (isPortalApi) {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('arknet_admin_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Autenticação necessária para aceder ao portal.' }, { status: 401 })
    }

    const payload = await verifySessionToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Sessão inválida ou expirada.' }, { status: 401 })
    }
  }

  if (isPortalPage) {
    const token = request.cookies.get('arknet_admin_token')?.value
    if (!token) {
      const loginUrl = new URL('/rh/entrar', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const payload = await verifySessionToken(token)
    if (!payload) {
      const loginUrl = new URL('/rh/entrar', request.url)
      loginUrl.searchParams.set('error', 'session_expired')
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
