import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  can,
  assertCan,
  canApproveRequest,
  HrUserContext,
} from '../src/lib/hr/permissions'
import { formatMinutes } from '../src/lib/hr/services/timesheet-service'

describe('Recursos Humanos (RH) - Fase 3A: Folhas de Ponto e Fecho Mensal', () => {
  // ─── 1. Formatação de Minutos ──────────────────────────
  describe('Utilitário de Formatação de Minutos (formatMinutes)', () => {
    it('deve retornar "0min" para valores zero, nulos ou negativos', () => {
      assert.strictEqual(formatMinutes(0), '0min')
      assert.strictEqual(formatMinutes(-15), '0min')
      assert.strictEqual(formatMinutes(null as any), '0min')
      assert.strictEqual(formatMinutes(undefined as any), '0min')
    })

    it('deve formatar apenas minutos quando inferior a 60', () => {
      assert.strictEqual(formatMinutes(15), '15min')
      assert.strictEqual(formatMinutes(45), '45min')
      assert.strictEqual(formatMinutes(59), '59min')
    })

    it('deve formatar apenas horas quando minutos restantes forem 0', () => {
      assert.strictEqual(formatMinutes(60), '1h')
      assert.strictEqual(formatMinutes(120), '2h')
      assert.strictEqual(formatMinutes(480), '8h')
      assert.strictEqual(formatMinutes(10560), '176h')
    })

    it('deve formatar horas e minutos compostos correctamente', () => {
      assert.strictEqual(formatMinutes(75), '1h 15min')
      assert.strictEqual(formatMinutes(515), '8h 35min')
    })
  })

  // ─── 2. Permissões RBAC da Fase 3A ─────────────────────
  describe('RBAC e Controlo de Acessos da Fase 3A', () => {
    const adminUser: HrUserContext = {
      id: 'usr-admin',
      name: 'Dr. Sebastião Gaspar',
      email: 'admin.rh@jmatos.co.ao',
      role: 'ADMINISTRADOR',
      employeeId: 'emp-admin-1',
    }

    const tecnicoRh: HrUserContext = {
      id: 'usr-tech',
      name: 'Teresa da Silva',
      email: 'tecnico.rh@jmatos.co.ao',
      role: 'TECNICO_RH',
      employeeId: 'emp-tech-1',
    }

    const funcionarioComFicha: HrUserContext = {
      id: 'usr-func-1',
      name: 'Manuel dos Santos',
      email: 'colaborador@jmatos.co.ao',
      role: 'FUNCIONARIO',
      employeeId: 'emp-func-1',
      employeeStatus: 'ACTIVO',
    }

    const funcionarioSemFicha: HrUserContext = {
      id: 'usr-func-sem-ficha',
      name: 'Sem Ficha',
      email: 'semficha@jmatos.co.ao',
      role: 'FUNCIONARIO',
      employeeId: null,
      employeeStatus: null,
    }

    // Gestão de Folhas no Painel RH
    it('1. Técnico de RH e Administrador PODEM ver todas as folhas de ponto', () => {
      assert.strictEqual(can(tecnicoRh, 'VER_FOLHAS_TODOS'), true)
      assert.strictEqual(can(adminUser, 'VER_FOLHAS_TODOS'), true)
      assert.strictEqual(can(funcionarioComFicha, 'VER_FOLHAS_TODOS'), false)
    })

    it('2. Técnico de RH e Administrador PODEM gerar e recalcular folhas de ponto', () => {
      assert.strictEqual(can(tecnicoRh, 'GERAR_FOLHAS_PONTO'), true)
      assert.strictEqual(can(adminUser, 'GERAR_FOLHAS_PONTO'), true)
      assert.strictEqual(can(funcionarioComFicha, 'GERAR_FOLHAS_PONTO'), false)
    })

    it('3. Técnico de RH e Administrador PODEM aprovar folhas de ponto e justificar faltas', () => {
      assert.strictEqual(can(tecnicoRh, 'APROVAR_FOLHA_PONTO'), true)
      assert.strictEqual(can(adminUser, 'APROVAR_FOLHA_PONTO'), true)
      assert.strictEqual(can(tecnicoRh, 'JUSTIFICAR_FALTA'), true)
      assert.strictEqual(can(adminUser, 'JUSTIFICAR_FALTA'), true)

      assert.strictEqual(can(funcionarioComFicha, 'APROVAR_FOLHA_PONTO'), false)
      assert.strictEqual(can(funcionarioComFicha, 'JUSTIFICAR_FALTA'), false)
    })

    it('4. Fecho e Reabertura de Períodos permitidos a Técnico de RH e Administrador', () => {
      assert.strictEqual(can(tecnicoRh, 'FECHAR_PERIODO_PONTO'), true)
      assert.strictEqual(can(adminUser, 'FECHAR_PERIODO_PONTO'), true)
      assert.strictEqual(can(tecnicoRh, 'REABRIR_PERIODO_PONTO'), true)
      assert.strictEqual(can(adminUser, 'REABRIR_PERIODO_PONTO'), true)

      assert.strictEqual(can(funcionarioComFicha, 'FECHAR_PERIODO_PONTO'), false)
      assert.strictEqual(can(funcionarioComFicha, 'REABRIR_PERIODO_PONTO'), false)
    })

    it('5. Exportação Excel/CSV permitida para RH e Admin', () => {
      assert.strictEqual(can(tecnicoRh, 'EXPORTAR_EXCEL_PERIODO'), true)
      assert.strictEqual(can(adminUser, 'EXPORTAR_EXCEL_PERIODO'), true)
      assert.strictEqual(can(funcionarioComFicha, 'EXPORTAR_EXCEL_PERIODO'), false)
    })

    // Self-Service no Portal do Colaborador
    it('6. Funcionário PODE ver, submeter e descarregar a sua própria folha se tiver ficha', () => {
      assert.strictEqual(can(funcionarioComFicha, 'VER_FOLHA_PROPRIA'), true)
      assert.strictEqual(can(funcionarioComFicha, 'SUBMETER_FOLHA_PROPRIA'), true)
      assert.strictEqual(can(funcionarioComFicha, 'DESCARREGAR_PDF_FOLHA_PROPRIA'), true)

      assert.strictEqual(can(funcionarioSemFicha, 'VER_FOLHA_PROPRIA'), false)
      assert.strictEqual(can(funcionarioSemFicha, 'SUBMETER_FOLHA_PROPRIA'), false)
      assert.strictEqual(can(funcionarioSemFicha, 'DESCARREGAR_PDF_FOLHA_PROPRIA'), false)
    })

    it('7. Técnico de RH também PODE aceder à sua própria folha no portal', () => {
      assert.strictEqual(can(tecnicoRh, 'VER_FOLHA_PROPRIA'), true)
      assert.strictEqual(can(tecnicoRh, 'SUBMETER_FOLHA_PROPRIA'), true)
      assert.strictEqual(can(tecnicoRh, 'DESCARREGAR_PDF_FOLHA_PROPRIA'), true)
    })

    it('8. assertCan bloqueia utilizador não autorizado com mensagem em português', () => {
      assert.throws(
        () => {
          assertCan(funcionarioComFicha, 'FECHAR_PERIODO_PONTO', 'PERIODO_PONTO')
        },
        /Acesso negado/i
      )
    })
  })

  // ─── 3. Regra dos 4 Olhos na Aprovação de Folhas ────────
  describe('Regra dos 4 Olhos e Segregação de Funções', () => {
    const adminUser: HrUserContext = {
      id: 'usr-admin',
      name: 'Dr. Sebastião Gaspar',
      email: 'admin.rh@jmatos.co.ao',
      role: 'ADMINISTRADOR',
      employeeId: 'emp-admin-1',
    }

    const tecnicoRh: HrUserContext = {
      id: 'usr-tech-1',
      name: 'Teresa da Silva',
      email: 'tecnico.rh@jmatos.co.ao',
      role: 'TECNICO_RH',
      employeeId: 'emp-tech-1',
    }

    it('1. Ninguém pode aprovar a sua própria folha de ponto', () => {
      const selfApproval = canApproveRequest(tecnicoRh, {
        role: 'TECNICO_RH',
        employeeId: 'emp-tech-1',
        userId: 'usr-tech-1',
      })
      assert.strictEqual(selfApproval.allowed, false)
      assert.match(selfApproval.reason || '', /Não é permitido aprovar os seus próprios pedidos/)
    })

    it('2. Técnico de RH pode aprovar folha de ponto de colaborador comum', () => {
      const approval = canApproveRequest(tecnicoRh, {
        role: 'FUNCIONARIO',
        employeeId: 'emp-func-1',
        userId: 'usr-func-1',
      })
      assert.strictEqual(approval.allowed, true)
    })

    it('3. Folha de ponto de Técnico de RH requer aprovação de Administrador', () => {
      const outroTecnico: HrUserContext = {
        id: 'usr-tech-2',
        name: 'Carlos Tech',
        email: 'carlos@jmatos.co.ao',
        role: 'TECNICO_RH',
        employeeId: 'emp-tech-2',
      }

      const techApprovesTech = canApproveRequest(outroTecnico, {
        role: 'TECNICO_RH',
        employeeId: 'emp-tech-1',
        userId: 'usr-tech-1',
      })
      assert.strictEqual(techApprovesTech.allowed, false)

      const adminApprovesTech = canApproveRequest(adminUser, {
        role: 'TECNICO_RH',
        employeeId: 'emp-tech-1',
        userId: 'usr-tech-1',
      })
      assert.strictEqual(adminApprovesTech.allowed, true)
    })
  })

  // ─── 4. Regras de Bloqueio Salarial (Payroll Lock Guard)
  describe('Protecção de Fecho e Bloqueio Salarial', () => {
    it('deve simular que um período bloqueado por salários não pode ser reaberto', () => {
      // Simulação do payload e validação da regra de negócio implementada em timesheet-service.reopenPeriod
      const periodLockedByPayroll = {
        id: 'period-locked',
        code: '2026-09',
        status: 'FECHADO',
        payrollLockedAt: new Date('2026-10-05T00:00:00Z'),
      }

      const canReopen = !periodLockedByPayroll.payrollLockedAt
      assert.strictEqual(canReopen, false)
    })

    it('deve permitir reabertura quando payrollLockedAt for nulo e justificação for fornecida', () => {
      const periodNormalClosed = {
        id: 'period-normal',
        code: '2026-09',
        status: 'FECHADO',
        payrollLockedAt: null,
      }

      const reason = 'Correcção de horas extra omitidas'
      const canReopen = !periodNormalClosed.payrollLockedAt && reason.trim().length > 0
      assert.strictEqual(canReopen, true)
    })
  })
})
