'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Banknote,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  Lock,
  Printer,
  RefreshCw,
  Search,
  ShieldAlert,
  Shield,
  Users,
  ChevronLeft,
} from 'lucide-react';
import {
  HrPageHeader,
  HrButton,
  HrBadge,
  HrDialog,
  HrInput,
  HrField,
  HrSparkline,
} from '@/components/hr';
import { useHrToast } from '@/components/hr/hr-toast';

export default function SalariosPainelPage() {
  const toast = useHrToast();

  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedPeriodCode, setSelectedPeriodCode] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<any | null>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modais
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [processMonth, setProcessMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approveNotes, setApproveNotes] = useState('');
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payDate, setPayDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Carregar lista de períodos salariais
  const loadPeriods = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/rh/salarios');
      const data = await res.json();
      if (data.success) {
        setPeriods(data.periods || []);
      } else {
        toast.error(data.error || 'Erro ao carregar salários.');
      }
    } catch {
      toast.error('Erro de ligação ao carregar períodos salariais.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Carregar detalhe de um período
  const loadPeriodDetail = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/rh/salarios/${code}`);
      const data = await res.json();
      if (data.success) {
        setSelectedPeriod(data.payroll);
        setSelectedPeriodCode(code);
      } else {
        toast.error(data.error || 'Erro ao carregar detalhe salarial.');
      }
    } catch {
      toast.error('Erro de ligação ao carregar detalhe.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Carregar detalhe de um recibo específico
  const loadPayslipDetail = async (code: string, payslipId: string) => {
    try {
      const res = await fetch(`/api/rh/salarios/${code}/recibo/${payslipId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedPayslip(data.payslip);
      } else {
        toast.error(data.error || 'Erro ao carregar recibo.');
      }
    } catch {
      toast.error('Erro ao abrir recibo.');
    }
  };

  useEffect(() => {
    loadPeriods();
  }, [loadPeriods]);

  // Processar período
  const handleProcess = async () => {
    if (!processMonth) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/rh/salarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodCode: processMonth }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Folha salarial processada com sucesso.');
        setIsProcessModalOpen(false);
        loadPeriods();
        loadPeriodDetail(processMonth);
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error('Erro ao processar folha de salários.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Aprovar folha salarial (bloqueia o ponto)
  const handleApprove = async () => {
    if (!selectedPeriodCode) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/rh/salarios/${selectedPeriodCode}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APROVAR', notes: approveNotes }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Folha de salários aprovada e período de ponto trancado.');
        setIsApproveModalOpen(false);
        setApproveNotes('');
        loadPeriodDetail(selectedPeriodCode);
        loadPeriods();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error('Erro ao aprovar folha.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Marcar como pago
  const handlePay = async () => {
    if (!selectedPeriodCode) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/rh/salarios/${selectedPeriodCode}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'PAGAR', paymentDate: payDate }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Salários marcados como pagos.');
        setIsPayModalOpen(false);
        loadPeriodDetail(selectedPeriodCode);
        loadPeriods();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error('Erro ao registar pagamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatKz = (val: number | string = 0) => {
    return `${Number(val || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz`;
  };

  // ═══════════════════════════════════════════════════
  // VISTA 2: DETALHE DE UM PERÍODO SALARIAL
  // ═══════════════════════════════════════════════════
  if (selectedPeriod) {
    const p = selectedPeriod;
    const payslips = (p.payslips || []).filter((ps: any) => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        ps.employee?.fullName?.toLowerCase().includes(s) ||
        ps.employee?.employeeNumber?.toLowerCase().includes(s) ||
        ps.payslipNumber?.toLowerCase().includes(s)
      );
    });

    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => { setSelectedPeriod(null); setSelectedPeriodCode(''); }}
          className="flex items-center gap-1.5 text-xs text-[var(--hr-primary)] hover:underline font-bold"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar aos períodos salariais
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--hr-text)] tracking-tight">
              Processamento Salarial — {p.code}
            </h1>
            <p className="text-xs text-[var(--hr-text-muted)] mt-1">
              {p.totalEmployees} colaboradores processados · Estado:{' '}
              <strong className="text-[var(--hr-text)] uppercase">{p.status}</strong>
            </p>
          </div>

          {/* Acções de Gestão */}
          <div className="flex items-center gap-2 flex-wrap">
            {p.status === 'PROCESSADO' && (
              <>
                <HrButton
                  size="sm"
                  variant="outline"
                  onClick={() => { setProcessMonth(p.code); handleProcess(); }}
                  isLoading={isSubmitting}
                >
                  <RefreshCw className="w-4 h-4 mr-1.5" />
                  Reprocessar
                </HrButton>

                <HrButton
                  size="sm"
                  variant="primary"
                  onClick={() => setIsApproveModalOpen(true)}
                >
                  <Lock className="w-4 h-4 mr-1.5" />
                  Aprovar Folha
                </HrButton>
              </>
            )}

            {p.status === 'APROVADO' && (
              <HrButton
                size="sm"
                variant="primary"
                onClick={() => setIsPayModalOpen(true)}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Registar Pagamento
              </HrButton>
            )}

            {/* Ficheiros Oficiais */}
            <a href={`/api/rh/salarios/${p.code}/ficheiro-banco`} download className="inline-flex">
              <HrButton size="sm" variant="outline" title="Ficheiro de transferência bancária em lote para BAI, BFA, BIC">
                <Download className="w-4 h-4 mr-1.5" />
                Ficheiro Banco
              </HrButton>
            </a>

            <a href={`/api/rh/salarios/${p.code}/mapa-inss`} download className="inline-flex">
              <HrButton size="sm" variant="outline" title="Mapa Oficial da Segurança Social (11%)">
                <FileSpreadsheet className="w-4 h-4 mr-1.5" />
                Mapa INSS
              </HrButton>
            </a>

            <a href={`/api/rh/salarios/${p.code}/mapa-agt`} download className="inline-flex">
              <HrButton size="sm" variant="outline" title="Declaração Modelo 2 do IRT para a AGT">
                <FileSpreadsheet className="w-4 h-4 mr-1.5" />
                Mapa AGT (Mod. 2)
              </HrButton>
            </a>
          </div>
        </div>

        {/* Cartões KPI do Mês */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-4 shadow-[var(--hr-shadow-sm)] hover:shadow-[var(--hr-shadow-md)] transition-shadow">
            <span className="text-[11px] text-[var(--hr-text-muted)] block">Salário Ilíquido (Bruto)</span>
            <div className="text-base sm:text-lg font-bold text-[var(--hr-text)] mt-1 font-mono tabular-nums">
              {formatKz(p.totalGross)}
            </div>
          </div>

          <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-4 shadow-[var(--hr-shadow-sm)] hover:shadow-[var(--hr-shadow-md)] transition-shadow">
            <span className="text-[11px] text-[var(--hr-text-muted)] block">Líquido a Pagar</span>
            <div className="text-base sm:text-lg font-bold text-[var(--hr-status-success)] mt-1 font-mono tabular-nums">
              {formatKz(p.totalNet)}
            </div>
          </div>

          <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-4 shadow-[var(--hr-shadow-sm)] hover:shadow-[var(--hr-shadow-md)] transition-shadow">
            <span className="text-[11px] text-[var(--hr-text-muted)] block">INSS Trabalhadores (3%)</span>
            <div className="text-base sm:text-lg font-bold text-[var(--hr-primary)] mt-1 font-mono tabular-nums">
              {formatKz(p.totalInssWorker)}
            </div>
          </div>

          <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-4 shadow-[var(--hr-shadow-sm)] hover:shadow-[var(--hr-shadow-md)] transition-shadow">
            <span className="text-[11px] text-[var(--hr-text-muted)] block">INSS Empresa (8%)</span>
            <div className="text-base sm:text-lg font-bold text-[var(--hr-text-muted)] mt-1 font-mono tabular-nums">
              {formatKz(p.totalInssCompany)}
            </div>
          </div>

          <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-4 shadow-[var(--hr-shadow-sm)] hover:shadow-[var(--hr-shadow-md)] transition-shadow">
            <span className="text-[11px] text-[var(--hr-text-muted)] block">IRT Retido na Fonte</span>
            <div className="text-base sm:text-lg font-bold text-[var(--hr-status-warning)] mt-1 font-mono tabular-nums">
              {formatKz(p.totalIrt)}
            </div>
          </div>
        </div>

        {/* Tabela de Recibos */}
        <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-4 shadow-[var(--hr-shadow-sm)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-xs font-bold text-[var(--hr-text)] uppercase tracking-wider">
              Recibos de Vencimento do Mês ({payslips.length})
            </h3>
            <div className="max-w-xs w-full">
              <HrInput
                placeholder="Pesquisar colaborador..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[var(--hr-bg)] border-b border-[var(--hr-border)] text-left text-[var(--hr-text-muted)] font-semibold">
                  <th className="p-2.5">Recibo Nº</th>
                  <th className="p-2.5">Colaborador</th>
                  <th className="p-2.5 text-right">Salário Base</th>
                  <th className="p-2.5 text-right">Faltas / Extra</th>
                  <th className="p-2.5 text-right">INSS (3%)</th>
                  <th className="p-2.5 text-right">IRT</th>
                  <th className="p-2.5 text-right">Líquido</th>
                  <th className="p-2.5">Banco / IBAN</th>
                  <th className="p-2.5 text-center">Acções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--hr-border-subtle)]">
                {payslips.map((ps: any) => (
                  <tr key={ps.id} className="hover:bg-[var(--hr-bg)]/50 transition-colors">
                    <td className="p-2.5 font-mono font-medium">{ps.payslipNumber}</td>
                    <td className="p-2.5">
                      <div className="font-bold text-[var(--hr-text)]">{ps.employee?.fullName}</div>
                      <div className="text-[10px] text-[var(--hr-text-muted)] font-mono">
                        {ps.employee?.employeeNumber} · {ps.employee?.department?.name || ''}
                      </div>
                    </td>
                    <td className="p-2.5 text-right font-mono">{formatKz(ps.baseSalary)}</td>
                    <td className="p-2.5 text-right font-mono">
                      {ps.unjustifiedAbsences > 0 && (
                        <div className="text-[var(--hr-status-error)]">-{formatKz(ps.absenceDeduction)}</div>
                      )}
                      {ps.overtimePay > 0 && (
                        <div className="text-[var(--hr-status-success)]">+{formatKz(ps.overtimePay)}</div>
                      )}
                      {ps.unjustifiedAbsences === 0 && ps.overtimePay === 0 && <span>—</span>}
                    </td>
                    <td className="p-2.5 text-right font-mono text-[var(--hr-text-muted)]">{formatKz(ps.inssWorker)}</td>
                    <td className="p-2.5 text-right font-mono text-[var(--hr-status-warning)]">{formatKz(ps.irtTax)}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-[var(--hr-status-success)]">
                      {formatKz(ps.netSalary)}
                    </td>
                    <td className="p-2.5 text-[var(--hr-text-muted)] font-mono text-[10px]">
                      {ps.bankName || 'BFA'} · {ps.bankIban ? `${ps.bankIban.slice(0, 8)}...${ps.bankIban.slice(-4)}` : 'Sem IBAN'}
                    </td>
                    <td className="p-2.5 text-center">
                      <HrButton
                        size="sm"
                        variant="outline"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => loadPayslipDetail(p.code, ps.id)}
                      >
                        Ver
                      </HrButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Detalhe / Impressão do Recibo */}
        {selectedPayslip && (
          <HrDialog
            isOpen={Boolean(selectedPayslip)}
            onClose={() => setSelectedPayslip(null)}
            title={`Recibo de Vencimento — ${selectedPayslip.payslipNumber}`}
            maxWidth="lg"
          >
            <div className="space-y-0 pt-1 hr-payslip-watermark" id="payslip-print-content">
              {/* Cabeçalho Oficial — Papel Timbrado */}
              <div className="relative z-10 p-4 border border-[var(--hr-border)] rounded-t-[var(--hr-radius)]" style={{ background: 'linear-gradient(180deg, var(--hr-surface) 0%, var(--hr-bg) 100%)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-extrabold text-sm tracking-wide" style={{ color: '#003B73' }}>J.MATOS TECNOLOGIA, LDA.</div>
                    <div className="text-[11px] text-[var(--hr-text-muted)]">NIF: 5000123456 · Luanda, Angola</div>
                    <div className="text-[11px] text-[var(--hr-text-muted)]">Período de Liquidação: <strong>{selectedPeriodCode}</strong></div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-xs">{selectedPayslip.payslipNumber}</div>
                    <div className="text-[11px] text-[var(--hr-text-muted)]">
                      Emissão: {new Date(selectedPayslip.generatedAt).toLocaleDateString('pt-AO')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dados do Colaborador */}
              <div className="relative z-10 p-3 border-x border-[var(--hr-border)] bg-[var(--hr-surface)] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[var(--hr-text-muted)] block text-[10px]">Colaborador</span>
                  <span className="font-bold">{selectedPayslip.employee?.fullName}</span>
                </div>
                <div>
                  <span className="text-[var(--hr-text-muted)] block text-[10px]">Nº Mecanográfico</span>
                  <span className="font-mono font-bold">{selectedPayslip.employee?.employeeNumber}</span>
                </div>
                <div>
                  <span className="text-[var(--hr-text-muted)] block text-[10px]">Cargo</span>
                  <span>{selectedPayslip.employee?.position?.title || 'Técnico'}</span>
                </div>
                <div>
                  <span className="text-[var(--hr-text-muted)] block text-[10px]">IBAN</span>
                  <span className="font-mono text-[10px]">{selectedPayslip.bankIban || '—'}</span>
                </div>
              </div>

              {/* Tabela Discriminada com cores */}
              <div className="relative z-10 border-x border-[var(--hr-border)] overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[var(--hr-bg)] border-y border-[var(--hr-border)] font-semibold text-[var(--hr-text-muted)] text-left">
                      <th className="p-2">Código</th>
                      <th className="p-2">Descrição da Rubrica</th>
                      <th className="p-2 text-right">Vencimentos (Kz)</th>
                      <th className="p-2 text-right">Descontos (Kz)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--hr-border-subtle)] font-mono">
                    {selectedPayslip.items?.map((it: any) => (
                      <tr key={it.id} className={it.type === 'VENCIMENTO' ? 'hr-payslip-earning' : it.type === 'DESCONTO' ? 'hr-payslip-deduction' : ''}>
                        <td className="p-2 text-[var(--hr-text-muted)]">{it.code}</td>
                        <td className="p-2 font-sans">{it.description}</td>
                        <td className="p-2 text-right tabular-nums">
                          {it.type === 'VENCIMENTO' ? <span className="text-[var(--hr-status-success)] font-semibold">{formatKz(it.amount)}</span> : '—'}
                        </td>
                        <td className="p-2 text-right tabular-nums">
                          {it.type === 'DESCONTO' ? <span className="text-[var(--hr-status-error)] font-semibold">{formatKz(it.amount)}</span> : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[var(--hr-bg)] border-t border-[var(--hr-border)] font-mono font-bold">
                    <tr>
                      <td colSpan={2} className="p-2.5 text-right font-sans">Totais:</td>
                      <td className="p-2.5 text-right tabular-nums text-[var(--hr-text)]">{formatKz(selectedPayslip.grossSalary)}</td>
                      <td className="p-2.5 text-right tabular-nums text-[var(--hr-status-error)]">{formatKz(selectedPayslip.totalDeductions)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Perforated Cut Line */}
              <div className="hr-payslip-cut-line relative z-10" />

              {/* Net Salary Deep Navy Card */}
              <div className="relative z-10 mx-0 p-4 hr-payslip-net flex items-center justify-between rounded-b-[var(--hr-radius)]">
                <div>
                  <div className="text-[11px] text-white/60 uppercase tracking-wider font-bold">LÍQUIDO A RECEBER</div>
                  <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums tracking-tight">
                    {formatKz(selectedPayslip.netSalary)}
                  </div>
                </div>
                <div className="hr-payslip-stamp" style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'rgba(255,255,255,0.6)' }}>
                  ✓ Processado por Computador
                </div>
              </div>

              {/* Authenticity Stamp + Legal Footer */}
              <div className="relative z-10 pt-4 pb-2 flex flex-col items-center gap-3">
                <div className="hr-payslip-stamp">
                  <Shield className="w-3 h-3" />
                  Processado por Computador · ARKNET / J.Matos · Lei 12/23 &amp; 28/20
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="relative z-10 flex justify-end gap-2 pt-2 border-t border-[var(--hr-border)]">
                <HrButton
                  variant="outline"
                  size="sm"
                  leftIcon={<Printer className="w-4 h-4" />}
                  onClick={() => window.print()}
                >
                  Imprimir Recibo (PDF)
                </HrButton>
                <HrButton
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedPayslip(null)}
                >
                  Fechar
                </HrButton>
              </div>
            </div>
          </HrDialog>
        )}

        {/* Modal: Aprovar Folha Salarial */}
        <HrDialog
          isOpen={isApproveModalOpen}
          onClose={() => setIsApproveModalOpen(false)}
          title="Aprovar Folha Salarial"
          maxWidth="sm"
        >
          <div className="space-y-4 pt-1 text-xs">
            <p>
              Ao aprovar a folha salarial de <strong>{selectedPeriodCode}</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[var(--hr-text-muted)]">
              <li>O período de ponto correspondente será trancado (<code>payrollLockedAt</code>).</li>
              <li>Não serão permitidas alterações ou recálculos no ponto deste mês.</li>
              <li>Os recibos ficam validados para pagamento e disponibilização aos funcionários.</li>
            </ul>
            <HrField label="Notas de Aprovação (opcional)">
              <HrInput
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                placeholder="Ex.: Processamento salarial conferido e aprovado pela Direcção Financeira."
              />
            </HrField>
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--hr-border)]">
              <HrButton variant="outline" size="sm" onClick={() => setIsApproveModalOpen(false)}>
                Cancelar
              </HrButton>
              <HrButton variant="primary" size="sm" onClick={handleApprove} isLoading={isSubmitting}>
                Confirmar Aprovação
              </HrButton>
            </div>
          </div>
        </HrDialog>

        {/* Modal: Registar Pagamento */}
        <HrDialog
          isOpen={isPayModalOpen}
          onClose={() => setIsPayModalOpen(false)}
          title="Registar Pagamento de Salários"
          maxWidth="sm"
        >
          <div className="space-y-4 pt-1 text-xs">
            <p>
              Indique a data de liquidação das transferências bancárias dos salários de <strong>{selectedPeriodCode}</strong>:
            </p>
            <HrField label="Data de Liquidação Bancária" required>
              <HrInput
                type="date"
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
              />
            </HrField>
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--hr-border)]">
              <HrButton variant="outline" size="sm" onClick={() => setIsPayModalOpen(false)}>
                Cancelar
              </HrButton>
              <HrButton variant="primary" size="sm" onClick={handlePay} isLoading={isSubmitting}>
                Confirmar Pagamento
              </HrButton>
            </div>
          </div>
        </HrDialog>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // VISTA 1: LISTA GERAL DE PERÍODOS SALARIAIS
  // ═══════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <HrPageHeader
          title="Processamento Salarial"
          subtitle="Cálculo de vencimentos, retenções de IRT, Segurança Social (INSS) e emissão de recibos"
        />
        <HrButton
          variant="primary"
          leftIcon={<Banknote className="w-4 h-4" />}
          onClick={() => setIsProcessModalOpen(true)}
        >
          Processar Mês
        </HrButton>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-[var(--hr-text-muted)]">Carregando períodos salariais...</div>
      ) : periods.length === 0 ? (
        <div className="p-8 text-center bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)]">
          <Banknote className="w-10 h-10 text-[var(--hr-text-muted)] mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-bold text-[var(--hr-text)]">Nenhum processamento salarial registado</h3>
          <p className="text-xs text-[var(--hr-text-muted)] mt-1 max-w-sm mx-auto">
            Seleccione um mês com folhas de ponto fechadas para calcular salários, impostos e gerar recibos de vencimento.
          </p>
          <div className="mt-4">
            <HrButton size="sm" variant="primary" onClick={() => setIsProcessModalOpen(true)}>
              Processar Primeiro Período
            </HrButton>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {periods.map((per) => (
            <div
              key={per.id}
              className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-5 shadow-[var(--hr-shadow-sm)] flex flex-col justify-between hover:border-[var(--hr-primary)] transition cursor-pointer"
              onClick={() => loadPeriodDetail(per.code)}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-[var(--hr-text)] font-mono">{per.code}</h3>
                  <HrBadge
                    variant={
                      per.status === 'PAGO'
                        ? 'success'
                        : per.status === 'APROVADO'
                        ? 'info'
                        : 'warning'
                    }
                  >
                    {per.status}
                  </HrBadge>
                </div>

                <div className="space-y-1.5 text-xs text-[var(--hr-text-muted)]">
                  <div className="flex justify-between">
                    <span>Colaboradores:</span>
                    <strong className="text-[var(--hr-text)]">{per.totalEmployees || per._count?.payslips || 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Ilíquido:</span>
                    <span className="font-mono">{formatKz(per.totalGross)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Segurança Social (3%):</span>
                    <span className="font-mono text-[var(--hr-primary)]">{formatKz(per.totalInssWorker)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Imposto IRT:</span>
                    <span className="font-mono text-[var(--hr-status-warning)]">{formatKz(per.totalIrt)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[var(--hr-border-subtle)] text-[var(--hr-text)] font-bold">
                    <span>Líquido a Pagar:</span>
                    <span className="font-mono text-[var(--hr-status-success)]">{formatKz(per.totalNet)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--hr-border)] flex justify-end">
                <HrButton size="sm" variant="outline" onClick={() => loadPeriodDetail(per.code)}>
                  Abrir Detalhe & Recibos
                </HrButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Processar Novo Mês */}
      <HrDialog
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        title="Processar Folha de Salários"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-1 text-xs">
          <p>
            O motor salarial consumirá as marcações de assiduidade consolidadas da Fase 3A (horas trabalhadas, faltas injustificadas e horas extra) para calcular vencimentos e retenções de IRT e INSS.
          </p>
          <HrField label="Mês de Referência (AAAA-MM)" required>
            <HrInput
              type="month"
              value={processMonth}
              onChange={(e) => setProcessMonth(e.target.value)}
            />
          </HrField>
          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--hr-border)]">
            <HrButton variant="outline" size="sm" onClick={() => setIsProcessModalOpen(false)}>
              Cancelar
            </HrButton>
            <HrButton variant="primary" size="sm" onClick={handleProcess} isLoading={isSubmitting}>
              Calcular e Gerar Folha
            </HrButton>
          </div>
        </div>
      </HrDialog>
    </div>
  );
}
