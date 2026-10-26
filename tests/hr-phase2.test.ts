import { describe, it } from 'node:test'
import assert from 'node:assert'
import { calculateDistanceMeters, isWithinLocationRadius } from '../src/lib/hr/services/geo-service'
import {
  can,
  assertCan,
  canApproveRequest,
  HrUserContext,
} from '../src/lib/hr/permissions'

describe('Recursos Humanos (RH) - Fase 2: Ponto e Ausências (Geofencing & Segurança)', () => {
  // Testes de Geofencing (Haversine)
  describe('Cálculo de Geofencing (Haversine)', () => {
    // Sede Luanda - Garden Towers: -8.8271, 13.2439
    const sedeCoord = { latitude: -8.8271, longitude: 13.2439 }

    it('deve retornar 0 metros para o mesmo ponto exato', () => {
      const dist = calculateDistanceMeters(sedeCoord, sedeCoord)
      assert.strictEqual(Math.round(dist), 0)
    })

    it('deve validar coordenada dentro de um raio de 150 metros', () => {
      // Coordenada deslocada em aprox. 30 metros
      const userCoord = { latitude: -8.8273, longitude: 13.2440 }
      const res = isWithinLocationRadius(userCoord, sedeCoord, 150)
      assert.strictEqual(res.isWithin, true)
      assert.ok(res.distanceMeters < 150)
    })

    it('deve rejeitar coordenada fora do raio (ex: Talatona vs Sede Luanda, ~12km)', () => {
      const talatonaCoord = { latitude: -8.9172, longitude: 13.1895 }
      const res = isWithinLocationRadius(talatonaCoord, sedeCoord, 150)
      assert.strictEqual(res.isWithin, false)
      assert.ok(res.distanceMeters > 10000)
    })

    it('deve considerar precisão (accuracy) na tolerância máxima permitida', () => {
      // Ponto a 160 metros de distância com raio de 150 e precisão de 20m
      const slightlyFarCoord = { latitude: -8.8285, longitude: 13.2439 }
      const resWithoutAccuracy = isWithinLocationRadius(slightlyFarCoord, sedeCoord, 150, 0)
      const resWithAccuracy = isWithinLocationRadius(slightlyFarCoord, sedeCoord, 150, 30)
      assert.strictEqual(resWithoutAccuracy.isWithin, false)
      assert.strictEqual(resWithAccuracy.isWithin, true)
    })
  })

  // Testes de RBAC e Regras de Negócio da Fase 2
  describe('RBAC e Regras de Negócio da Fase 2', () => {
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

    const funcionario1: HrUserContext = {
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

    it('1. Funcionário PODE marcar o seu próprio ponto se tiver ficha ligada', () => {
      assert.strictEqual(can(funcionario1, 'MARCAR_PONTO_PROPRIO'), true)
      assert.strictEqual(can(funcionarioSemFicha, 'MARCAR_PONTO_PROPRIO'), false)
    })

    it('2. Funcionário NÃO PODE registar ponto manual no painel RH', () => {
      assert.strictEqual(can(funcionario1, 'REGISTAR_PONTO_MANUAL_RH'), false)
    })

    it('3. Técnico de RH e Administrador PODEM registar ponto manual no painel RH', () => {
      assert.strictEqual(can(tecnicoRh, 'REGISTAR_PONTO_MANUAL_RH'), true)
      assert.strictEqual(can(adminUser, 'REGISTAR_PONTO_MANUAL_RH'), true)
    })

    it('4. Funcionário PODE pedir ausência para si próprio', () => {
      assert.strictEqual(can(funcionario1, 'PEDIR_AUSENCIA'), true)
      assert.strictEqual(can(funcionarioSemFicha, 'PEDIR_AUSENCIA'), false)
    })

    it('5. Funcionário NÃO PODE aprovar pedidos de ausência ou correcção de ponto', () => {
      assert.strictEqual(can(funcionario1, 'APROVAR_AUSENCIA'), false)
      assert.strictEqual(can(funcionario1, 'APROVAR_CORRECAO_PONTO'), false)
      assert.strictEqual(can(funcionario1, 'APROVAR_HORAS_EXTRA'), false)
    })

    it('6. Técnico de RH PODE aprovar pedidos de ausência e correcção de funcionários comuns', () => {
      assert.strictEqual(can(tecnicoRh, 'APROVAR_AUSENCIA'), true)
      assert.strictEqual(can(tecnicoRh, 'APROVAR_CORRECAO_PONTO'), true)
      assert.strictEqual(can(tecnicoRh, 'APROVAR_HORAS_EXTRA'), true)

      const approval = canApproveRequest(tecnicoRh, {
        role: 'FUNCIONARIO',
        employeeId: 'emp-func-1',
        userId: 'usr-func-1',
      })
      assert.strictEqual(approval.allowed, true)
    })

    it('7. Regra dos 4 Olhos: Ninguém pode aprovar o seu próprio pedido', () => {
      const ownApproval = canApproveRequest(tecnicoRh, {
        role: 'TECNICO_RH',
        employeeId: 'emp-tech-1',
        userId: 'usr-tech',
      })
      assert.strictEqual(ownApproval.allowed, false)
      assert.match(ownApproval.reason || '', /Não é permitido aprovar os seus próprios pedidos/)
    })

    it('8. Regra Hierárquica: Pedidos de Técnico de RH exigem aprovação de Administrador', () => {
      // Outro técnico não pode aprovar
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
        userId: 'usr-tech',
      })
      assert.strictEqual(techApprovesTech.allowed, false)

      // Administrador pode aprovar
      const adminApprovesTech = canApproveRequest(adminUser, {
        role: 'TECNICO_RH',
        employeeId: 'emp-tech-1',
        userId: 'usr-tech',
      })
      assert.strictEqual(adminApprovesTech.allowed, true)
    })

    it('9. Administrador e Técnico de RH PODEM configurar regras de ponto e ausências', () => {
      assert.strictEqual(can(adminUser, 'CONFIGURAR_PONTO_AUSENCIAS'), true)
      assert.strictEqual(can(tecnicoRh, 'CONFIGURAR_PONTO_AUSENCIAS'), true)
      assert.strictEqual(can(funcionario1, 'CONFIGURAR_PONTO_AUSENCIAS'), false)
    })

    it('10. assertCan lança erro em acção proibida da Fase 2', () => {
      assert.throws(
        () => {
          assertCan(funcionario1, 'APROVAR_AUSENCIA', 'PEDIDO_AUSENCIA')
        },
        /Acesso negado/i
      )
    })
  })
})
