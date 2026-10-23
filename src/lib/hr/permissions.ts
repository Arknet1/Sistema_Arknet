/**
 * Motor Central de Permissões e RBAC do Módulo de Recursos Humanos ARKNET
 * 
 * Perfis permitidos:
 * - ADMINISTRADOR (compatível com 'admin'): Acesso total ao sistema, configuração e loja.
 * - TECNICO_RH: Gestão completa de RH em todos os departamentos (vê salários, aprova contratos, documentos, etc.).
 *               NUNCA acede à gestão da loja (/admin).
 * - FUNCIONARIO: Apenas acede ao /portal e aos seus próprios dados (só leitura).
 */

export type HrRole = 'ADMINISTRADOR' | 'admin' | 'TECNICO_RH' | 'FUNCIONARIO' | 'editor'

export interface HrUserContext {
  id: string
  name?: string
  email: string
  role: string
  employeeId?: string | null
  employeeStatus?: string | null
}

export type HrAction =
  | 'ACEDER_GESTAO_LOJA'
  | 'ACEDER_PAINEL_RH'
  | 'ACEDER_PORTAL'
  | 'CONFIGURAR_MODULO'
  | 'GERIR_DEPARTAMENTOS'
  | 'GERIR_CARGOS'
  | 'LISTAR_FUNCIONARIOS'
  | 'VER_FICHA_FUNCIONARIO'
  | 'VER_DADOS_SENSIVEIS'
  | 'CRIAR_FUNCIONARIO'
  | 'EDITAR_FUNCIONARIO'
  | 'DESLIGAR_FUNCIONARIO'
  | 'CRIAR_CONTRATO'
  | 'EDITAR_CONTRATO'
  | 'APROVAR_CONTRATO'
  | 'VER_CONTRATO'
  | 'CARREGAR_DOCUMENTO'
  | 'DESCARREGAR_DOCUMENTO'
  | 'ARQUIVAR_DOCUMENTO'
  | 'VER_AUDITORIA'
  | 'CRIAR_UTILIZADOR_FUNCIONARIO'

export function isAdministrator(role?: string | null): boolean {
  if (!role) return false
  const r = role.toUpperCase()
  return r === 'ADMINISTRADOR' || r === 'ADMIN'
}

export function isTecnicoRh(role?: string | null): boolean {
  if (!role) return false
  return role.toUpperCase() === 'TECNICO_RH'
}

export function isFuncionario(role?: string | null): boolean {
  if (!role) return false
  return role.toUpperCase() === 'FUNCIONARIO'
}

/**
 * Helper central de decisão de permissões: can(user, acção, recurso, contextoAlvo?)
 */
export function can(
  user: HrUserContext | null | undefined,
  action: HrAction,
  resource?: string,
  targetContext?: { targetEmployeeId?: string | null; targetUserId?: string | null }
): boolean {
  if (!user || !user.role) return false

  const role = user.role.toUpperCase()

  // Funcionário desligado não tem qualquer permissão
  if (user.employeeStatus === 'DESLIGADO') {
    return false
  }

  // 1. Permissões de Loja (/admin)
  if (action === 'ACEDER_GESTAO_LOJA') {
    // Apenas ADMINISTRADOR, admin e editor da loja existente
    return isAdministrator(role) || user.role === 'editor'
  }

  // 2. Administrador tem permissão total em todo o módulo de RH
  if (isAdministrator(role)) {
    return true
  }

  // 3. Técnico de RH
  if (isTecnicoRh(role)) {
    // Técnico de RH tem plenos poderes em todas as operações de RH
    switch (action) {
      case 'CONFIGURAR_MODULO':
        // Apenas configurações de alto nível podem ser restritas a Admin, mas gestão de RH tem tudo
        return true
      case 'ACEDER_PAINEL_RH':
      case 'GERIR_DEPARTAMENTOS':
      case 'GERIR_CARGOS':
      case 'LISTAR_FUNCIONARIOS':
      case 'VER_FICHA_FUNCIONARIO':
      case 'VER_DADOS_SENSIVEIS':
      case 'CRIAR_FUNCIONARIO':
      case 'EDITAR_FUNCIONARIO':
      case 'DESLIGAR_FUNCIONARIO':
      case 'CRIAR_CONTRATO':
      case 'EDITAR_CONTRATO':
      case 'APROVAR_CONTRATO':
      case 'VER_CONTRATO':
      case 'CARREGAR_DOCUMENTO':
      case 'DESCARREGAR_DOCUMENTO':
      case 'ARQUIVAR_DOCUMENTO':
      case 'VER_AUDITORIA':
      case 'CRIAR_UTILIZADOR_FUNCIONARIO':
        return true
      case 'ACEDER_PORTAL':
        // Técnico de RH acede ao portal se tiver ficha de funcionário ligada
        return Boolean(user.employeeId)
      default:
        return false
    }
  }

  // 4. Funcionário
  if (isFuncionario(role)) {
    // Funcionário não tem acesso ao painel de RH nem à loja
    switch (action) {
      case 'ACEDER_PORTAL':
        return Boolean(user.employeeId)
      case 'VER_FICHA_FUNCIONARIO':
      case 'VER_CONTRATO':
      case 'VER_DADOS_SENSIVEIS':
      case 'DESCARREGAR_DOCUMENTO': {
        // Só pode ver os seus próprios dados!
        if (!targetContext || !user.employeeId) return false
        if (targetContext.targetEmployeeId && targetContext.targetEmployeeId === user.employeeId) {
          return true
        }
        if (targetContext.targetUserId && targetContext.targetUserId === user.id) {
          return true
        }
        return false
      }
      default:
        return false
    }
  }

  return false
}

/**
 * Validação rigorosa: lança erro de autorização caso não cumpra a permissão
 */
export function assertCan(
  user: HrUserContext | null | undefined,
  action: HrAction,
  resource?: string,
  targetContext?: { targetEmployeeId?: string | null; targetUserId?: string | null }
): void {
  if (!can(user, action, resource, targetContext)) {
    const roleName = user?.role || 'Anónimo'
    throw new Error(`Acesso negado: Perfil "${roleName}" não tem permissão para "${action}" no recurso "${resource || 'RH'}".`)
  }
}

/**
 * Função utilitária para mascarar dados sensíveis caso o utilizador não tenha permissão de visualização
 */
export function maskSensitiveData<T extends Record<string, any>>(
  employee: T,
  canViewSensitive: boolean
): T {
  if (canViewSensitive) {
    return employee
  }

  return {
    ...employee,
    biNumber: employee.biNumber ? `${employee.biNumber.slice(0, 3)}****${employee.biNumber.slice(-2)}` : null,
    bankIban: employee.bankIban ? `AO06.****.****.${employee.bankIban.slice(-4)}` : null,
    bankAccountNumber: employee.bankAccountNumber ? `****${employee.bankAccountNumber.slice(-4)}` : null,
    baseSalary: undefined,
    salary: undefined,
    address: 'Informação confidencial',
  }
}
