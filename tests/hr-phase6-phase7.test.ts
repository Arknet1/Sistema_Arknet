import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  can,
  assertCan,
  HrUserContext,
} from '../src/lib/hr/permissions'

describe('Recursos Humanos (RH) - Fase 6 & 7: Desempenho, Formação e Recrutamento ATS', () => {
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

  const funcionario: HrUserContext = {
    id: 'usr-func-1',
    name: 'Manuel dos Santos',
    email: 'manuel.santos@jmatos.co.ao',
    role: 'FUNCIONARIO',
    employeeId: 'emp-func-1',
  }

  // ─── 1. Fase 6: Avaliação de Desempenho e Formação ───────────────────────
  describe('Fase 6: RBAC de Avaliação de Desempenho e Formação', () => {
    it('1. Técnico de RH e Administrador PODEM gerir ciclos e avaliar colaboradores', () => {
      assert.strictEqual(can(adminUser, 'VER_DESEMPENHO_TODOS'), true)
      assert.strictEqual(can(adminUser, 'GERIR_CICLOS_DESEMPENHO'), true)
      assert.strictEqual(can(adminUser, 'AVALIAR_COLABORADOR'), true)
      assert.strictEqual(can(adminUser, 'VER_FORMACAO_TODOS'), true)
      assert.strictEqual(can(adminUser, 'GERIR_CERTIFICACOES'), true)

      assert.strictEqual(can(tecnicoRh, 'VER_DESEMPENHO_TODOS'), true)
      assert.strictEqual(can(tecnicoRh, 'GERIR_CICLOS_DESEMPENHO'), true)
      assert.strictEqual(can(tecnicoRh, 'AVALIAR_COLABORADOR'), true)
      assert.strictEqual(can(tecnicoRh, 'VER_FORMACAO_TODOS'), true)
      assert.strictEqual(can(tecnicoRh, 'GERIR_CERTIFICACOES'), true)
    })

    it('2. Funcionário comum NÃO PODE gerir ciclos nem avaliar outros colaboradores', () => {
      assert.strictEqual(can(funcionario, 'VER_DESEMPENHO_TODOS'), false)
      assert.strictEqual(can(funcionario, 'GERIR_CICLOS_DESEMPENHO'), false)
      assert.strictEqual(can(funcionario, 'AVALIAR_COLABORADOR'), false)
      assert.strictEqual(can(funcionario, 'VER_FORMACAO_TODOS'), false)
      assert.strictEqual(can(funcionario, 'GERIR_CERTIFICACOES'), false)
    })

    it('3. Funcionário com ficha PODE submeter a sua própria auto-avaliação', () => {
      assert.strictEqual(can(funcionario, 'VER_AUTO_AVALIACAO'), true)
      assert.strictEqual(can(funcionario, 'SUBMETER_AUTO_AVALIACAO'), true)
    })

    it('4. assertCan bloqueia funcionário a tentar gerir ciclos ou avaliar colegas', () => {
      assert.throws(
        () => assertCan(funcionario, 'GERIR_CICLOS_DESEMPENHO'),
        /Acesso negado/
      )
      assert.throws(
        () => assertCan(funcionario, 'AVALIAR_COLABORADOR'),
        /Acesso negado/
      )
    })
  })

  // ─── 2. Fase 7: Recrutamento & Admissão Integrada (ATS) ─────────────────
  describe('Fase 7: RBAC de Recrutamento e Admissão ATS', () => {
    it('1. Técnico de RH e Administrador PODEM ver vagas, gerir candidatos e admitir', () => {
      assert.strictEqual(can(adminUser, 'VER_RECRUTAMENTO'), true)
      assert.strictEqual(can(adminUser, 'GERIR_VAGAS'), true)
      assert.strictEqual(can(adminUser, 'GERIR_CANDIDATOS'), true)
      assert.strictEqual(can(adminUser, 'ADMITIR_CANDIDATO'), true)

      assert.strictEqual(can(tecnicoRh, 'VER_RECRUTAMENTO'), true)
      assert.strictEqual(can(tecnicoRh, 'GERIR_VAGAS'), true)
      assert.strictEqual(can(tecnicoRh, 'GERIR_CANDIDATOS'), true)
      assert.strictEqual(can(tecnicoRh, 'ADMITIR_CANDIDATO'), true)
    })

    it('2. Funcionário comum é COMPLETAMENTE BLOQUEADO na área de recrutamento', () => {
      assert.strictEqual(can(funcionario, 'VER_RECRUTAMENTO'), false)
      assert.strictEqual(can(funcionario, 'GERIR_VAGAS'), false)
      assert.strictEqual(can(funcionario, 'GERIR_CANDIDATOS'), false)
      assert.strictEqual(can(funcionario, 'ADMITIR_CANDIDATO'), false)
    })

    it('3. assertCan impede que funcionário execute admissão de candidatos', () => {
      assert.throws(
        () => assertCan(funcionario, 'ADMITIR_CANDIDATO'),
        /Acesso negado/
      )
      assert.throws(
        () => assertCan(funcionario, 'GERIR_VAGAS'),
        /Acesso negado/
      )
    })
  })
})
