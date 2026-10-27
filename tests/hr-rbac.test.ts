import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  can,
  assertCan,
  maskSensitiveData,
  HrUserContext,
} from '../src/lib/hr/permissions'
import { sanitizeAuditData } from '../src/lib/hr/audit'

describe('Recursos Humanos (RH) - Controlo de Acesso RBAC e Segurança', () => {
  // Contextos de Utilizadores de Teste
  const adminUser: HrUserContext = {
    id: 'usr-admin-1',
    name: 'Administrador Geral',
    email: 'admin@arknet.co.ao',
    role: 'ADMINISTRADOR',
  }

  const legacyAdminUser: HrUserContext = {
    id: 'usr-legacy-admin',
    name: 'Admin Legado',
    email: 'legacy@arknet.co.ao',
    role: 'admin',
  }

  const tecnicoRh: HrUserContext = {
    id: 'usr-tech-1',
    name: 'Teresa da Silva',
    email: 'tecnico.rh@arknet.co.ao',
    role: 'TECNICO_RH',
    employeeId: 'emp-tech-1', // Com ficha ligada
  }

  const funcionario1: HrUserContext = {
    id: 'usr-func-1',
    name: 'Manuel dos Santos',
    email: 'manuel@arknet.co.ao',
    role: 'FUNCIONARIO',
    employeeId: 'emp-func-1',
    employeeStatus: 'ACTIVO',
  }

  const funcionario2: HrUserContext = {
    id: 'usr-func-2',
    name: 'Helena Baptista',
    email: 'helena@arknet.co.ao',
    role: 'FUNCIONARIO',
    employeeId: 'emp-func-2',
    employeeStatus: 'ACTIVO',
  }

  const funcionarioDesligado: HrUserContext = {
    id: 'usr-func-3',
    name: 'António Desligado',
    email: 'antonio@arknet.co.ao',
    role: 'FUNCIONARIO',
    employeeId: 'emp-func-3',
    employeeStatus: 'DESLIGADO',
  }

  it('1. Funcionário NÃO vê dados nem ficha de outro funcionário', () => {
    // Tentativa do funcionario1 ver os dados do funcionario2
    const canViewOther = can(funcionario1, 'VER_FICHA_FUNCIONARIO', 'FUNCIONARIO', {
      targetEmployeeId: funcionario2.employeeId,
      targetUserId: funcionario2.id,
    })
    assert.strictEqual(canViewOther, false, 'Funcionário não deve conseguir ver a ficha de outro colaborador')

    // Tentativa do funcionario1 ver os seus próprios dados
    const canViewOwn = can(funcionario1, 'VER_FICHA_FUNCIONARIO', 'FUNCIONARIO', {
      targetEmployeeId: funcionario1.employeeId,
      targetUserId: funcionario1.id,
    })
    assert.strictEqual(canViewOwn, true, 'Funcionário deve conseguir ver a sua própria ficha')
  })

  it('2. Funcionário NÃO descarrega documento privado pertencente a outro', () => {
    // Documento pertencente à Helena (emp-func-2)
    const canDownloadOtherDoc = can(funcionario1, 'DESCARREGAR_DOCUMENTO', 'DOCUMENTO', {
      targetEmployeeId: 'emp-func-2',
    })
    assert.strictEqual(canDownloadOtherDoc, false, 'Funcionário não pode descarregar documento alheio')

    // Documento próprio do Manuel (emp-func-1)
    const canDownloadOwnDoc = can(funcionario1, 'DESCARREGAR_DOCUMENTO', 'DOCUMENTO', {
      targetEmployeeId: 'emp-func-1',
    })
    assert.strictEqual(canDownloadOwnDoc, true, 'Funcionário pode descarregar o seu próprio documento')
  })

  it('3. Técnico de RH e Funcionário são ESTRITAMENTE BLOQUEADOS na gestão da loja (/admin)', () => {
    assert.strictEqual(can(tecnicoRh, 'ACEDER_GESTAO_LOJA'), false, 'Técnico de RH não pode aceder ao painel da loja')
    assert.strictEqual(can(funcionario1, 'ACEDER_GESTAO_LOJA'), false, 'Funcionário não pode aceder ao painel da loja')

    // Apenas Administradores (e legados) acedem à loja
    assert.strictEqual(can(adminUser, 'ACEDER_GESTAO_LOJA'), true, 'Administrador acede à loja')
    assert.strictEqual(can(legacyAdminUser, 'ACEDER_GESTAO_LOJA'), true, 'Admin legado acede à loja')
  })

  it('4. Técnico de RH gere colaboradores e operações de RH, mas não gere pessoal administrativo', () => {
    assert.strictEqual(can(tecnicoRh, 'ACEDER_PAINEL_RH'), true)
    assert.strictEqual(can(tecnicoRh, 'LISTAR_FUNCIONARIOS'), true)
    assert.strictEqual(can(tecnicoRh, 'VER_DADOS_SENSIVEIS'), true, 'Técnico de RH tem permissão para visualizar salários e dados bancários')
    assert.strictEqual(can(tecnicoRh, 'APROVAR_CONTRATO'), true)
    assert.strictEqual(can(tecnicoRh, 'GERIR_DEPARTAMENTOS'), true)
    assert.strictEqual(can(tecnicoRh, 'GERIR_PESSOAL_RH'), false)

    const colaborador = { targetEmployeeId: 'emp-func-2', targetUserRole: 'FUNCIONARIO' }
    const tecnico = { targetEmployeeId: 'emp-tech-2', targetUserRole: 'TECNICO_RH' }
    const administrador = { targetEmployeeId: 'emp-admin-2', targetUserRole: 'ADMINISTRADOR' }

    assert.strictEqual(can(tecnicoRh, 'VER_FICHA_FUNCIONARIO', 'FUNCIONARIO', colaborador), true)
    assert.strictEqual(can(tecnicoRh, 'EDITAR_FUNCIONARIO', 'FUNCIONARIO', colaborador), true)
    assert.strictEqual(can(tecnicoRh, 'DESLIGAR_FUNCIONARIO', 'FUNCIONARIO', colaborador), true)
    assert.strictEqual(can(tecnicoRh, 'CRIAR_UTILIZADOR_FUNCIONARIO', 'UTILIZADOR', colaborador), true)
    assert.strictEqual(can(tecnicoRh, 'VER_FICHA_FUNCIONARIO', 'FUNCIONARIO', tecnico), false)
    assert.strictEqual(can(tecnicoRh, 'EDITAR_FUNCIONARIO', 'FUNCIONARIO', administrador), false)
    assert.strictEqual(can(tecnicoRh, 'DESLIGAR_FUNCIONARIO', 'FUNCIONARIO', tecnico), false)
    assert.strictEqual(can(tecnicoRh, 'CRIAR_UTILIZADOR_FUNCIONARIO', 'UTILIZADOR', administrador), false)
    assert.strictEqual(can(tecnicoRh, 'EDITAR_FUNCIONARIO', 'FUNCIONARIO'), false)
    assert.strictEqual(can(tecnicoRh, 'VER_FICHA_FUNCIONARIO', 'FUNCIONARIO', {
      targetEmployeeId: 'emp-unlinked',
      targetUserRole: null,
    }), true, 'Técnico pode gerir fichas de colaboradores sem conta ligada')

    assert.strictEqual(can(adminUser, 'GERIR_PESSOAL_RH'), true)
    assert.strictEqual(can(adminUser, 'EDITAR_FUNCIONARIO', 'FUNCIONARIO', tecnico), true)
    assert.strictEqual(can(adminUser, 'DESLIGAR_FUNCIONARIO', 'FUNCIONARIO', administrador), true)
  })

  it('5. Apenas Administrador e Técnico de RH acedem ao painel /rh (Funcionário bloqueado)', () => {
    assert.strictEqual(can(adminUser, 'ACEDER_PAINEL_RH'), true)
    assert.strictEqual(can(tecnicoRh, 'ACEDER_PAINEL_RH'), true)
    assert.strictEqual(can(funcionario1, 'ACEDER_PAINEL_RH'), false, 'Funcionário comum é proibido de aceder ao painel de RH')
  })

  it('6. Técnico com funcionário ligado acede ao seu próprio /portal', () => {
    assert.strictEqual(can(tecnicoRh, 'ACEDER_PORTAL'), true, 'Técnico com employeeId pode aceder ao seu portal')

    const tecnicoSemFuncionario: HrUserContext = {
      id: 'usr-tech-2',
      email: 'outro.tech@arknet.co.ao',
      role: 'TECNICO_RH',
      employeeId: null,
    }
    assert.strictEqual(can(tecnicoSemFuncionario, 'ACEDER_PORTAL'), false, 'Técnico sem ficha associada não tem portal')
  })

  it('7. Funcionário DESLIGADO tem todos os acessos imediatamente bloqueados', () => {
    assert.strictEqual(can(funcionarioDesligado, 'ACEDER_PORTAL'), false)
    assert.strictEqual(can(funcionarioDesligado, 'VER_FICHA_FUNCIONARIO', 'FUNCIONARIO', {
      targetEmployeeId: funcionarioDesligado.employeeId,
    }), false)
  })

  it('8. Mascaramento de dados sensíveis para utilizadores sem permissão', () => {
    const rawData = {
      fullName: 'Carlos Alberto',
      biNumber: '001234567LA012',
      bankIban: 'AO06004000001234567890123',
      bankAccountNumber: '1234567890',
      baseSalary: '450000',
      address: 'Bairro Alvalade, Rua 5',
    }

    const masked = maskSensitiveData(rawData, false)
    assert.ok(masked.biNumber?.includes('****'), 'BI deve ser mascarado')
    assert.ok(masked.bankIban?.includes('****'), 'IBAN deve ser mascarado')
    assert.strictEqual(masked.baseSalary, undefined, 'Salário não deve estar presente')
    assert.strictEqual(masked.address, 'Informação confidencial')

    const unmasked = maskSensitiveData(rawData, true)
    assert.strictEqual(unmasked.biNumber, rawData.biNumber)
    assert.strictEqual(unmasked.baseSalary, rawData.baseSalary)
  })

  it('9. Auditoria mascara dados sensíveis (salário, IBAN, BI) em logs', () => {
    const sensitivePayload = {
      employeeId: 'emp-001',
      biNumber: '001234567LA012',
      baseSalary: '600000.00',
      bankIban: 'AO06004000001234567890123',
      notes: 'Alteração de contrato',
    }

    const sanitized = sanitizeAuditData(sensitivePayload)
    assert.strictEqual(sanitized.baseSalary, '[SALÁRIO_CONFIDENCIAL]')
    assert.ok(sanitized.biNumber.includes('****'))
    assert.ok(sanitized.bankIban.includes('****'))
    assert.strictEqual(sanitized.notes, 'Alteração de contrato', 'Dados não sensíveis são mantidos')
  })

  it('10. assertCan lança excepção explícita ao violar regra de acesso', () => {
    assert.throws(
      () => {
        assertCan(funcionario1, 'ACEDER_PAINEL_RH', 'PAINEL_RH')
      },
      /Acesso negado/,
      'Deve lançar erro de autorização'
    )
  })
})
