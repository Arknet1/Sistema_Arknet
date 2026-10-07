import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, ServerSessionPayload } from '@/lib/server-auth'

export interface AdminAuthResult {
  isAuthorized: boolean
  session?: ServerSessionPayload
  response?: NextResponse
}

/**
 * Validação rigorosa de autenticação administrativa no servidor.
 * - Sem sessão válida -> 401 Unauthorized
 * - Sessão de cliente comum sem privilégios -> 403 Forbidden
 * - Administrador / Editor -> Autorizado
 */
export function requireAdminAuth(request: NextRequest): AdminAuthResult {
  const authHeader = request.headers.get('authorization')
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined
  const adminCookie = request.cookies.get('arknet_admin_token')?.value
  const customerCookie = request.cookies.get('arknet_customer_token')?.value

  const token = headerToken || adminCookie || customerCookie

  if (!token) {
    return {
      isAuthorized: false,
      response: NextResponse.json(
        { success: false, message: 'Autenticação necessária. Por favor inicie sessão como administrador.' },
        { status: 401 }
      ),
    }
  }

  const session = verifySessionToken(token)

  if (!session) {
    return {
      isAuthorized: false,
      response: NextResponse.json(
        { success: false, message: 'Sessão expirada ou inválida. Por favor inicie sessão novamente.' },
        { status: 401 }
      ),
    }
  }

  // Verifica se tem role de administração
  if (session.role !== 'admin' && session.role !== 'editor') {
    return {
      isAuthorized: false,
      response: NextResponse.json(
        { success: false, message: 'Acesso interdito. Esta área é restrita a administradores da ARKNET.' },
        { status: 403 }
      ),
    }
  }

  return {
    isAuthorized: true,
    session,
  }
}
