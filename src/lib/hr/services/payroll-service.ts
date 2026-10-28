import { PrismaClient, Prisma } from '@prisma/client'
import { HrUserContext, assertCan } from '../permissions'
import { logAudit } from '../audit'
import { prisma } from '@/lib/prisma'

// ──────────────────────────────────────────────────────────────
// 1. MOTORES DE CÁLCULO FISCAL E CONTRIBUTIVO DE ANGOLA
// ──────────────────────────────────────────────────────────────

export interface IrtCalculationResult {
  taxableBase: number
  tax: number
  effectiveRate: number
  marginalRate: number
  bracketLabel: string
}

/**
 * Cálculo de IRT (Imposto sobre o Rendimento do Trabalho) de Angola
 * Lei n.º 28/20 (Código do IRT — Tabela do Grupo A)
 */
export function calculateAngolaIrt(taxableBase: number): IrtCalculationResult {
  if (taxableBase <= 100000) {
    return {
      taxableBase,
      tax: 0,
      effectiveRate: 0,
      marginalRate: 0,
      bracketLabel: 'Até 100.000 Kz (Isento)',
    }
  }

  let tax = 0
  let marginalRate = 0
  let bracketLabel = ''

  if (taxableBase <= 150000) {
    // 100.001 a 150.000 Kz: 13% sobre excesso de 100.000
    tax = (taxableBase - 100000) * 0.13
    marginalRate = 13
    bracketLabel = '100.001 Kz a 150.000 Kz (13%)'
  } else if (taxableBase <= 200000) {
    // 150.001 a 200.000 Kz: 6.500 Kz + 16% sobre excesso de 150.000
    tax = 6500 + (taxableBase - 150000) * 0.16
    marginalRate = 16
    bracketLabel = '150.001 Kz a 200.000 Kz (6.500 Kz + 16%)'
  } else if (taxableBase <= 300000) {
    // 200.001 a 300.000 Kz: 14.500 Kz + 18% sobre excesso de 200.000
    tax = 14500 + (taxableBase - 200000) * 0.18
    marginalRate = 18
    bracketLabel = '200.001 Kz a 300.000 Kz (14.500 Kz + 18%)'
  } else if (taxableBase <= 500000) {
    // 300.001 a 500.000 Kz: 32.500 Kz + 19% sobre excesso de 300.000
    tax = 32500 + (taxableBase - 300000) * 0.19
    marginalRate = 19
    bracketLabel = '300.001 Kz a 500.000 Kz (32.500 Kz + 19%)'
  } else if (taxableBase <= 1000000) {
    // 500.001 a 1.000.000 Kz: 70.500 Kz + 20% sobre excesso de 500.000
    tax = 70500 + (taxableBase - 500000) * 0.20
    marginalRate = 20
    bracketLabel = '500.001 Kz a 1.000.000 Kz (70.500 Kz + 20%)'
  } else if (taxableBase <= 1500000) {
    // 1.000.001 a 1.500.000 Kz: 170.500 Kz + 21% sobre excesso de 1.000.000
    tax = 170500 + (taxableBase - 1000000) * 0.21
    marginalRate = 21
    bracketLabel = '1.000.001 Kz a 1.500.000 Kz (170.500 Kz + 21%)'
  } else if (taxableBase <= 2000000) {
    // 1.500.001 a 2.000.000 Kz: 275.500 Kz + 22% sobre excesso de 1.500.000
    tax = 275500 + (taxableBase - 1500000) * 0.22
    marginalRate = 22
    bracketLabel = '1.500.001 Kz a 2.000.000 Kz (275.500 Kz + 22%)'
  } else if (taxableBase <= 2500000) {
    // 2.000.001 a 2.500.000 Kz: 385.500 Kz + 23% sobre excesso de 2.000.000
    tax = 385500 + (taxableBase - 2000000) * 0.23
    marginalRate = 23
    bracketLabel = '2.000.001 Kz a 2.500.000 Kz (385.500 Kz + 23%)'
  } else if (taxableBase <= 3000000) {
    // 2.500.001 a 3.000.000 Kz: 500.500 Kz + 24% sobre excesso de 2.500.000
    tax = 500500 + (taxableBase - 2500000) * 0.24
    marginalRate = 24
    bracketLabel = '2.500.001 Kz a 3.000.000 Kz (500.500 Kz + 24%)'
  } else {
    // Superior a 3.000.000 Kz: 620.500 Kz + 25% sobre excesso de 3.000.000
    tax = 620500 + (taxableBase - 3000000) * 0.25
    marginalRate = 25
    bracketLabel = 'Superior a 3.000.000 Kz (620.500 Kz + 25%)'
  }

  // Arredondamento para 2 casas decimais
  tax = Math.round(tax * 100) / 100
  const effectiveRate = taxableBase > 0 ? Math.round((tax / taxableBase) * 10000) / 100 : 0

  return {
    taxableBase,
    tax,
    effectiveRate,
    marginalRate,
    bracketLabel: bracketLabel || 'Tabela Geral do IRT',
  }
}

export interface InssCalculationResult {
  subjectBase: number
  workerInss: number   // 3%
  companyInss: number  // 8%
  totalInss: number    // 11%
}

/**
 * Cálculo de Segurança Social (INSS Angola — Decreto Presidencial n.º 227/18)
 * 3% a cargo do trabalhador + 8% a cargo da entidade empregadora.
 */
export function calculateAngolaInss(subjectBase: number): InssCalculationResult {
  const workerInss = Math.round(subjectBase * 0.03 * 100) / 100
  const companyInss = Math.round(subjectBase * 0.08 * 100) / 100
  const totalInss = Math.round((workerInss + companyInss) * 100) / 100

  return {
    subjectBase,
    workerInss,
    companyInss,
    totalInss,
  }
}

// Limites legais de isenção de subsídios em Angola (Kz por mês)
export const ANGOLA_FOOD_ALLOWANCE_EXEMPTION = 30000
export const ANGOLA_TRANSPORT_ALLOWANCE_EXEMPTION = 30000

// ──────────────────────────────────────────────────────────────
// 2. SERVIÇO DE PROCESSAMENTO SALARIAL
// ──────────────────────────────────────────────────────────────

/**
 * Processa a folha de salários para um período mensal.
 * Consome os totais consolidados da folha de ponto (Fase 3A) e gera os recibos.
 */
export async function processPayrollPeriod(periodCode: string, actor: HrUserContext) {
  assertCan(actor, 'PROCESSAR_SALARIOS')

  // 1. Obter período de ponto correspondente
  const timesheetPeriod = await (prisma as any).hrTimesheetPeriod.findUnique({
    where: { code: periodCode },
    include: {
      timesheets: {
        include: {
          employee: {
            include: {
              contracts: {
                where: { status: 'ACTIVO' },
                orderBy: { startDate: 'desc' },
                take: 1,
              },
            },
          },
        },
      },
    },
  })

  if (!timesheetPeriod) {
    throw new Error(`Período de ponto ${periodCode} não encontrado. É necessário fechar ou validar o ponto primeiro.`)
  }

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(periodCode)) {
    throw new Error('O período salarial deve usar o formato AAAA-MM com um mês entre 01 e 12.')
  }
  const [year, month] = periodCode.split('-').map(Number)

  return await prisma.$transaction(async (tx) => {
    const existingPayroll = await (tx as any).hrPayrollPeriod.findUnique({
      where: { code: periodCode },
    })

    // Recibos já processados são registos financeiros. Não os apagar ou substituir
    // implicitamente; uma correcção precisa de um fluxo explícito e auditável.
    if (existingPayroll && existingPayroll.status !== 'RASCUNHO') {
      throw new Error(
        `A folha ${periodCode} já existe no estado "${existingPayroll.status}". Não é seguro reprocessar ou substituir recibos existentes.`
      )
    }
    if (existingPayroll) {
      const existingPayslips = await (tx as any).hrPayslip.count({ where: { payrollPeriodId: existingPayroll.id } })
      if (existingPayslips > 0) {
        throw new Error(`A folha ${periodCode} já contém recibos. Reprocessamento automático bloqueado para preservar o histórico.`)
      }
    }

    // 2. Criar ou actualizar o cabeçalho do período de salários
    const payrollPeriod = await (tx as any).hrPayrollPeriod.upsert({
      where: { code: periodCode },
      update: {
        status: 'PROCESSADO',
        processedAt: new Date(),
        processedById: actor.id,
        processedByName: actor.name || actor.email,
      },
      create: {
        timesheetPeriodId: timesheetPeriod.id,
        code: periodCode,
        year,
        month,
        status: 'PROCESSADO',
        processedAt: new Date(),
        processedById: actor.id,
        processedByName: actor.name || actor.email,
      },
    })

    let totalGross = 0
    let totalNet = 0
    let totalInssWorker = 0
    let totalInssCompany = 0
    let totalIrt = 0
    let employeeCount = 0

    // 3. Processar cada colaborador
    for (const ts of timesheetPeriod.timesheets) {
      const employee = ts.employee
      const contract = employee.contracts[0]

      // Salário base mensal contratual
      const baseSalary = contract ? Number(contract.baseSalary) : (Number((employee as any).baseSalary) || 0)
      if (baseSalary <= 0) continue

      employeeCount++
      const dailyHours = contract ? Number(contract.dailyHours) : 8.0
      const expectedDays = ts.expectedWorkDays || 22
      const hourlyRate = baseSalary / (expectedDays * dailyHours)

      // A. Desconto de Faltas Injustificadas: (Salário Base / 30) * faltas
      const unjustifiedAbsences = ts.unjustifiedAbsenceDays || 0
      const absenceDeduction = Math.round(((baseSalary / 30) * unjustifiedAbsences) * 100) / 100

      // B. Horas Extraordinárias
      const overtimeMinutes = ts.approvedOvertimeMinutes || 0
      const overtimeHours = Math.round((overtimeMinutes / 60) * 100) / 100
      // 1.5x valor da hora normal (LGT de Angola)
      const overtimePay = Math.round((overtimeHours * hourlyRate * 1.5) * 100) / 100

      // C. Subsídios Padrão
      const foodAllowance = 35000 // 35.000 Kz (30.000 Kz isento, 5.000 Kz sujeito)
      const transportAllowance = 30000 // 30.000 Kz (totalmente isento)
      const holidayAllowance = (ts.paidLeaveDays || 0) > 0 ? Math.round((baseSalary * 0.5) * 100) / 100 : 0
      const christmasAllowance = month === 12 ? Math.round((baseSalary * 0.5) * 100) / 100 : 0
      const familyAllowance = 0
      const otherAllowances = 0

      // D. Salário Ilíquido Total (Bruto)
      const grossSalary = Math.round(
        (baseSalary - absenceDeduction + overtimePay + foodAllowance + transportAllowance + holidayAllowance + christmasAllowance) * 100
      ) / 100

      // E. Matéria Colectável para INSS (Remuneração sujeita)
      // Exclui parcelas isentas de alimentação e transporte
      const foodTaxable = Math.max(0, foodAllowance - ANGOLA_FOOD_ALLOWANCE_EXEMPTION)
      const transportTaxable = Math.max(0, transportAllowance - ANGOLA_TRANSPORT_ALLOWANCE_EXEMPTION)
      const taxableBaseInss = Math.round(
        (baseSalary - absenceDeduction + overtimePay + foodTaxable + transportTaxable + holidayAllowance + christmasAllowance) * 100
      ) / 100

      const inss = calculateAngolaInss(taxableBaseInss)

      // F. Matéria Colectável para IRT: (Remuneração Sujeita - 3% do INSS)
      const taxableBaseIrt = Math.max(0, Math.round((taxableBaseInss - inss.workerInss) * 100) / 100)
      const irt = calculateAngolaIrt(taxableBaseIrt)

      // G. Deduções Totais e Salário Líquido
      const otherDeductions = 0
      const totalDeductions = Math.round((inss.workerInss + irt.tax + otherDeductions) * 100) / 100
      const netSalary = Math.round((grossSalary - totalDeductions) * 100) / 100

      // Acumuladores do período
      totalGross += grossSalary
      totalNet += netSalary
      totalInssWorker += inss.workerInss
      totalInssCompany += inss.companyInss
      totalIrt += irt.tax

      // Número do Recibo: REC-AAAA-MM-NUM (ex: REC-2026-10-001)
      const numSeq = String(employeeCount).padStart(3, '0')
      const payslipNumber = `REC-${periodCode}-${numSeq}`

      // H. Criar Recibo de Vencimento
      const payslip = await (tx as any).hrPayslip.create({
        data: {
          payrollPeriodId: payrollPeriod.id,
          employeeId: employee.id,
          timesheetId: ts.id,
          contractId: contract?.id || null,
          status: 'PROCESSADO',
          payslipNumber,
          baseSalary,
          dailyHours,
          hourlyRate: Math.round(hourlyRate * 100) / 100,
          expectedWorkDays: expectedDays,
          workedDays: ts.workedDays || expectedDays,
          unjustifiedAbsences,
          absenceDeduction,
          overtimeMinutes,
          overtimePay,
          foodAllowance,
          transportAllowance,
          holidayAllowance,
          christmasAllowance,
          familyAllowance,
          otherAllowances,
          grossSalary,
          taxableBaseInss,
          inssWorker: inss.workerInss,
          inssCompany: inss.companyInss,
          taxableBaseIrt,
          irtTax: irt.tax,
          otherDeductions,
          totalDeductions,
          netSalary,
          paymentMethod: 'TRANSFERENCIA',
          bankName: employee.bankName || 'BFA',
          bankIban: employee.bankIban || null,
          bankAccountNumber: employee.bankAccountNumber || null,
        },
      })

      // I. Linhas do Recibo (Itens descritivos)
      const items = [
        { code: 'BASE', description: 'Vencimento Base Mensal', type: 'VENCIMENTO', amount: baseSalary, isTaxableIrt: true, isTaxableInss: true, order: 1 },
      ]

      if (absenceDeduction > 0) {
        items.push({
          code: 'FALTAS',
          description: `Desconto de Faltas Injustificadas (${unjustifiedAbsences} dia(s))`,
          type: 'DESCONTO',
          amount: absenceDeduction,
          isTaxableIrt: true,
          isTaxableInss: true,
          order: 2,
        })
      }

      if (overtimePay > 0) {
        items.push({
          code: 'HORAS_EXTRA',
          description: `Horas Extraordinárias (${overtimeHours}h a 150%)`,
          type: 'VENCIMENTO',
          amount: overtimePay,
          isTaxableIrt: true,
          isTaxableInss: true,
          order: 3,
        })
      }

      if (foodAllowance > 0) {
        items.push({
          code: 'SUB_ALIMENTACAO',
          description: `Subsídio de Alimentação (Isento até ${ANGOLA_FOOD_ALLOWANCE_EXEMPTION.toLocaleString('pt-AO')} Kz)`,
          type: 'VENCIMENTO',
          amount: foodAllowance,
          isTaxableIrt: foodTaxable > 0,
          isTaxableInss: foodTaxable > 0,
          order: 4,
        })
      }

      if (transportAllowance > 0) {
        items.push({
          code: 'SUB_TRANSPORTE',
          description: `Subsídio de Transporte (Isento)`,
          type: 'VENCIMENTO',
          amount: transportAllowance,
          isTaxableIrt: false,
          isTaxableInss: false,
          order: 5,
        })
      }

      if (holidayAllowance > 0) {
        items.push({
          code: 'SUB_FERIAS',
          description: 'Subsídio de Férias (50% Base)',
          type: 'VENCIMENTO',
          amount: holidayAllowance,
          isTaxableIrt: true,
          isTaxableInss: true,
          order: 6,
        })
      }

      if (christmasAllowance > 0) {
        items.push({
          code: 'SUB_NATAL',
          description: 'Subsídio de Natal (50% Base)',
          type: 'VENCIMENTO',
          amount: christmasAllowance,
          isTaxableIrt: true,
          isTaxableInss: true,
          order: 7,
        })
      }

      // Descontos Legais Obrigatórios
      items.push({
        code: 'INSS_3',
        description: 'Segurança Social — INSS (3% Trabalhador)',
        type: 'DESCONTO',
        amount: inss.workerInss,
        isTaxableIrt: false,
        isTaxableInss: false,
        order: 8,
      })

      if (irt.tax > 0) {
        items.push({
          code: 'IRT',
          description: `Imposto sobre o Rendimento do Trabalho — IRT (${irt.bracketLabel})`,
          type: 'DESCONTO',
          amount: irt.tax,
          isTaxableIrt: false,
          isTaxableInss: false,
          order: 9,
        })
      }

      for (const item of items) {
        await (tx as any).hrPayslipItem.create({
          data: {
            payslipId: payslip.id,
            code: item.code,
            description: item.description,
            type: item.type,
            amount: item.amount,
            isTaxableIrt: item.isTaxableIrt,
            isTaxableInss: item.isTaxableInss,
            order: item.order,
          },
        })
      }
    }

    // 4. Actualizar totais do cabeçalho
    const updatedPeriod = await (tx as any).hrPayrollPeriod.update({
      where: { id: payrollPeriod.id },
      data: {
        totalGross: Math.round(totalGross * 100) / 100,
        totalNet: Math.round(totalNet * 100) / 100,
        totalInssWorker: Math.round(totalInssWorker * 100) / 100,
        totalInssCompany: Math.round(totalInssCompany * 100) / 100,
        totalIrt: Math.round(totalIrt * 100) / 100,
        totalEmployees: employeeCount,
      },
    })

    // Gravar auditoria
    await logAudit(
      {
        userId: actor.id,
        userName: actor.name || actor.email,
        userRole: actor.role,
        action: 'PROCESSAR',
        resource: 'FOLHA_SALARIO',
        resourceId: updatedPeriod.id,
        details: `Processamento salarial do período ${periodCode}. ${employeeCount} recibos gerados. Total líquido: ${totalNet.toLocaleString('pt-AO')} Kz.`,
      },
      tx
    )

    return updatedPeriod
  })
}

/**
 * Aprova a folha salarial e tranca o período de ponto (`payrollLockedAt`).
 */
export async function approvePayrollPeriod(periodCode: string, actor: HrUserContext, notes?: string) {
  assertCan(actor, 'APROVAR_SALARIOS')

  const payroll = await (prisma as any).hrPayrollPeriod.findUnique({
    where: { code: periodCode },
  })

  if (!payroll) {
    throw new Error(`Processamento salarial do período ${periodCode} não encontrado.`)
  }
  if (payroll.status !== 'PROCESSADO') {
    throw new Error(`Só é possível aprovar uma folha no estado PROCESSADO. Estado actual: "${payroll.status}".`)
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Actualizar estado da folha salarial
    const updated = await (tx as any).hrPayrollPeriod.update({
      where: { id: payroll.id },
      data: {
        status: 'APROVADO',
        approvedAt: new Date(),
        approvedById: actor.id,
        approvedByName: actor.name || actor.email,
        notes: notes || payroll.notes,
      },
    })

    // 2. Actualizar estado de todos os recibos
    await (tx as any).hrPayslip.updateMany({
      where: { payrollPeriodId: payroll.id },
      data: { status: 'APROVADO' },
    })

    // 3. Trancar o ponto: preencher payrollLockedAt no HrTimesheetPeriod
    await (tx as any).hrTimesheetPeriod.update({
      where: { code: periodCode },
      data: { payrollLockedAt: new Date() },
    })

    // 4. Gravar auditoria
    await logAudit(
      {
        userId: actor.id,
        userName: actor.name || actor.email,
        userRole: actor.role,
        action: 'APROVAR',
        resource: 'FOLHA_SALARIO',
        resourceId: updated.id,
        details: `Aprovação final dos salários do período ${periodCode}. Período de ponto trancado.`,
      },
      tx
    )

    return updated
  })
}

/**
 * Marca os salários como pagos.
 */
export async function markPayrollPaid(periodCode: string, actor: HrUserContext, paymentDate?: Date) {
  assertCan(actor, 'PAGAR_SALARIOS')

  const payroll = await (prisma as any).hrPayrollPeriod.findUnique({
    where: { code: periodCode },
  })

  if (!payroll) throw new Error(`Período ${periodCode} não encontrado.`)
  if (payroll.status !== 'APROVADO') {
    throw new Error(`Só é possível marcar como paga uma folha aprovada. Estado actual: "${payroll.status}".`)
  }

  const payDate = paymentDate || new Date()

  return await prisma.$transaction(async (tx) => {
    const updated = await (tx as any).hrPayrollPeriod.update({
      where: { id: payroll.id },
      data: {
        status: 'PAGO',
        paidAt: payDate,
        paidById: actor.id,
        paidByName: actor.name || actor.email,
      },
    })

    await (tx as any).hrPayslip.updateMany({
      where: { payrollPeriodId: payroll.id },
      data: { status: 'PAGO', paidAt: payDate },
    })

    await logAudit(
      {
        userId: actor.id,
        userName: actor.name || actor.email,
        userRole: actor.role,
        action: 'PAGAR',
        resource: 'FOLHA_SALARIO',
        resourceId: updated.id,
        details: `Pagamento de salários do período ${periodCode} concluído em ${payDate.toLocaleDateString('pt-AO')}.`,
      },
      tx
    )

    return updated
  })
}

/**
 * Consulta o detalhe de um período salarial com os respectivos recibos.
 */
export async function getPayrollPeriod(periodCode: string) {
  return await (prisma as any).hrPayrollPeriod.findUnique({
    where: { code: periodCode },
    include: {
      payslips: {
        include: {
          employee: {
            select: {
              id: true,
              fullName: true,
              employeeNumber: true,
              department: { select: { name: true } },
              position: { select: { title: true } },
              bankName: true,
              bankIban: true,
            },
          },
        },
        orderBy: { employee: { fullName: 'asc' } },
      },
    },
  })
}

/**
 * Lista todos os períodos salariais existentes.
 */
export async function listPayrollPeriods() {
  return await (prisma as any).hrPayrollPeriod.findMany({
    orderBy: { code: 'desc' },
    include: {
      _count: { select: { payslips: true } },
    },
  })
}

/**
 * Consulta um recibo de vencimento individual com todas as linhas discriminadas.
 */
export async function getPayslip(payslipId: string, actor: HrUserContext) {
  const payslip = await (prisma as any).hrPayslip.findUnique({
    where: { id: payslipId },
    include: {
      payrollPeriod: true,
      employee: {
        include: {
          department: true,
          position: true,
        },
      },
      items: { orderBy: { order: 'asc' } },
    },
  })

  if (!payslip) return null

  // Validação de acesso: Se for funcionário, só pode ver o seu próprio recibo
  if (actor.role === 'FUNCIONARIO' && actor.employeeId !== payslip.employeeId) {
    throw new Error('Acesso negado: Não pode consultar recibos de vencimento de outro colaborador.')
  }

  return payslip
}

/**
 * Lista os recibos de vencimento de um determinado funcionário (para o Portal).
 */
export async function getEmployeePayslips(employeeId: string) {
  return await (prisma as any).hrPayslip.findMany({
    where: { employeeId },
    orderBy: { payrollPeriod: { code: 'desc' } },
    include: {
      payrollPeriod: { select: { code: true, year: true, month: true, status: true, paidAt: true } },
    },
  })
}

// ──────────────────────────────────────────────────────────────
// 3. EXPORTAÇÕES OFICIAIS DE ANGOLA (BANCO, INSS, AGT)
// ──────────────────────────────────────────────────────────────

/**
 * Gera ficheiro de transferências bancárias em lote (Bancos Angolanos: BAI, BFA, BIC, etc.)
 * Formato CSV estruturado com IBAN, Montante Kz e Beneficiário.
 */
export async function generateBankTransferBatch(periodCode: string, actor: HrUserContext) {
  assertCan(actor, 'EXPORTAR_FICHEIRO_BANCARIO')

  const payroll = await getPayrollPeriod(periodCode)
  if (!payroll) throw new Error(`Período ${periodCode} não encontrado.`)

  const headers = ['N_Seq', 'IBAN_Beneficiario', 'Nome_Beneficiario', 'Montante_Kz', 'Moeda', 'Descricao', 'Ref_Pagamento']
  let seq = 1

  const rows = payroll.payslips.map((ps: any) => {
    const ibanClean = (ps.bankIban || '').replace(/\s+/g, '')
    const amountStr = Number(ps.netSalary).toFixed(2).replace('.', ',')
    const ref = `SAL-${periodCode}-${ps.employee?.employeeNumber || '00'}`

    const row = [
      seq++,
      `"${ibanClean}"`,
      `"${(ps.employee?.fullName || '').replace(/"/g, '""')}"`,
      `"${amountStr}"`,
      '"AOA"',
      `"Salário ${periodCode} J.Matos"`,
      `"${ref}"`,
    ]
    return row.join(';')
  })

  await logAudit({
    userId: actor.id,
    userName: actor.name || actor.email,
    userRole: actor.role,
    action: 'ACESSO_SENSIVEL',
    resource: 'FOLHA_SALARIO',
    resourceId: payroll.id,
    details: `Exportação de ficheiro bancário de salários para o período ${periodCode}.`,
  })

  return '\uFEFF' + [headers.join(';'), ...rows].join('\r\n')
}

/**
 * Gera o Mapa Oficial da Segurança Social (INSS Angola — 3% Trabalhador + 8% Entidade Empregadora).
 */
export async function generateInssDeclaration(periodCode: string, actor: HrUserContext) {
  assertCan(actor, 'EXPORTAR_MAPA_INSS')

  const payroll = await getPayrollPeriod(periodCode)
  if (!payroll) throw new Error(`Período ${periodCode} não encontrado.`)

  const headers = [
    'N_Mecanografico',
    'Nome_Trabalhador',
    'BI_Numero',
    'Remuneracao_Base_Kz',
    'Materia_Colectavel_INSS_Kz',
    'Contribuicao_Trabalhador_3pct_Kz',
    'Encargo_Patronal_8pct_Kz',
    'Total_Recolhido_11pct_Kz',
  ]

  const rows = payroll.payslips.map((ps: any) => {
    const baseKz = Number(ps.baseSalary).toFixed(2).replace('.', ',')
    const inssBaseKz = Number(ps.taxableBaseInss).toFixed(2).replace('.', ',')
    const inss3Kz = Number(ps.inssWorker).toFixed(2).replace('.', ',')
    const inss8Kz = Number(ps.inssCompany).toFixed(2).replace('.', ',')
    const inssTotalKz = (Number(ps.inssWorker) + Number(ps.inssCompany)).toFixed(2).replace('.', ',')

    return [
      `"${ps.employee?.employeeNumber || ''}"`,
      `"${(ps.employee?.fullName || '').replace(/"/g, '""')}"`,
      `"${ps.employee?.biNumber || ''}"`,
      `"${baseKz}"`,
      `"${inssBaseKz}"`,
      `"${inss3Kz}"`,
      `"${inss8Kz}"`,
      `"${inssTotalKz}"`,
    ].join(';')
  })

  // Linha de Totais da Folha
  const totInssBase = Number(payroll.payslips.reduce((s: number, p: any) => s + Number(p.taxableBaseInss), 0)).toFixed(2).replace('.', ',')
  const totInss3 = Number(payroll.totalInssWorker).toFixed(2).replace('.', ',')
  const totInss8 = Number(payroll.totalInssCompany).toFixed(2).replace('.', ',')
  const totInssGlobal = (Number(payroll.totalInssWorker) + Number(payroll.totalInssCompany)).toFixed(2).replace('.', ',')

  const totalRow = [
    '"TOTAL"',
    `"EMPRESA J.MATOS (${payroll.payslips.length} TRABALHADORES)"`,
    '""',
    '""',
    `"${totInssBase}"`,
    `"${totInss3}"`,
    `"${totInss8}"`,
    `"${totInssGlobal}"`,
  ].join(';')

  await logAudit({
    userId: actor.id,
    userName: actor.name || actor.email,
    userRole: actor.role,
    action: 'ACESSO_SENSIVEL',
    resource: 'FOLHA_SALARIO',
    resourceId: payroll.id,
    details: `Exportação do Mapa Mensal do INSS (11%) do período ${periodCode}.`,
  })

  return '\uFEFF' + [headers.join(';'), ...rows, totalRow].join('\r\n')
}

/**
 * Gera a Declaração Modelo 2 para a AGT (Administração Geral Tributária de Angola).
 * Mapa das retenções na fonte de IRT de todos os trabalhadores por conta de outrem.
 */
export async function generateAgtModel2Declaration(periodCode: string, actor: HrUserContext) {
  assertCan(actor, 'EXPORTAR_MAPA_AGT')

  const payroll = await getPayrollPeriod(periodCode)
  if (!payroll) throw new Error(`Período ${periodCode} não encontrado.`)

  const headers = [
    'N_Ordem',
    'NIF_ou_BI',
    'Nome_Completo',
    'Rendimento_Bruto_Kz',
    'Deducoes_Legais_INSS_Kz',
    'Materia_Colectavel_IRT_Kz',
    'Imposto_Retido_IRT_Kz',
    'Salario_Liquido_Kz',
  ]

  let order = 1
  const rows = payroll.payslips.map((ps: any) => {
    const grossKz = Number(ps.grossSalary).toFixed(2).replace('.', ',')
    const inssKz = Number(ps.inssWorker).toFixed(2).replace('.', ',')
    const irtBaseKz = Number(ps.taxableBaseIrt).toFixed(2).replace('.', ',')
    const irtKz = Number(ps.irtTax).toFixed(2).replace('.', ',')
    const netKz = Number(ps.netSalary).toFixed(2).replace('.', ',')

    return [
      order++,
      `"${ps.employee?.biNumber || ''}"`,
      `"${(ps.employee?.fullName || '').replace(/"/g, '""')}"`,
      `"${grossKz}"`,
      `"${inssKz}"`,
      `"${irtBaseKz}"`,
      `"${irtKz}"`,
      `"${netKz}"`,
    ].join(';')
  })

  const totGross = Number(payroll.totalGross).toFixed(2).replace('.', ',')
  const totInssWorker = Number(payroll.totalInssWorker).toFixed(2).replace('.', ',')
  const totIrt = Number(payroll.totalIrt).toFixed(2).replace('.', ',')
  const totNet = Number(payroll.totalNet).toFixed(2).replace('.', ',')

  const totalRow = [
    '"TOTAL"',
    '""',
    `"TOTAL GERAL DA FOLHA (${payroll.payslips.length} TRABALHADORES)"`,
    `"${totGross}"`,
    `"${totInssWorker}"`,
    '""',
    `"${totIrt}"`,
    `"${totNet}"`,
  ].join(';')

  await logAudit({
    userId: actor.id,
    userName: actor.name || actor.email,
    userRole: actor.role,
    action: 'ACESSO_SENSIVEL',
    resource: 'FOLHA_SALARIO',
    resourceId: payroll.id,
    details: `Exportação da Declaração Modelo 2 do IRT para a AGT do período ${periodCode}.`,
  })

  return '\uFEFF' + [headers.join(';'), ...rows, totalRow].join('\r\n')
}
