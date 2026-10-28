/**
 * Motor Central de Permissões e RBAC do Módulo de Recursos Humanos ARKNET
 * 
 * Perfis permitidos:
 * - ADMINISTRADOR (compatível com 'admin'): Acesso total ao sistema, configuração, loja e todo o pessoal.
 * - TECNICO_RH: Gestão de RH e dos colaboradores, sem gerir contas de administradores ou técnicos.
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
  | 'GERIR_PESSOAL_RH'
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
  // Acções da Fase 2 (Ponto e Ausências)
  | 'MARCAR_PONTO_PROPRIO'
  | 'VER_PONTO_PROPRIO'
  | 'PEDIR_CORRECAO_PONTO'
  | 'PEDIR_AUSENCIA'
  | 'VER_AUSENCIAS_PROPRIAS'
  | 'VER_SALDO_FERIAS_PROPRIO'
  | 'CANCELAR_PEDIDO_PROPRIO'
  | 'VER_PONTO_TODOS'
  | 'REGISTAR_PONTO_MANUAL_RH'
  | 'APROVAR_CORRECAO_PONTO'
  | 'APROVAR_HORAS_EXTRA'
  | 'APROVAR_AUSENCIA'
  | 'VER_AUSENCIAS_TODOS'
  | 'CONFIGURAR_PONTO_AUSENCIAS'
  | 'EXPORTAR_RELATORIO_PONTO'
  // Acções da Fase 3A (Folhas de Ponto e Fecho Mensal)
  | 'VER_FOLHA_PROPRIA'
  | 'SUBMETER_FOLHA_PROPRIA'
  | 'DESCARREGAR_PDF_FOLHA_PROPRIA'
  | 'VER_FOLHAS_TODOS'
  | 'GERAR_FOLHAS_PONTO'
  | 'APROVAR_FOLHA_PONTO'
  | 'JUSTIFICAR_FALTA'
  | 'FECHAR_PERIODO_PONTO'
  | 'REABRIR_PERIODO_PONTO'
  | 'EXPORTAR_EXCEL_PERIODO'
  // Acções da Fase 4 (Processamento Salarial & Recibos de Vencimento)
  | 'VER_SALARIOS_TODOS'
  | 'PROCESSAR_SALARIOS'
  | 'APROVAR_SALARIOS'
  | 'PAGAR_SALARIOS'
  | 'VER_RECIBO_PROPRIO'
  | 'DESCARREGAR_RECIBO_PROPRIO'
  // Acções da Fase 5 (Ficheiros Bancários e Mapas Fiscais)
  | 'EXPORTAR_FICHEIRO_BANCARIO'
  | 'EXPORTAR_MAPA_INSS'
  | 'EXPORTAR_MAPA_AGT'
  // Acções da Fase 6 (Avaliação de Desempenho e Formação)
  | 'VER_DESEMPENHO_TODOS'
  | 'GERIR_CICLOS_DESEMPENHO'
  | 'AVALIAR_COLABORADOR'
  | 'VER_AUTO_AVALIACAO'
  | 'SUBMETER_AUTO_AVALIACAO'
  | 'VER_FORMACAO_TODOS'
  | 'GERIR_CERTIFICACOES'
  // Acções da Fase 7 (Recrutamento e ATS Integrado)
  | 'VER_RECRUTAMENTO'
  | 'GERIR_VAGAS'
  | 'GERIR_CANDIDATOS'
  | 'ADMITIR_CANDIDATO'

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
 * Validação de aprovação cruzada (Regra dos 4 Olhos):
 * NINGUÉM aprova os seus próprios pedidos.
 * Pedidos do TECNICO_RH são aprovados por ADMINISTRADOR.
 * Pedidos do ADMINISTRADOR por TECNICO_RH.
 */
export function canApproveRequest(
  reviewer: HrUserContext | null | undefined,
  requester: { role: string; employeeId?: string | null; userId?: string | null }
): { allowed: boolean; reason?: string } {
  if (!reviewer) {
    return { allowed: false, reason: 'Utilizador não autenticado.' }
  }

  // 1. Ninguém aprova os seus próprios pedidos
  if (
    (reviewer.employeeId && requester.employeeId && reviewer.employeeId === requester.employeeId) ||
    (reviewer.id && requester.userId && reviewer.id === requester.userId)
  ) {
    return { allowed: false, reason: 'Não é permitido aprovar os seus próprios pedidos (Regra dos 4 Olhos).' }
  }

  const reviewerRole = reviewer.role.toUpperCase()
  const requesterRole = requester.role.toUpperCase()

  // 2. Pedidos do Técnico de RH têm de ser aprovados por Administrador
  if (isTecnicoRh(requesterRole)) {
    if (!isAdministrator(reviewerRole)) {
      return { allowed: false, reason: 'Pedidos submetidos por Técnicos de RH requerem aprovação de um Administrador.' }
    }
    return { allowed: true }
  }

  // 3. Pedidos do Administrador têm de ser aprovados por Técnico de RH
  if (isAdministrator(requesterRole)) {
    if (!isTecnicoRh(reviewerRole)) {
      return { allowed: false, reason: 'Pedidos submetidos por Administradores requerem aprovação de um Técnico de RH.' }
    }
    return { allowed: true }
  }

  // 4. Pedidos de Funcionários comuns podem ser aprovados por Técnico de RH ou Administrador
  if (isTecnicoRh(reviewerRole) || isAdministrator(reviewerRole)) {
    return { allowed: true }
  }

  return { allowed: false, reason: 'Sem perfil autorizado para aprovação.' }
}

/**
 * Helper central de decisão de permissões: can(user, acção, recurso, contextoAlvo?)
 */
export function can(
  user: HrUserContext | null | undefined,
  action: HrAction,
  resource?: string,
  targetContext?: {
    targetEmployeeId?: string | null
    targetUserId?: string | null
    targetUserRole?: string | null
  }
): boolean {
  if (!user || !user.role) return false

  const role = user.role.toUpperCase()

  // Funcionário desligado não tem qualquer permissão no sistema
  if (user.employeeStatus === 'DESLIGADO') {
    return false
  }

  // Funcionário suspenso não pode marcar ponto nem pedir ausências/correcções
  if (user.employeeStatus === 'SUSPENSO') {
    if (
      action === 'MARCAR_PONTO_PROPRIO' ||
      action === 'PEDIR_CORRECAO_PONTO' ||
      action === 'PEDIR_AUSENCIA' ||
      action === 'CANCELAR_PEDIDO_PROPRIO'
    ) {
      return false
    }
  }

  // 1. Permissões de Loja (/admin)
  if (action === 'ACEDER_GESTAO_LOJA') {
    // Apenas ADMINISTRADOR, admin e editor da loja existente
    return isAdministrator(role) || user.role === 'editor'
  }

  // 2. Administrador tem permissão de gestão em todo o módulo de RH
  if (isAdministrator(role)) {
    if (
      action === 'MARCAR_PONTO_PROPRIO' ||
      action === 'VER_PONTO_PROPRIO' ||
      action === 'PEDIR_CORRECAO_PONTO' ||
      action === 'PEDIR_AUSENCIA' ||
      action === 'VER_AUSENCIAS_PROPRIAS' ||
      action === 'VER_SALDO_FERIAS_PROPRIO' ||
      action === 'CANCELAR_PEDIDO_PROPRIO'
    ) {
      return Boolean(user.employeeId)
    }
    return true
  }

  // 3. Técnico de RH
  if (isTecnicoRh(role)) {
    switch (action) {
      case 'CONFIGURAR_MODULO':
      case 'CONFIGURAR_PONTO_AUSENCIAS':
      case 'ACEDER_PAINEL_RH':
      case 'GERIR_DEPARTAMENTOS':
      case 'GERIR_CARGOS':
      case 'LISTAR_FUNCIONARIOS':
      case 'VER_DADOS_SENSIVEIS':
      case 'CRIAR_FUNCIONARIO':
      case 'CRIAR_CONTRATO':
      case 'EDITAR_CONTRATO':
      case 'APROVAR_CONTRATO':
      case 'VER_CONTRATO':
      case 'CARREGAR_DOCUMENTO':
      case 'DESCARREGAR_DOCUMENTO':
      case 'ARQUIVAR_DOCUMENTO':
      case 'VER_AUDITORIA':
      // Fase 2 - Gestão
      case 'VER_PONTO_TODOS':
      case 'REGISTAR_PONTO_MANUAL_RH':
      case 'APROVAR_CORRECAO_PONTO':
      case 'APROVAR_HORAS_EXTRA':
      case 'APROVAR_AUSENCIA':
      case 'VER_AUSENCIAS_TODOS':
      case 'EXPORTAR_RELATORIO_PONTO':
      // Fase 3A - Folhas de Ponto e Fecho Mensal (gestão)
      case 'VER_FOLHAS_TODOS':
      case 'GERAR_FOLHAS_PONTO':
      case 'APROVAR_FOLHA_PONTO':
      case 'JUSTIFICAR_FALTA':
      case 'FECHAR_PERIODO_PONTO':
      case 'REABRIR_PERIODO_PONTO':
      case 'EXPORTAR_EXCEL_PERIODO':
      // Fase 4 & 5 - Salários, Banco e Impostos (gestão)
      case 'VER_SALARIOS_TODOS':
      case 'PROCESSAR_SALARIOS':
      case 'APROVAR_SALARIOS':
      case 'PAGAR_SALARIOS':
      case 'EXPORTAR_FICHEIRO_BANCARIO':
      case 'EXPORTAR_MAPA_INSS':
      case 'EXPORTAR_MAPA_AGT':
      // Fase 6 & 7 - Gestão
      case 'VER_DESEMPENHO_TODOS':
      case 'GERIR_CICLOS_DESEMPENHO':
      case 'AVALIAR_COLABORADOR':
      case 'VER_FORMACAO_TODOS':
      case 'GERIR_CERTIFICACOES':
      case 'VER_RECRUTAMENTO':
      case 'GERIR_VAGAS':
      case 'GERIR_CANDIDATOS':
      case 'ADMITIR_CANDIDATO':
        return true

      case 'GERIR_PESSOAL_RH':
        return false

      case 'VER_FICHA_FUNCIONARIO':
      case 'EDITAR_FUNCIONARIO':
      case 'DESLIGAR_FUNCIONARIO':
      case 'CRIAR_UTILIZADOR_FUNCIONARIO':
        return targetContext?.targetUserRole === null || targetContext?.targetUserRole === 'FUNCIONARIO'

      case 'ACEDER_PORTAL':
      case 'MARCAR_PONTO_PROPRIO':
      case 'VER_PONTO_PROPRIO':
      case 'PEDIR_CORRECAO_PONTO':
      case 'PEDIR_AUSENCIA':
      case 'VER_AUSENCIAS_PROPRIAS':
      case 'VER_SALDO_FERIAS_PROPRIO':
      case 'CANCELAR_PEDIDO_PROPRIO':
      // Fase 3A - Auto-serviço de folha de ponto
      case 'VER_FOLHA_PROPRIA':
      case 'SUBMETER_FOLHA_PROPRIA':
      case 'DESCARREGAR_PDF_FOLHA_PROPRIA':
      // Fase 4 - Auto-serviço recibo de vencimento
      case 'VER_RECIBO_PROPRIO':
      case 'DESCARREGAR_RECIBO_PROPRIO':
      // Fase 6 - Auto-avaliação
      case 'VER_AUTO_AVALIACAO':
      case 'SUBMETER_AUTO_AVALIACAO':
        // Técnico de RH acede às acções do portal se tiver ficha de funcionário ligada
        return Boolean(user.employeeId)

      default:
        return false
    }
  }

  // 4. Funcionário
  if (isFuncionario(role)) {
    switch (action) {
      case 'ACEDER_PORTAL':
        return Boolean(user.employeeId)

      case 'MARCAR_PONTO_PROPRIO':
      case 'VER_PONTO_PROPRIO':
      case 'PEDIR_CORRECAO_PONTO':
      case 'PEDIR_AUSENCIA':
      case 'VER_AUSENCIAS_PROPRIAS':
      case 'VER_SALDO_FERIAS_PROPRIO':
      case 'CANCELAR_PEDIDO_PROPRIO':
      // Fase 3A - Auto-serviço
      case 'VER_FOLHA_PROPRIA':
      case 'SUBMETER_FOLHA_PROPRIA':
      case 'DESCARREGAR_PDF_FOLHA_PROPRIA':
      // Fase 4 - Auto-serviço recibo de vencimento
      case 'VER_RECIBO_PROPRIO':
      case 'DESCARREGAR_RECIBO_PROPRIO':
      // Fase 6 - Auto-avaliação
      case 'VER_AUTO_AVALIACAO':
      case 'SUBMETER_AUTO_AVALIACAO':
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
  targetContext?: {
    targetEmployeeId?: string | null
    targetUserId?: string | null
    targetUserRole?: string | null
  }
): asserts user is HrUserContext {
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

  const masked: Record<string, any> = {
    ...employee,
    biNumber: employee.biNumber ? `${employee.biNumber.slice(0, 3)}****${employee.biNumber.slice(-2)}` : null,
    bankIban: employee.bankIban ? `AO06.****.****.${employee.bankIban.slice(-4)}` : null,
    bankAccountNumber: employee.bankAccountNumber ? `****${employee.bankAccountNumber.slice(-4)}` : null,
    baseSalary: undefined,
    salary: undefined,
    address: 'Informação confidencial',
  }

  // Sensitive compensation data can be nested in employee profile relations.
  // Strip it there as well as on the top-level employee record.
  if (Array.isArray(employee.contracts)) {
    masked.contracts = employee.contracts.map(({ baseSalary, ...contract }: Record<string, any>) => contract)
  }
  if (Array.isArray(employee.careerHistory)) {
    masked.careerHistory = employee.careerHistory.map(({ salary, ...entry }: Record<string, any>) => entry)
  }

  return masked as T
}
