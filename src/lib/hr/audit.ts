import { Prisma, PrismaClient } from '@prisma/client'
import { HrUserContext } from './permissions'

export type HrAuditAction =
  | 'CRIAR'
  | 'EDITAR'
  | 'APROVAR'
  | 'MUDAR_ESTADO'
  | 'DESLIGAR'
  | 'ACESSO_SENSIVEL'

export type HrAuditResource =
  | 'FUNCIONARIO'
  | 'CONTRATO'
  | 'DOCUMENTO'
  | 'DEPARTAMENTO'
  | 'CARGO'
  | 'UTILIZADOR'

export interface RecordHrAuditParams {
  user: HrUserContext
  action: HrAuditAction
  resource: HrAuditResource
  resourceId?: string | null
  details: string
  oldValue?: any
  newValue?: any
  ipAddress?: string | null
}

const SENSITIVE_KEYS = new Set([
  'biNumber',
  'bi',
  'bankIban',
  'iban',
  'bankAccountNumber',
  'accountNumber',
  'baseSalary',
  'salary',
  'password',
  'passwordHash',
])

/**
 * Mascara campos sensíveis em objetos antes de gravar na auditoria
 */
export function sanitizeAuditData(data: any): any {
  if (!data) return null
  if (typeof data !== 'object') return data

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeAuditData(item))
  }

  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key)) {
      if (value === null || value === undefined) {
        sanitized[key] = null
      } else {
        const strVal = String(value)
        if (key.includes('Salary') || key === 'salary') {
          sanitized[key] = '[SALÁRIO_CONFIDENCIAL]'
        } else if (key === 'biNumber' || key === 'bi') {
          sanitized[key] = strVal.length > 4 ? `${strVal.slice(0, 3)}****${strVal.slice(-2)}` : '****'
        } else if (key.includes('Iban') || key === 'iban') {
          sanitized[key] = strVal.length > 6 ? `AO06.****.****.${strVal.slice(-4)}` : 'AO06.****'
        } else if (key.includes('password') || key.includes('Password')) {
          sanitized[key] = '[SENHA_REDACTED]'
        } else {
          sanitized[key] = '****'
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeAuditData(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Cria a entrada de auditoria na base de dados (ou dentro de uma transação Prisma)
 */
export async function recordHrAudit(
  prismaClientOrTx: PrismaClient | Prisma.TransactionClient,
  params: RecordHrAuditParams
) {
  const oldValSanitized = params.oldValue ? JSON.stringify(sanitizeAuditData(params.oldValue)) : null
  const newValSanitized = params.newValue ? JSON.stringify(sanitizeAuditData(params.newValue)) : null

  return (prismaClientOrTx as any).hrAuditLog.create({
    data: {
      userId: params.user.id || null,
      userName: params.user.name || params.user.email,
      userRole: params.user.role,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId || null,
      details: params.details,
      oldValue: oldValSanitized,
      newValue: newValSanitized,
      ipAddress: params.ipAddress || null,
    },
  })
}
