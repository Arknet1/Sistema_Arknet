import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  can,
  assertCan,
  HrUserContext,
} from '../src/lib/hr/permissions'
import {
  calculateAngolaIrt,
  calculateAngolaInss,
  ANGOLA_FOOD_ALLOWANCE_EXEMPTION,
  ANGOLA_TRANSPORT_ALLOWANCE_EXEMPTION,
} from '../src/lib/hr/services/payroll-service'

describe('Recursos Humanos (RH) - Fase 4: Processamento Salarial & Payroll Angola', () => {
  // ─── 1. Motor de Cálculo de IRT (Lei n.º 28/20) ──────────────────────────
  describe('Cálculo do IRT de Angola (Código do IRT - Grupo A)', () => {
    it('deve isentar rendimentos até 100.000 Kz (Taxa 0%)', () => {
      const res0 = calculateAngolaIrt(0)
      assert.strictEqual(res0.tax, 0)
      assert.strictEqual(res0.marginalRate, 0)
      assert.strictEqual(res0.effectiveRate, 0)

      const res70k = calculateAngolaIrt(70000)
      assert.strictEqual(res70k.tax, 0)
      assert.strictEqual(res70k.marginalRate, 0)

      const res100k = calculateAngolaIrt(100000)
      assert.strictEqual(res100k.tax, 0)
      assert.strictEqual(res100k.marginalRate, 0)
    })

    it('deve calcular escalão de 100.001 a 150.000 Kz (13% sobre o excesso)', () => {
      // Base: 120.000 Kz -> Excesso: 20.000 Kz -> 13% = 2.600 Kz
      const res = calculateAngolaIrt(120000)
      assert.strictEqual(res.tax, 2600)
      assert.strictEqual(res.marginalRate, 13)
      assert.strictEqual(res.effectiveRate, 2.17) // 2600 / 120000 = 2.166...% -> 2.17%
    })

    it('deve calcular escalão de 150.001 a 200.000 Kz (6.500 Kz + 16%)', () => {
      // Base: 180.000 Kz -> Parcela fixa: 6.500 Kz + 16% de 30.000 Kz (4.800 Kz) = 11.300 Kz
      const res = calculateAngolaIrt(180000)
      assert.strictEqual(res.tax, 11300)
      assert.strictEqual(res.marginalRate, 16)
      assert.strictEqual(res.effectiveRate, 6.28)
    })

    it('deve calcular escalão de 200.001 a 300.000 Kz (14.500 Kz + 18%)', () => {
      // Base: 250.000 Kz -> Parcela fixa: 14.500 Kz + 18% de 50.000 Kz (9.000 Kz) = 23.500 Kz
      const res = calculateAngolaIrt(250000)
      assert.strictEqual(res.tax, 23500)
      assert.strictEqual(res.marginalRate, 18)
      assert.strictEqual(res.effectiveRate, 9.4)
    })

    it('deve calcular escalão de 500.001 a 1.000.000 Kz (70.500 Kz + 20%)', () => {
      // Base: 800.000 Kz -> Parcela fixa: 70.500 Kz + 20% de 300.000 Kz (60.000 Kz) = 130.500 Kz
      const res = calculateAngolaIrt(800000)
      assert.strictEqual(res.tax, 130500)
      assert.strictEqual(res.marginalRate, 20)
    })

    it('deve calcular escalão superior a 3.000.000 Kz (620.500 Kz + 25%)', () => {
      // Base: 4.000.000 Kz -> Parcela fixa: 620.500 Kz + 25% de 1.000.000 Kz (250.000 Kz) = 870.500 Kz
      const res = calculateAngolaIrt(4000000)
      assert.strictEqual(res.tax, 870500)
      assert.strictEqual(res.marginalRate, 25)
    })
  })

  // ─── 2. Motor de Cálculo de INSS (Decreto Presidencial n.º 227/18) ──────
  describe('Cálculo da Segurança Social de Angola (INSS - 3% + 8%)', () => {
    it('deve calcular exactamente 3% para o trabalhador e 8% para a entidade patronal', () => {
      // Base: 200.000 Kz
      const res = calculateAngolaInss(200000)
      assert.strictEqual(res.workerInss, 6000)
      assert.strictEqual(res.companyInss, 16000)
      assert.strictEqual(res.totalInss, 22000)
    })

    it('deve manter proporcionalidade para valores decimais com arredondamento seguro', () => {
      // Base: 153.250 Kz
      const res = calculateAngolaInss(153250)
      assert.strictEqual(res.workerInss, 4597.5)
      assert.strictEqual(res.companyInss, 12260)
      assert.strictEqual(res.totalInss, 16857.5)
    })
  })

  // ─── 3. Limites de Isenção de Subsídios ──────────────────────────────────
  describe('Limites Legais de Isenção de Subsídios', () => {
    it('deve respeitar os limites fiscais de isenção de alimentação e transporte', () => {
      assert.strictEqual(ANGOLA_FOOD_ALLOWANCE_EXEMPTION, 30000)
      assert.strictEqual(ANGOLA_TRANSPORT_ALLOWANCE_EXEMPTION, 30000)
    })
  })

  // ─── 4. RBAC e Permissões da Fase 4 & 5 ─────────────────────────────────
  describe('Controlo de Acesso RBAC para Salários e Declarações Oficiais', () => {
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

    it('1. Técnico de RH e Administrador PODEM ver, processar, aprovar e pagar salários', () => {
      assert.strictEqual(can(adminUser, 'VER_SALARIOS_TODOS'), true)
      assert.strictEqual(can(adminUser, 'PROCESSAR_SALARIOS'), true)
      assert.strictEqual(can(adminUser, 'APROVAR_SALARIOS'), true)
      assert.strictEqual(can(adminUser, 'PAGAR_SALARIOS'), true)

      assert.strictEqual(can(tecnicoRh, 'VER_SALARIOS_TODOS'), true)
      assert.strictEqual(can(tecnicoRh, 'PROCESSAR_SALARIOS'), true)
      assert.strictEqual(can(tecnicoRh, 'APROVAR_SALARIOS'), true)
      assert.strictEqual(can(tecnicoRh, 'PAGAR_SALARIOS'), true)
    })

    it('2. Técnico de RH e Administrador PODEM exportar ficheiros bancários, mapa INSS e AGT', () => {
      assert.strictEqual(can(adminUser, 'EXPORTAR_FICHEIRO_BANCARIO'), true)
      assert.strictEqual(can(adminUser, 'EXPORTAR_MAPA_INSS'), true)
      assert.strictEqual(can(adminUser, 'EXPORTAR_MAPA_AGT'), true)

      assert.strictEqual(can(tecnicoRh, 'EXPORTAR_FICHEIRO_BANCARIO'), true)
      assert.strictEqual(can(tecnicoRh, 'EXPORTAR_MAPA_INSS'), true)
      assert.strictEqual(can(tecnicoRh, 'EXPORTAR_MAPA_AGT'), true)
    })

    it('3. Funcionário NÃO PODE aceder à gestão de salários nem a ficheiros oficiais', () => {
      assert.strictEqual(can(funcionario, 'VER_SALARIOS_TODOS'), false)
      assert.strictEqual(can(funcionario, 'PROCESSAR_SALARIOS'), false)
      assert.strictEqual(can(funcionario, 'APROVAR_SALARIOS'), false)
      assert.strictEqual(can(funcionario, 'PAGAR_SALARIOS'), false)
      assert.strictEqual(can(funcionario, 'EXPORTAR_FICHEIRO_BANCARIO'), false)
      assert.strictEqual(can(funcionario, 'EXPORTAR_MAPA_INSS'), false)
      assert.strictEqual(can(funcionario, 'EXPORTAR_MAPA_AGT'), false)

      // Mas PODE ver e descarregar o seu próprio recibo
      assert.strictEqual(can(funcionario, 'VER_RECIBO_PROPRIO'), true)
      assert.strictEqual(can(funcionario, 'DESCARREGAR_RECIBO_PROPRIO'), true)
    })

    it('4. assertCan protege acções e lança erro amigável em português', () => {
      assert.throws(
        () => assertCan(funcionario, 'PROCESSAR_SALARIOS'),
        /Acesso negado/
      )
      assert.throws(
        () => assertCan(funcionario, 'EXPORTAR_MAPA_AGT'),
        /Acesso negado/
      )
    })
  })
})
