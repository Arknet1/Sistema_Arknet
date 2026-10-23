import { NextRequest } from 'next/server'
import { verifySessionToken } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { HrUserContext } from './permissions'

const ADMIN_COOKIE = 'arknet_admin_token'

export async function getHrServerSession(request: NextRequest): Promise<HrUserContext | null> {
  const authHeader = request.headers.get('authorization')
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined
  const cookieToken = request.cookies.get(ADMIN_COOKIE)?.value
  const token = headerToken || cookieToken

  if (!token) return null

  const payload = verifySessionToken(token)
  if (!payload || !payload.userId) return null

  try {
    const user = await prisma.adminUser.findUnique({
      where: { id: payload.userId },
      include: { hrEmployee: true },
    })

    if (!user || user.status !== 'active') return null

    // Se o colaborador associado estiver desligado, o login é bloqueado
    if (user.hrEmployee && user.hrEmployee.status === 'DESLIGADO') {
      return null
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.hrEmployee?.id || null,
      employeeStatus: user.hrEmployee?.status || null,
    }
  } catch (error) {
    console.error('[getHrServerSession] Erro ao carregar utilizador:', error)
    return null
  }
}
