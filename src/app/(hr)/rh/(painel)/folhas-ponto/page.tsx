'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList,
  CalendarCheck,
  Lock,
  Unlock,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  FileSpreadsheet,
  Eye,
  ChevronLeft,
  Check,
  X,
  Search,
  Printer,
} from 'lucide-react';
import {
  HrPageHeader,
  HrButton,
  HrBadge,
  HrTable,
  HrCardList,
  HrDialog,
  HrInput,
  HrField,
  HrSelect,
  HrTabs,
} from '@/components/hr';
import { HrConfirmDialog } from '@/components/hr/hr-confirm-dialog';
import { useHrToast } from '@/components/hr/hr-toast';

// Helper para formatar minutos em "Xh Ymin"
function fmtMin(minutes: number): string {
  if (!minutes || minutes <= 0) return '0min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

// Helper para cor do estado do período
function periodStatusBadge(status: string) {
  const map: Record<string, { variant: any; label: string }> = {
    ABERTO: { variant: 'info', label: 'Aberto' },
    EM_REVISAO: { variant: 'warning', label: 'Em Revisão' },
    FECHADO: { variant: 'success', label: 'Fechado' },
    REABERTO: { variant: 'warning', label: 'Reaberto' },
  };
  const cfg = map[status] || { variant: 'neutral', label: status };
  return <HrBadge variant={cfg.variant}>{cfg.label}</HrBadge>;
}

// Helper para cor do estado da folha
function sheetStatusBadge(status: string) {
  const map: Record<string, { variant: any; label: string }> = {
    ABERTA: { variant: 'neutral', label: 'Aberta' },
    SUBMETIDA: { variant: 'info', label: 'Submetida' },
    APROVADA: { variant: 'success', label: 'Aprovada' },
    BLOQUEADA: { variant: 'success', label: 'Bloqueada' },
  };
  const cfg = map[status] || { variant: 'neutral', label: status };
  return <HrBadge variant={cfg.variant}>{cfg.label}</HrBadge>;
}

// Helper para cor do estado do dia
function dayStatusBadge(status: string) {
  const map: Record<string, { variant: any; label: string }> = {
    PRESENTE: { variant: 'success', label: 'Presente' },
    ATRASO: { variant: 'warning', label: 'Atraso' },
    FALTA_INJUSTIFICADA: { variant: 'error', label: 'Falta Injust.' },
    FALTA_JUSTIFICADA: { variant: 'warning', label: 'Falta Just.' },
    FERIAS: { variant: 'info', label: 'Férias' },
    DOENCA: { variant: 'warning', label: 'Doença' },
    LICENCA: { variant: 'info', label: 'Licença' },
    FERIADO: { variant: 'info', label: 'Feriado' },
    FOLGA: { variant: 'neutral', label: 'Folga' },
    SAIDA_EM_FALTA: { variant: 'error', label: 'Saída em Falta' },
    SEM_VINCULO: { variant: 'neutral', label: 'Sem Vínculo' },
  };
  const cfg = map[status] || { variant: 'neutral', label: status };
  return <HrBadge variant={cfg.variant} size="sm">{cfg.label}</HrBadge>;
}

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function FolhasPontoPage() {
  const toast = useHrToast();
  const [activeTab, setActiveTab] = useState('periodos');
  const [isLoading, setIsLoading] = useState(true);

  // Listagem de períodos
  const [periods, setPeriods] = useState<any[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<any>(null);

  // Detalhe de período selecionado
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null);
  const [selectedPeriodCode, setSelectedPeriodCode] = useState<string>('');

  // Detalhe de folha individual
  const [selectedTimesheet, setSelectedTimesheet] = useState<any>(null);

  // Modais
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generatePeriod, setGeneratePeriod] = useState('');
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
  const [closeNotes, setCloseNotes] = useState('');
  const [isReopenOpen, setIsReopenOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [approveNote, setApproveNote] = useState('');
  const [approveTimesheetId, setApproveTimesheetId] = useState('');
  const [isJustifyOpen, setIsJustifyOpen] = useState(false);
  const [justifyDayId, setJustifyDayId] = useState('');
  const [justifyReason, setJustifyReason] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  // ─── Carregar períodos ──────────────────────────────
  const loadPeriods = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/rh/folhas-ponto');
      const data = await res.json();
      if (data.success) {
        setPeriods(data.periods || []);
        setCurrentPeriod(data.currentPeriod || null);
      }
    } catch (err) {
      toast.error('Erro ao carregar períodos.');
    }
    setIsLoading(false);
  }, []);

  // ─── Carregar detalhe de período ────────────────────
  const loadPeriodDetail = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/rh/folhas-ponto/${code}`);
      const data = await res.json();
      if (data.success) {
        setSelectedPeriod(data.period);
        setSelectedPeriodCode(code);
      } else {
        toast.error(data.error || 'Erro ao carregar período.');
      }
    } catch (err) {
      toast.error('Erro ao carregar período.');
    }
    setIsLoading(false);
  }, []);

  // ─── Carregar detalhe de folha ──────────────────────
  const loadTimesheetDetail = useCallback(async (code: string, timesheetId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/rh/folhas-ponto/${code}/folha/${timesheetId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedTimesheet(data.timesheet);
      } else {
        toast.error(data.error || 'Erro ao carregar folha.');
      }
    } catch (err) {
      toast.error('Erro ao carregar folha.');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadPeriods();
  }, [loadPeriods]);

  // ─── Gerar folhas ──────────────────────────────────
  const handleGenerate = async () => {
    if (!generatePeriod) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/rh/folhas-ponto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodCode: generatePeriod }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Folhas geradas com sucesso. ${data.generated} colaborador(es) processados.`);
        setIsGenerateOpen(false);
        loadPeriods();
        if (selectedPeriodCode === generatePeriod) {
          loadPeriodDetail(generatePeriod);
        }
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error('Erro ao gerar folhas.');
    }
    setIsSubmitting(false);
  };

  // Helper para gerar directamente a partir do período selecionado
  const handleGenerateForCurrentPeriod = async (code: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/rh/folhas-ponto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodCode: code }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Folhas recalculadas. ${data.generated} colaborador(es).`);
        loadPeriodDetail(code);
        loadPeriods();
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error('Erro ao recalcular folhas.');
    }
    setIsSubmitting(false);
  };

  // ─── Fechar período ─────────────────────────────────
  const handleClose = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/rh/folhas-ponto/${selectedPeriodCode}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'FECHAR', notes: closeNotes }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Período fechado com sucesso.');
        setIsCloseConfirmOpen(false);
        setCloseNotes('');
        loadPeriodDetail(selectedPeriodCode);
        loadPeriods();
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error('Erro ao fechar período.');
    }
    setIsSubmitting(false);
  };

  // ─── Reabrir período ────────────────────────────────
  const handleReopen = async () => {
    if (!reopenReason || reopenReason.length < 5) {
      toast.error('Motivo da reabertura deve ter pelo menos 5 caracteres.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/rh/folhas-ponto/${selectedPeriodCode}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REABRIR', reason: reopenReason }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Período reaberto com sucesso.');
        setIsReopenOpen(false);
        setReopenReason('');
        loadPeriodDetail(selectedPeriodCode);
        loadPeriods();
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error('Erro ao reabrir período.');
    }
    setIsSubmitting(false);
  };

  // ─── Aprovar folha ──────────────────────────────────
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/rh/folhas-ponto/${selectedPeriodCode}/folha/${approveTimesheetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APROVAR', note: approveNote }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Folha de ponto aprovada.');
        setIsApproveOpen(false);
        setApproveNote('');
        loadPeriodDetail(selectedPeriodCode);
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error('Erro ao aprovar folha.');
    }
    setIsSubmitting(false);
  };

  // ─── Justificar falta ──────────────────────────────
  const handleJustify = async () => {
    if (!justifyReason) {
      toast.error('Motivo é obrigatório.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/rh/folhas-ponto/${selectedPeriodCode}/folha/${selectedTimesheet?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'JUSTIFICAR_FALTA', dayDetailId: justifyDayId, reason: justifyReason }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Falta justificada com sucesso.');
        setIsJustifyOpen(false);
        setJustifyReason('');
        loadTimesheetDetail(selectedPeriodCode, selectedTimesheet.id);
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error('Erro ao justificar falta.');
    }
    setIsSubmitting(false);
  };

  // Mês actual para pré-preenchimento
  const currentMonth = new Date().toISOString().slice(0, 7);

  // ═══════════════════════════════════════════════════
  // VISTA: DETALHE DE FOLHA INDIVIDUAL
  // ═══════════════════════════════════════════════════
  if (selectedTimesheet) {
    const ts = selectedTimesheet;
    return (
      <div className="space-y-6">
        {/* Navegação de retorno */}
        <button
          type="button"
          onClick={() => setSelectedTimesheet(null)}
          className="flex items-center gap-1.5 text-sm text-[var(--hr-primary)] hover:underline font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar ao período {selectedPeriodCode}
        </button>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <HrPageHeader
            title={`Folha de Ponto — ${ts.employee?.fullName}`}
            subtitle={`${ts.employee?.employeeNumber} · ${ts.employee?.department?.name || ''} · ${ts.employee?.position?.name || ''}`}
          />
          <HrButton size="sm" variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-1.5" />
            Imprimir / PDF
          </HrButton>
        </div>

        {/* Resumo da folha */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: 'Dias Esperados', value: ts.expectedWorkDays, icon: <CalendarCheck className="w-4 h-4" /> },
            { label: 'Dias Trabalhados', value: ts.workedDays, icon: <Users className="w-4 h-4" /> },
            { label: 'Tempo Trabalhado', value: fmtMin(ts.totalMinutesWorked), icon: <Clock className="w-4 h-4" /> },
            { label: 'Atrasos', value: `${ts.delayCount}× (${fmtMin(ts.delayMinutes)})`, icon: <AlertCircle className="w-4 h-4" /> },
            { label: 'Faltas Injust.', value: ts.unjustifiedAbsenceDays, icon: <XCircle className="w-4 h-4" /> },
            { label: 'Horas Extra Aprov.', value: fmtMin(ts.approvedOvertimeMinutes), icon: <CheckCircle2 className="w-4 h-4" /> },
          ].map((item) => (
            <div key={item.label} className="bg-[var(--hr-surface)] rounded-[var(--hr-radius)] border border-[var(--hr-border)] p-4">
              <div className="flex items-center gap-2 text-[var(--hr-text-muted)] text-xs font-medium mb-1">
                {item.icon}
                {item.label}
              </div>
              <div className="text-lg font-bold text-[var(--hr-text)]">{item.value}</div>
            </div>
          ))}
        </div>

        {/* Estado e acções */}
        <div className="flex items-center gap-3 flex-wrap">
          {sheetStatusBadge(ts.status)}
          {ts.status === 'SUBMETIDA' && (
            <HrButton
              size="sm"
              onClick={() => {
                setApproveTimesheetId(ts.id);
                setApproveNote('');
                setIsApproveOpen(true);
              }}
            >
              <Check className="w-4 h-4 mr-1.5" />
              Aprovar Folha
            </HrButton>
          )}
        </div>

        {/* Tabela de detalhe diário */}
        <div className="bg-[var(--hr-surface)] rounded-[var(--hr-radius)] border border-[var(--hr-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="hr-premium-table w-full text-sm">
              <thead>
                <tr className="bg-[var(--hr-surface-muted)] text-left">
                  <th className="px-3 py-2.5 font-semibold text-[var(--hr-text-muted)]">Data</th>
                  <th className="px-3 py-2.5 font-semibold text-[var(--hr-text-muted)]">Dia</th>
                  <th className="px-3 py-2.5 font-semibold text-[var(--hr-text-muted)]">Estado</th>
                  <th className="px-3 py-2.5 font-semibold text-[var(--hr-text-muted)]">Entrada</th>
                  <th className="px-3 py-2.5 font-semibold text-[var(--hr-text-muted)]">Saída</th>
                  <th className="px-3 py-2.5 font-semibold text-[var(--hr-text-muted)]">Trabalhado</th>
                  <th className="px-3 py-2.5 font-semibold text-[var(--hr-text-muted)]">Atraso</th>
                  <th className="px-3 py-2.5 font-semibold text-[var(--hr-text-muted)]">H.Extra</th>
                  <th className="px-3 py-2.5 font-semibold text-[var(--hr-text-muted)]">Acções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--hr-border-subtle)]">
                {ts.days?.map((day: any) => {
                  const dateFormatted = day.date.split('-').reverse().join('/');
                  const entryTime = day.actualIn ? new Date(day.actualIn).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Luanda' }) : '—';
                  const exitTime = day.actualOut ? new Date(day.actualOut).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Luanda' }) : '—';

                  const isWeekend = day.dayOfWeek === 0 || day.dayOfWeek === 6;

                  return (
                    <tr key={day.id} className={`${isWeekend ? 'bg-[var(--hr-surface-muted)]' : ''} hover:bg-[var(--hr-primary-soft)] transition-colors`}>
                      <td className="px-3 py-2 font-mono text-xs">{dateFormatted}</td>
                      <td className="px-3 py-2 text-[var(--hr-text-muted)]">{diasSemana[day.dayOfWeek]}</td>
                      <td className="px-3 py-2">{dayStatusBadge(day.status)}</td>
                      <td className="px-3 py-2 font-mono text-xs">{entryTime}</td>
                      <td className="px-3 py-2 font-mono text-xs">{exitTime}</td>
                      <td className="px-3 py-2 font-mono text-xs">{day.minutesWorked > 0 ? fmtMin(day.minutesWorked) : '—'}</td>
                      <td className="px-3 py-2 font-mono text-xs">{day.delayMinutes > 0 ? fmtMin(day.delayMinutes) : '—'}</td>
                      <td className="px-3 py-2 font-mono text-xs">{day.overtimeMinutes > 0 ? fmtMin(day.overtimeMinutes) : '—'}</td>
                      <td className="px-3 py-2">
                        {day.status === 'FALTA_INJUSTIFICADA' && ts.period?.status !== 'FECHADO' && (
                          <button
                            type="button"
                            onClick={() => {
                              setJustifyDayId(day.id);
                              setJustifyReason('');
                              setIsJustifyOpen(true);
                            }}
                            className="text-xs text-[var(--hr-primary)] hover:underline font-medium"
                          >
                            Justificar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Aprovação */}
        <HrDialog
          isOpen={isApproveOpen}
          onClose={() => setIsApproveOpen(false)}
          title="Aprovar Folha de Ponto"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-[var(--hr-text-muted)]">
              Confirma a aprovação da folha de ponto de <strong>{ts.employee?.fullName}</strong>?
            </p>
            <HrField label="Nota (opcional)">
              <HrInput
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
                placeholder="Nota de aprovação..."
              />
            </HrField>
            <div className="flex gap-2 justify-end">
              <HrButton variant="outline" onClick={() => setIsApproveOpen(false)}>Cancelar</HrButton>
              <HrButton onClick={handleApprove} isLoading={isSubmitting}>Aprovar</HrButton>
            </div>
          </div>
        </HrDialog>

        {/* Modal de Justificação de Falta */}
        <HrDialog
          isOpen={isJustifyOpen}
          onClose={() => setIsJustifyOpen(false)}
          title="Justificar Falta"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <HrField label="Motivo da justificação *">
              <HrInput
                value={justifyReason}
                onChange={(e) => setJustifyReason(e.target.value)}
                placeholder="Ex.: Atestado médico apresentado"
              />
            </HrField>
            <div className="flex gap-2 justify-end">
              <HrButton variant="outline" onClick={() => setIsJustifyOpen(false)}>Cancelar</HrButton>
              <HrButton onClick={handleJustify} isLoading={isSubmitting}>Justificar</HrButton>
            </div>
          </div>
        </HrDialog>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // VISTA: DETALHE DE PERÍODO (lista de folhas)
  // ═══════════════════════════════════════════════════
  if (selectedPeriod) {
    const p = selectedPeriod;
    const sheets = p.timesheets || [];
    const filteredSheets = search
      ? sheets.filter((s: any) =>
          s.employee?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          s.employee?.employeeNumber?.toLowerCase().includes(search.toLowerCase())
        )
      : sheets;

    const approvedCount = sheets.filter((s: any) => s.status === 'APROVADA' || s.status === 'BLOQUEADA').length;
    const submittedCount = sheets.filter((s: any) => s.status === 'SUBMETIDA').length;
    const openCount = sheets.filter((s: any) => s.status === 'ABERTA').length;

    return (
      <div className="space-y-6">
        {/* Navegação de retorno */}
        <button
          type="button"
          onClick={() => { setSelectedPeriod(null); setSelectedPeriodCode(''); }}
          className="flex items-center gap-1.5 text-sm text-[var(--hr-primary)] hover:underline font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar à lista de períodos
        </button>

        <HrPageHeader
          title={`Período ${p.code}`}
          subtitle={`Versão ${p.version} · ${sheets.length} folha(s)`}
        />

        {/* Estado e Acções */}
        <div className="flex items-center gap-3 flex-wrap">
          {periodStatusBadge(p.status)}

          {(p.status === 'ABERTO' || p.status === 'REABERTO' || p.status === 'EM_REVISAO') && (
            <>
              <HrButton
                size="sm"
                variant="outline"
                onClick={() => {
                  setGeneratePeriod(p.code);
                  handleGenerateForCurrentPeriod(p.code);
                }}
                isLoading={isSubmitting}
              >
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Recalcular
              </HrButton>

              <HrButton
                size="sm"
                onClick={() => {
                  setCloseNotes('');
                  setIsCloseConfirmOpen(true);
                }}
              >
                <Lock className="w-4 h-4 mr-1.5" />
                Fechar Período
              </HrButton>
            </>
          )}

          {p.status === 'FECHADO' && (
            <HrButton
              size="sm"
              variant="outline"
              onClick={() => {
                setReopenReason('');
                setIsReopenOpen(true);
              }}
            >
              <Unlock className="w-4 h-4 mr-1.5" />
              Reabrir
            </HrButton>
          )}

          <a
            href={`/api/rh/folhas-ponto/${p.code}/exportar`}
            download={`folhas-ponto-${p.code}.csv`}
            className="inline-flex"
          >
            <HrButton size="sm" variant="outline">
              <FileSpreadsheet className="w-4 h-4 mr-1.5" />
              Exportar Excel
            </HrButton>
          </a>
        </div>

        {/* Resumo rápido */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[var(--hr-surface)] rounded-[var(--hr-radius)] border border-[var(--hr-border)] p-4 text-center">
            <div className="text-2xl font-bold text-[var(--hr-status-success)]">{approvedCount}</div>
            <div className="text-xs text-[var(--hr-text-muted)] mt-1">Aprovadas</div>
          </div>
          <div className="bg-[var(--hr-surface)] rounded-[var(--hr-radius)] border border-[var(--hr-border)] p-4 text-center">
            <div className="text-2xl font-bold text-[var(--hr-primary)]">{submittedCount}</div>
            <div className="text-xs text-[var(--hr-text-muted)] mt-1">Submetidas</div>
          </div>
          <div className="bg-[var(--hr-surface)] rounded-[var(--hr-radius)] border border-[var(--hr-border)] p-4 text-center">
            <div className="text-2xl font-bold text-[var(--hr-text-muted)]">{openCount}</div>
            <div className="text-xs text-[var(--hr-text-muted)] mt-1">Abertas</div>
          </div>
        </div>

        {/* Pesquisa */}
        <div className="max-w-sm">
          <HrInput
            placeholder="Pesquisar colaborador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Tabela de folhas */}
        <div className="bg-[var(--hr-surface)] rounded-[var(--hr-radius)] border border-[var(--hr-border)] overflow-hidden">
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="hr-premium-table w-full text-sm">
              <thead>
                <tr className="bg-[var(--hr-surface-muted)] text-left">
                  <th className="px-4 py-3 font-semibold text-[var(--hr-text-muted)]">Colaborador</th>
                  <th className="px-4 py-3 font-semibold text-[var(--hr-text-muted)]">Departamento</th>
                  <th className="px-4 py-3 font-semibold text-[var(--hr-text-muted)]">Estado</th>
                  <th className="px-4 py-3 font-semibold text-[var(--hr-text-muted)] text-right">Dias Trab.</th>
                  <th className="px-4 py-3 font-semibold text-[var(--hr-text-muted)] text-right">Horas</th>
                  <th className="px-4 py-3 font-semibold text-[var(--hr-text-muted)] text-right">Faltas</th>
                  <th className="px-4 py-3 font-semibold text-[var(--hr-text-muted)]">Acções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--hr-border-subtle)]">
                {filteredSheets.map((sheet: any) => (
                  <tr key={sheet.id} className="hover:bg-[var(--hr-primary-soft)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--hr-text)]">{sheet.employee?.fullName}</div>
                      <div className="text-xs text-[var(--hr-text-muted)]">{sheet.employee?.employeeNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-[var(--hr-text-muted)]">{sheet.employee?.department?.name || '—'}</td>
                    <td className="px-4 py-3">{sheetStatusBadge(sheet.status)}</td>
                    <td className="px-4 py-3 text-right font-mono">{sheet.workedDays}/{sheet.expectedWorkDays}</td>
                    <td className="px-4 py-3 text-right font-mono">{fmtMin(sheet.totalMinutesWorked)}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      {sheet.unjustifiedAbsenceDays > 0 && (
                        <span className="text-[var(--hr-status-error)]">{sheet.unjustifiedAbsenceDays} inj.</span>
                      )}
                      {sheet.justifiedAbsenceDays > 0 && (
                        <span className="text-[var(--hr-status-warning)] ml-1">{sheet.justifiedAbsenceDays} just.</span>
                      )}
                      {sheet.unjustifiedAbsenceDays === 0 && sheet.justifiedAbsenceDays === 0 && '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => loadTimesheetDetail(p.code, sheet.id)}
                          className="text-[var(--hr-primary)] hover:underline text-sm font-medium flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver
                        </button>
                        {sheet.status === 'SUBMETIDA' && p.status !== 'FECHADO' && (
                          <button
                            type="button"
                            onClick={() => {
                              setApproveTimesheetId(sheet.id);
                              setApproveNote('');
                              setIsApproveOpen(true);
                            }}
                            className="text-[var(--hr-status-success)] hover:underline text-sm font-medium flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Aprovar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile - Card List */}
          <div className="md:hidden divide-y divide-[var(--hr-border-subtle)]">
            {filteredSheets.map((sheet: any) => (
              <div key={sheet.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-[var(--hr-text)]">{sheet.employee?.fullName}</div>
                    <div className="text-xs text-[var(--hr-text-muted)]">{sheet.employee?.employeeNumber}</div>
                  </div>
                  {sheetStatusBadge(sheet.status)}
                </div>
                <div className="flex gap-4 text-xs text-[var(--hr-text-muted)]">
                  <span>{sheet.workedDays}/{sheet.expectedWorkDays} dias</span>
                  <span>{fmtMin(sheet.totalMinutesWorked)}</span>
                  {sheet.unjustifiedAbsenceDays > 0 && (
                    <span className="text-[var(--hr-status-error)]">{sheet.unjustifiedAbsenceDays} faltas</span>
                  )}
                </div>
                <div className="flex gap-2 pt-1">
                  <HrButton size="sm" variant="outline" onClick={() => loadTimesheetDetail(p.code, sheet.id)}>
                    <Eye className="w-3.5 h-3.5 mr-1" /> Ver
                  </HrButton>
                  {sheet.status === 'SUBMETIDA' && p.status !== 'FECHADO' && (
                    <HrButton size="sm" onClick={() => {
                      setApproveTimesheetId(sheet.id);
                      setIsApproveOpen(true);
                    }}>
                      <Check className="w-3.5 h-3.5 mr-1" /> Aprovar
                    </HrButton>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredSheets.length === 0 && (
            <div className="p-8 text-center text-[var(--hr-text-muted)]">
              <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>Nenhuma folha de ponto encontrada.</p>
            </div>
          )}
        </div>

        {/* Modais de Fecho/Reabertura */}
        <HrDialog isOpen={isCloseConfirmOpen} onClose={() => setIsCloseConfirmOpen(false)} title="Fechar Período" maxWidth="sm">
          <div className="space-y-4">
            <p className="text-sm text-[var(--hr-text-muted)]">
              Ao fechar o período <strong>{p.code}</strong>, todas as folhas aprovadas serão bloqueadas
              e um snapshot será guardado. Tem a certeza?
            </p>
            <HrField label="Notas (opcional)">
              <HrInput value={closeNotes} onChange={(e) => setCloseNotes(e.target.value)} placeholder="Notas de fecho..." />
            </HrField>
            <div className="flex gap-2 justify-end">
              <HrButton variant="outline" onClick={() => setIsCloseConfirmOpen(false)}>Cancelar</HrButton>
              <HrButton onClick={handleClose} isLoading={isSubmitting}>
                <Lock className="w-4 h-4 mr-1.5" /> Fechar
              </HrButton>
            </div>
          </div>
        </HrDialog>

        <HrDialog isOpen={isReopenOpen} onClose={() => setIsReopenOpen(false)} title="Reabrir Período" maxWidth="sm">
          <div className="space-y-4">
            <p className="text-sm text-[var(--hr-text-muted)]">
              A reabertura do período <strong>{p.code}</strong> incrementará a versão e desbloqueará as folhas.
            </p>
            <HrField label="Motivo da reabertura *">
              <HrInput value={reopenReason} onChange={(e) => setReopenReason(e.target.value)} placeholder="Ex.: Correcção de marcação em falta" />
            </HrField>
            <div className="flex gap-2 justify-end">
              <HrButton variant="outline" onClick={() => setIsReopenOpen(false)}>Cancelar</HrButton>
              <HrButton onClick={handleReopen} isLoading={isSubmitting}>
                <Unlock className="w-4 h-4 mr-1.5" /> Reabrir
              </HrButton>
            </div>
          </div>
        </HrDialog>

        <HrDialog isOpen={isApproveOpen} onClose={() => setIsApproveOpen(false)} title="Aprovar Folha de Ponto" maxWidth="sm">
          <div className="space-y-4">
            <p className="text-sm text-[var(--hr-text-muted)]">Confirma a aprovação desta folha de ponto?</p>
            <HrField label="Nota (opcional)">
              <HrInput value={approveNote} onChange={(e) => setApproveNote(e.target.value)} placeholder="Nota de aprovação..." />
            </HrField>
            <div className="flex gap-2 justify-end">
              <HrButton variant="outline" onClick={() => setIsApproveOpen(false)}>Cancelar</HrButton>
              <HrButton onClick={handleApprove} isLoading={isSubmitting}>Aprovar</HrButton>
            </div>
          </div>
        </HrDialog>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // VISTA PRINCIPAL: LISTA DE PERÍODOS
  // ═══════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      <HrPageHeader
        title="Folhas de Ponto"
        subtitle="Gestão mensal de folhas de ponto e fecho de período"
      />

      {/* Acções */}
      <div className="flex gap-3 flex-wrap">
        <HrButton onClick={() => { setGeneratePeriod(currentMonth); setIsGenerateOpen(true); }}>
          <FileSpreadsheet className="w-4 h-4 mr-1.5" />
          Gerar Folhas
        </HrButton>
      </div>

      {/* Resumo do período actual */}
      {currentPeriod?.exists && (
        <div className="bg-[var(--hr-surface)] rounded-[var(--hr-radius)] border border-[var(--hr-border)] p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-[var(--hr-text)]">
              Período Actual — {currentPeriod.code}
            </h3>
            {periodStatusBadge(currentPeriod.status)}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-[var(--hr-text-muted)]">Total de Folhas</span>
              <div className="font-bold text-lg">{currentPeriod.totalSheets}</div>
            </div>
            <div>
              <span className="text-[var(--hr-text-muted)]">Aprovadas</span>
              <div className="font-bold text-lg text-[var(--hr-status-success)]">{currentPeriod.approved}</div>
            </div>
            <div>
              <span className="text-[var(--hr-text-muted)]">Submetidas</span>
              <div className="font-bold text-lg text-[var(--hr-primary)]">{currentPeriod.submitted}</div>
            </div>
            <div>
              <span className="text-[var(--hr-text-muted)]">Abertas</span>
              <div className="font-bold text-lg">{currentPeriod.open}</div>
            </div>
            <div>
              <span className="text-[var(--hr-text-muted)]">Versões</span>
              <div className="font-bold text-lg">{currentPeriod.versions}</div>
            </div>
          </div>
          <div className="mt-3">
            <HrButton
              size="sm"
              variant="outline"
              onClick={() => loadPeriodDetail(currentPeriod.code)}
            >
              <Eye className="w-4 h-4 mr-1.5" />
              Ver Período
            </HrButton>
          </div>
        </div>
      )}

      {/* Histórico de períodos */}
      <div className="bg-[var(--hr-surface)] rounded-[var(--hr-radius)] border border-[var(--hr-border)] overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--hr-border)] bg-[var(--hr-surface-muted)]">
          <h3 className="text-sm font-bold text-[var(--hr-text)]">Histórico de Períodos</h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-[var(--hr-text-muted)]">A carregar...</div>
        ) : periods.length === 0 ? (
          <div className="p-8 text-center text-[var(--hr-text-muted)]">
            <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>Nenhum período encontrado. Gere as primeiras folhas de ponto.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--hr-border-subtle)]">
            {periods.map((p: any) => (
              <button
                type="button"
                key={p.id}
                onClick={() => loadPeriodDetail(p.code)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--hr-primary-soft)] transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-[var(--hr-radius)] bg-[var(--hr-primary-soft)] flex items-center justify-center">
                    <CalendarCheck className="w-5 h-5 text-[var(--hr-primary)]" />
                  </div>
                  <div>
                    <div className="font-medium text-[var(--hr-text)]">{p.code}</div>
                    <div className="text-xs text-[var(--hr-text-muted)]">
                      v{p.version} · {p._count?.timesheets || 0} folha(s)
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {periodStatusBadge(p.status)}
                  <ChevronRight className="w-4 h-4 text-[var(--hr-text-muted)]" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Geração */}
      <HrDialog isOpen={isGenerateOpen} onClose={() => setIsGenerateOpen(false)} title="Gerar Folhas de Ponto" maxWidth="sm">
        <div className="space-y-4">
          <p className="text-sm text-[var(--hr-text-muted)]">
            Seleccione o período para gerar ou recalcular as folhas de ponto de todos os colaboradores activos.
          </p>
          <HrField label="Período (AAAA-MM) *">
            <HrInput
              type="month"
              value={generatePeriod}
              onChange={(e) => setGeneratePeriod(e.target.value)}
            />
          </HrField>
          <div className="flex gap-2 justify-end">
            <HrButton variant="outline" onClick={() => setIsGenerateOpen(false)}>Cancelar</HrButton>
            <HrButton onClick={handleGenerate} isLoading={isSubmitting}>
              <FileSpreadsheet className="w-4 h-4 mr-1.5" /> Gerar
            </HrButton>
          </div>
        </div>
      </HrDialog>
    </div>
  );
}
