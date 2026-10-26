'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Users,
  Timer,
  Coffee,
  Check,
  X,
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
import { useHrToast } from '@/components/hr/hr-toast';

export default function RhPontoPage() {
  const toast = useHrToast();

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('diario');
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [todaySummary, setTodaySummary] = useState<any>(null);
  const [workDays, setWorkDays] = useState<any[]>([]);
  const [corrections, setCorrections] = useState<any[]>([]);
  const [overtimes, setOvertimes] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  // Modals state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [reviewType, setReviewType] = useState<'correcao' | 'overtime'>('correcao');
  const [reviewDecision, setReviewDecision] = useState<'APROVADO' | 'REJEITADO'>('APROVADO');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual point form
  const [manualForm, setManualForm] = useState({
    employeeId: '',
    type: 'ENTRADA',
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    notes: '',
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [todayRes, pedidosRes, empRes] = await Promise.all([
        fetch(`/api/rh/ponto/hoje?date=${date}`),
        fetch(`/api/rh/ponto/pedidos?status=PENDENTE`),
        fetch(`/api/rh/funcionarios?limit=100&status=ACTIVO`),
      ]);

      const [todayData, pedidosData, empData] = await Promise.all([
        todayRes.json().catch(() => ({})),
        pedidosRes.json().catch(() => ({})),
        empRes.json().catch(() => ({})),
      ]);

      if (todayData.success) {
        setTodaySummary(todayData.summary || null);
        setWorkDays(todayData.workDays || []);
      }
      if (pedidosData.success) {
        setCorrections(pedidosData.corrections || []);
        setOvertimes(pedidosData.overtimes || []);
      }
      if (empData.success) {
        setEmployees(empData.employees || []);
      }
    } catch {
      toast.error('Erro ao carregar dados de assiduidade');
    } finally {
      setIsLoading(false);
    }
  }, [date, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Manual Entry Submit
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.employeeId) {
      toast.error('Selecione um funcionário');
      return;
    }
    if (!manualForm.notes.trim()) {
      toast.error('O motivo é estritamente obrigatório para registo manual');
      return;
    }

    setIsSubmitting(true);
    try {
      const dateTimeStr = `${manualForm.date}T${manualForm.time}:00`;
      const res = await fetch('/api/rh/ponto/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: manualForm.employeeId,
          type: manualForm.type,
          timestamp: new Date(dateTimeStr).toISOString(),
          notes: manualForm.notes.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Ponto manual registado com sucesso');
        setIsManualModalOpen(false);
        setManualForm({
          employeeId: '',
          type: 'ENTRADA',
          date: new Date().toISOString().split('T')[0],
          time: '08:00',
          notes: '',
        });
        loadData();
      } else {
        toast.error(data.error || 'Erro ao registar ponto manual');
      }
    } catch {
      toast.error('Erro de ligação ao servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Decision Modal
  const handleOpenReview = (item: any, type: 'correcao' | 'overtime', decision: 'APROVADO' | 'REJEITADO') => {
    setSelectedRequest(item);
    setReviewType(type);
    setReviewDecision(decision);
    setReviewComment('');
    setIsReviewModalOpen(true);
  };

  // Submit Decision
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setIsSubmitting(true);
    try {
      const endpoint =
        reviewType === 'correcao'
          ? `/api/rh/ponto/pedidos/correccoes/${selectedRequest.id}`
          : `/api/rh/ponto/pedidos/horas-extras/${selectedRequest.id}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: reviewDecision,
          reviewComment: reviewComment.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          reviewDecision === 'APROVADO'
            ? 'Pedido aprovado com sucesso'
            : 'Pedido rejeitado com sucesso'
        );
        setIsReviewModalOpen(false);
        setSelectedRequest(null);
        loadData();
      } else {
        toast.error(data.error || 'Erro ao processar decisão');
      }
    } catch {
      toast.error('Erro de ligação ao processar decisão');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export CSV
  const handleExport = () => {
    const csvUrl = `/api/rh/ponto/relatorios?format=csv&date=${date}`;
    window.open(csvUrl, '_blank');
  };

  const tabs = [
    {
      id: 'diario',
      label: 'Visão Diária',
      badge: workDays.length ? String(workDays.length) : undefined,
    },
    {
      id: 'correcoes',
      label: 'Pedidos de Correcção',
      badge: corrections.length ? String(corrections.length) : undefined,
    },
    {
      id: 'overtime',
      label: 'Horas Extras',
      badge: overtimes.length ? String(overtimes.length) : undefined,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <HrPageHeader
        title="Ponto & Assiduidade"
        subtitle="Gestão de picagens diárias, tolerâncias, horas extras e correcções segundo a LGT."
        actions={
          <div className="flex items-center gap-2">
            <HrButton
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExport}
            >
              Exportar CSV
            </HrButton>
            <HrButton
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsManualModalOpen(true)}
            >
              Registar Ponto Manual
            </HrButton>
          </div>
        }
      />

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--hr-text-muted)]">Presentes Hoje</span>
            <Users className="w-4 h-4 text-[var(--hr-primary)]" />
          </div>
          <div className="text-2xl font-bold text-[var(--hr-text)] mt-2">
            {todaySummary?.presentCount ?? (workDays.filter((w) => w.actualIn).length || 0)}
          </div>
          <span className="text-[11px] text-[var(--hr-status-success)] flex items-center gap-1 mt-1 font-medium">
            <CheckCircle2 className="w-3 h-3" /> Em serviço ativo
          </span>
        </div>

        <div className="p-4 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--hr-text-muted)]">Em Pausa</span>
            <Coffee className="w-4 h-4 text-[var(--hr-accent)]" />
          </div>
          <div className="text-2xl font-bold text-[var(--hr-text)] mt-2">
            {todaySummary?.onBreakCount ?? 0}
          </div>
          <span className="text-[11px] text-[var(--hr-text-muted)] mt-1 block">
            Intervalo de almoço/descanso
          </span>
        </div>

        <div className="p-4 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--hr-text-muted)]">Atrasos Detectados</span>
            <AlertCircle className="w-4 h-4 text-[var(--hr-status-warning)]" />
          </div>
          <div className="text-2xl font-bold text-[var(--hr-text)] mt-2">
            {todaySummary?.delayCount ?? (workDays.filter((w) => w.delayMinutes > 0).length || 0)}
          </div>
          <span className="text-[11px] text-[var(--hr-status-warning)] mt-1 block font-medium">
            Ultrapassou tolerância de 10 min
          </span>
        </div>

        <div className="p-4 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--hr-text-muted)]">Pendentes de Aprovação</span>
            <Timer className="w-4 h-4 text-[var(--hr-primary)]" />
          </div>
          <div className="text-2xl font-bold text-[var(--hr-text)] mt-2">
            {corrections.length + overtimes.length}
          </div>
          <span className="text-[11px] text-[var(--hr-text-muted)] mt-1 block">
            {corrections.length} correcções • {overtimes.length} h. extras
          </span>
        </div>
      </div>

      {/* Date Filter & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--hr-border)] pb-2">
        <HrTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--hr-text-muted)] font-medium">Data:</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius-sm)] text-[var(--hr-text)] focus:outline-none focus:border-[var(--hr-primary)]"
          />
        </div>
      </div>

      {/* Tab 1: Visão Diária */}
      {activeTab === 'diario' && (
        <div className="space-y-4">
          <div className="hidden sm:block">
            <HrTable<any>
              columns={[
                {
                  key: 'employee',
                  header: 'Colaborador',
                  render: (row: any) => (
                    <div>
                      <div className="font-medium text-[var(--hr-text)]">{row.employee?.fullName || '—'}</div>
                      <div className="text-xs text-[var(--hr-text-muted)]">{row.employee?.employeeNumber}</div>
                    </div>
                  ),
                },
                {
                  key: 'in',
                  header: 'Entrada',
                  render: (row: any) =>
                    row.actualIn
                      ? new Date(row.actualIn).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
                      : '—',
                },
                {
                  key: 'out',
                  header: 'Saída',
                  render: (row: any) =>
                    row.actualOut
                      ? new Date(row.actualOut).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
                      : '—',
                },
                {
                  key: 'hours',
                  header: 'Total Trabalhado',
                  render: (row: any) => {
                    const hours = Math.floor((row.totalMinutesWorked || 0) / 60);
                    const mins = (row.totalMinutesWorked || 0) % 60;
                    return `${hours}h ${mins}m`;
                  },
                },
                {
                  key: 'delay',
                  header: 'Atraso',
                  render: (row: any) =>
                    row.delayMinutes > 0 ? (
                      <span className="text-xs font-semibold text-[var(--hr-status-error)]">
                        +{row.delayMinutes} min
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--hr-status-success)]">Pontual</span>
                    ),
                },
                {
                  key: 'overtime',
                  header: 'Horas Extras',
                  render: (row: any) =>
                    row.overtimeMinutes > 0 ? (
                      <span className="text-xs font-medium text-[var(--hr-primary)]">
                        +{row.overtimeMinutes} min ({row.overtimeStatus})
                      </span>
                    ) : (
                      '—'
                    ),
                },
                {
                  key: 'status',
                  header: 'Estado',
                  render: (row: any) => {
                    if (row.status === 'ATRASO') return <HrBadge variant="warning">Atraso</HrBadge>;
                    if (row.status === 'SAIDA_EM_FALTA') return <HrBadge variant="error">Saída em Falta</HrBadge>;
                    if (row.status === 'NORMAL') return <HrBadge variant="success">Normal</HrBadge>;
                    return <HrBadge variant="neutral">{row.status}</HrBadge>;
                  },
                },
              ]}
              data={workDays}
              keyExtractor={(item: any) => item.id}
              emptyMessage="Nenhum registo de assiduidade encontrado para esta data."
            />
          </div>

          <div className="sm:hidden">
            <HrCardList<any>
              items={workDays}
              emptyMessage="Nenhum registo de assiduidade encontrado para esta data."
              renderItem={(row: any) => ({
                item: row,
                key: row.id,
                title: row.employee?.fullName || 'Colaborador',
                subtitle: row.employee?.employeeNumber,
                badge: (
                  <HrBadge variant={row.status === 'NORMAL' ? 'success' : row.status === 'ATRASO' ? 'warning' : 'error'}>
                    {row.status}
                  </HrBadge>
                ),
                fields: [
                  {
                    label: 'Entrada',
                    value: row.actualIn
                      ? new Date(row.actualIn).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
                      : '—',
                  },
                  {
                    label: 'Saída',
                    value: row.actualOut
                      ? new Date(row.actualOut).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
                      : '—',
                  },
                  {
                    label: 'Horas',
                    value: `${Math.floor((row.totalMinutesWorked || 0) / 60)}h ${(row.totalMinutesWorked || 0) % 60}m`,
                  },
                ],
              })}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Pedidos de Correcção */}
      {activeTab === 'correcoes' && (
        <div className="space-y-4">
          <HrTable<any>
            columns={[
              {
                key: 'employee',
                header: 'Colaborador',
                render: (row: any) => (
                  <div>
                    <div className="font-medium text-[var(--hr-text)]">{row.employee?.fullName}</div>
                    <div className="text-xs text-[var(--hr-text-muted)]">{row.date}</div>
                  </div>
                ),
              },
              {
                key: 'type',
                header: 'Tipo Solicitado',
                render: (row: any) => <HrBadge variant="neutral">{row.targetEntryType}</HrBadge>,
              },
              {
                key: 'time',
                header: 'Hora Pedida',
                render: (row: any) =>
                  new Date(row.requestedTime).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
              },
              {
                key: 'reason',
                header: 'Justificação',
                render: (row: any) => <span className="text-xs text-[var(--hr-text)]">{row.reason}</span>,
              },
              {
                key: 'actions',
                header: 'Ações',
                render: (row: any) => (
                  <div className="flex items-center gap-1.5">
                    <HrButton
                      size="sm"
                      variant="primary"
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenReview(row, 'correcao', 'APROVADO')}
                    >
                      Aprovar
                    </HrButton>
                    <HrButton
                      size="sm"
                      variant="outline"
                      className="text-[var(--hr-status-error)] hover:bg-[var(--hr-status-error-bg)]"
                      leftIcon={<X className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenReview(row, 'correcao', 'REJEITADO')}
                    >
                      Rejeitar
                    </HrButton>
                  </div>
                ),
              },
            ]}
            data={corrections}
            keyExtractor={(item: any) => item.id}
            emptyMessage="Não há pedidos de correcção de ponto pendentes."
          />
        </div>
      )}

      {/* Tab 3: Horas Extras */}
      {activeTab === 'overtime' && (
        <div className="space-y-4">
          <HrTable<any>
            columns={[
              {
                key: 'employee',
                header: 'Colaborador',
                render: (row: any) => (
                  <div>
                    <div className="font-medium text-[var(--hr-text)]">{row.employee?.fullName}</div>
                    <div className="text-xs text-[var(--hr-text-muted)]">Data: {row.date}</div>
                  </div>
                ),
              },
              {
                key: 'overtime',
                header: 'Minutos Suplementares',
                render: (row: any) => (
                  <span className="font-bold text-[var(--hr-primary)]">{row.overtimeMinutes} min</span>
                ),
              },
              {
                key: 'worked',
                header: 'Total Trabalhado',
                render: (row: any) => {
                  const hours = Math.floor((row.totalMinutesWorked || 0) / 60);
                  const mins = (row.totalMinutesWorked || 0) % 60;
                  return `${hours}h ${mins}m`;
                },
              },
              {
                key: 'actions',
                header: 'Ações de Validação',
                render: (row: any) => (
                  <div className="flex items-center gap-1.5">
                    <HrButton
                      size="sm"
                      variant="primary"
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenReview(row, 'overtime', 'APROVADO')}
                    >
                      Aprovar
                    </HrButton>
                    <HrButton
                      size="sm"
                      variant="outline"
                      className="text-[var(--hr-status-error)] hover:bg-[var(--hr-status-error-bg)]"
                      leftIcon={<X className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenReview(row, 'overtime', 'REJEITADO')}
                    >
                      Rejeitar
                    </HrButton>
                  </div>
                ),
              },
            ]}
            data={overtimes}
            keyExtractor={(item: any) => item.id}
            emptyMessage="Não há horas extras pendentes de aprovação."
          />
        </div>
      )}

      {/* Modal: Registar Ponto Manual (RH) */}
      <HrDialog
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Registar Ponto Manual (RH)"
        description="Registo de picagem excecional efetuado pelos Recursos Humanos com auditoria."
      >
        <form onSubmit={handleManualSubmit} className="space-y-4 pt-2">
          <HrField label="Colaborador" required>
            <HrSelect
              value={manualForm.employeeId}
              onChange={(e) => setManualForm({ ...manualForm, employeeId: e.target.value })}
              options={[
                { value: '', label: 'Selecione o colaborador...' },
                ...employees.map((emp) => ({
                  value: emp.id,
                  label: `${emp.fullName} (${emp.employeeNumber})`,
                })),
              ]}
            />
          </HrField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <HrField label="Tipo de Ponto" required>
              <HrSelect
                value={manualForm.type}
                onChange={(e) => setManualForm({ ...manualForm, type: e.target.value })}
                options={[
                  { value: 'ENTRADA', label: 'Entrada' },
                  { value: 'INICIO_PAUSA', label: 'Início de Pausa' },
                  { value: 'FIM_PAUSA', label: 'Fim de Pausa' },
                  { value: 'SAIDA', label: 'Saída' },
                ]}
              />
            </HrField>

            <HrField label="Data" required>
              <HrInput
                type="date"
                value={manualForm.date}
                onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
              />
            </HrField>

            <HrField label="Hora" required>
              <HrInput
                type="time"
                value={manualForm.time}
                onChange={(e) => setManualForm({ ...manualForm, time: e.target.value })}
              />
            </HrField>
          </div>

          <HrField label="Motivo Obrigatório (Auditoria)" required>
            <textarea
              value={manualForm.notes}
              onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
              rows={3}
              placeholder="Ex: Falha temporária no telemóvel do colaborador no local de trabalho..."
              className="w-full px-3 py-2 text-xs bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] text-[var(--hr-text)] focus:outline-none focus:border-[var(--hr-primary)]"
            />
          </HrField>

          <div className="flex justify-end gap-2 pt-2">
            <HrButton
              type="button"
              variant="outline"
              onClick={() => setIsManualModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </HrButton>
            <HrButton type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Gravando...' : 'Gravar Ponto'}
            </HrButton>
          </div>
        </form>
      </HrDialog>

      {/* Modal: Decisão de Aprovação / Rejeição */}
      <HrDialog
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={reviewDecision === 'APROVADO' ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}
        description={
          reviewDecision === 'APROVADO'
            ? 'O registo será validado e recalculado no dia de trabalho correspondente.'
            : 'Por favor, indique a fundamentação para a recusa do pedido.'
        }
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
          <HrField label="Observação / Fundamentação (Opcional)">
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={3}
              placeholder="Escreva uma nota de fundamentação..."
              className="w-full px-3 py-2 text-xs bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] text-[var(--hr-text)] focus:outline-none focus:border-[var(--hr-primary)]"
            />
          </HrField>

          <div className="flex justify-end gap-2 pt-2">
            <HrButton
              type="button"
              variant="outline"
              onClick={() => setIsReviewModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </HrButton>
            <HrButton
              type="submit"
              variant={reviewDecision === 'APROVADO' ? 'primary' : 'outline'}
              className={
                reviewDecision === 'REJEITADO'
                  ? 'bg-[var(--hr-status-error)] text-white hover:opacity-90'
                  : ''
              }
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Processando...'
                : reviewDecision === 'APROVADO'
                ? 'Confirmar Aprovação'
                : 'Confirmar Rejeição'}
            </HrButton>
          </div>
        </form>
      </HrDialog>
    </div>
  );
}
