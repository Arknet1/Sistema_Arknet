import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionToken } from '@/lib/security-utils'

/**
 * Middleware de Segurança Global ARKNET
 * Aplica cabeçalhos HTTP de segurança estritos e verifica a autenticação para rotas protegidas.
 */
export function middleware(request: NextRequest) {
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
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https:;"
  )

  // 2. Proteção de Rotas de API Administrativas (/api/admin/*)
  if (pathname.startsWith('/api/admin/')) {
    const authHeader = request.headers.get('authorization')
    const adminCookie = request.cookies.get('arknet_admin_token')?.value
    const token = authHeader?.replace('Bearer ', '') || adminCookie

    if (!token) {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Autenticação de administrador obrigatória.' },
        { status: 401 }
      )
    }

    const payload = verifySessionToken(token)
    if (!payload || (payload.role !== 'admin' && payload.role !== 'editor')) {
      return NextResponse.json(
        { error: 'Acesso negado. Token de sessão de administrador inválido ou expirado.' },
        { status: 403 }
      )
    }
  }

  // 3. Proteção de Rotas de Painel Administrativo (/admin/* exceto /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminCookie = request.cookies.get('arknet_admin_token')?.value
    if (!adminCookie) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const payload = verifySessionToken(adminCookie)
    if (!payload || (payload.role !== 'admin' && payload.role !== 'editor')) {
      const loginUrl = new URL('/admin/login', request.url)
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
