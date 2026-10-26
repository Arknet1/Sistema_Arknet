'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Palmtree,
  FileText,
  Clock,
  Check,
  X,
  ShieldAlert,
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

export default function RhAusenciasPage() {
  const toast = useHrToast();

  const [activeTab, setActiveTab] = useState('pedidos');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [requests, setRequests] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);

  // Decision Modal
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [decision, setDecision] = useState<'APROVADO' | 'REJEITADO'>('APROVADO');
  const [decisionComment, setDecisionComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create Leave Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    employeeId: '',
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (filterStatus) query.set('status', filterStatus);
      if (filterType) query.set('type', filterType);

      const [reqRes, typesRes, empRes, holRes] = await Promise.all([
        fetch(`/api/rh/ausencias?${query.toString()}`),
        fetch('/api/rh/configuracao/tipos-licenca'),
        fetch('/api/rh/funcionarios?limit=100&status=ACTIVO'),
        fetch('/api/rh/configuracao/feriados'),
      ]);

      const [reqData, typesData, empData, holData] = await Promise.all([
        reqRes.json().catch(() => ({})),
        typesRes.json().catch(() => ({})),
        empRes.json().catch(() => ({})),
        holRes.json().catch(() => ({})),
      ]);

      if (reqData.success) setRequests(reqData.requests || []);
      if (typesData.success) setLeaveTypes(typesData.leaveTypes || []);
      if (empData.success) setEmployees(empData.employees || []);
      if (holData.success) setHolidays(holData.holidays || []);
    } catch {
      toast.error('Erro ao carregar dados de ausências');
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, filterType, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Review Decision
  const handleOpenDecision = (req: any, status: 'APROVADO' | 'REJEITADO') => {
    setSelectedRequest(req);
    setDecision(status);
    setDecisionComment('');
    setIsDecisionModalOpen(true);
  };

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/rh/ausencias/${selectedRequest.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: decision,
          reviewComment: decisionComment.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          decision === 'APROVADO'
            ? 'Pedido de ausência aprovado com sucesso'
            : 'Pedido de ausência rejeitado com sucesso'
        );
        setIsDecisionModalOpen(false);
        setSelectedRequest(null);
        loadData();
      } else {
        toast.error(data.error || 'Erro ao processar decisão');
      }
    } catch {
      toast.error('Erro de ligação ao processar pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Manual Leave Creation
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.employeeId || !createForm.leaveTypeId || !createForm.startDate || !createForm.endDate) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/rh/ausencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Pedido registado com sucesso');
        setIsCreateModalOpen(false);
        setCreateForm({
          employeeId: '',
          leaveTypeId: '',
          startDate: '',
          endDate: '',
          reason: '',
        });
        loadData();
      } else {
        toast.error(data.error || 'Erro ao criar pedido de ausência');
      }
    } catch {
      toast.error('Erro de ligação ao criar pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'PENDENTE').length;

  const tabs = [
    {
      id: 'pedidos',
      label: 'Pedidos de Ausência',
      badge: pendingCount > 0 ? String(pendingCount) : undefined,
    },
    {
      id: 'saldos',
      label: 'Saldos de Férias 2026',
    },
    {
      id: 'feriados',
      label: 'Feriados Oficiais Angola',
      badge: holidays.length ? String(holidays.length) : undefined,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <HrPageHeader
        title="Ausências & Férias"
        subtitle="Gestão de férias regulamentares (LGT Angola), baixas médicas, licenças de parentalidade e casamento."
        actions={
          <div className="flex items-center gap-2">
            <HrButton
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Lançar Ausência (RH)
            </HrButton>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--hr-text-muted)]">Pendentes de Validação</span>
            <Clock className="w-4 h-4 text-[var(--hr-accent)]" />
          </div>
          <div className="text-2xl font-bold text-[var(--hr-text)] mt-2">{pendingCount}</div>
          <span className="text-[11px] text-[var(--hr-text-muted)] mt-1 block">Aguardam aprovação 4-olhos</span>
        </div>

        <div className="p-4 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--hr-text-muted)]">Direito Anual Base</span>
            <Palmtree className="w-4 h-4 text-[var(--hr-primary)]" />
          </div>
          <div className="text-2xl font-bold text-[var(--hr-text)] mt-2">22 Dias</div>
          <span className="text-[11px] text-[var(--hr-status-success)] mt-1 block font-medium">
            LGT Artigo 132.º (Dias Úteis)
          </span>
        </div>

        <div className="p-4 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--hr-text-muted)]">Aprovados este Ano</span>
            <CheckCircle2 className="w-4 h-4 text-[var(--hr-status-success)]" />
          </div>
          <div className="text-2xl font-bold text-[var(--hr-text)] mt-2">
            {requests.filter((r) => r.status === 'APROVADO').length}
          </div>
          <span className="text-[11px] text-[var(--hr-text-muted)] mt-1 block">Férias e dispensas autorizadas</span>
        </div>

        <div className="p-4 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--hr-text-muted)]">Feriados em 2026</span>
            <CalendarDays className="w-4 h-4 text-[var(--hr-primary)]" />
          </div>
          <div className="text-2xl font-bold text-[var(--hr-text)] mt-2">{holidays.length}</div>
          <span className="text-[11px] text-[var(--hr-text-muted)] mt-1 block">Excluídos no cálculo de férias</span>
        </div>
      </div>

      {/* Tabs */}
      <HrTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Pedidos de Ausência */}
      {activeTab === 'pedidos' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius-sm)] text-[var(--hr-text)]"
            >
              <option value="">Todos os Estados</option>
              <option value="PENDENTE">Pendentes</option>
              <option value="APROVADO">Aprovados</option>
              <option value="REJEITADO">Rejeitados</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius-sm)] text-[var(--hr-text)]"
            >
              <option value="">Todos os Tipos de Licença</option>
              {leaveTypes.map((t) => (
                <option key={t.id} value={t.code}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:block">
            <HrTable<any>
              columns={[
                {
                  key: 'employee',
                  header: 'Colaborador',
                  render: (row: any) => (
                    <div>
                      <div className="font-medium text-[var(--hr-text)]">{row.employee?.fullName}</div>
                      <div className="text-xs text-[var(--hr-text-muted)]">{row.employee?.department?.name}</div>
                    </div>
                  ),
                },
                {
                  key: 'type',
                  header: 'Tipo',
                  render: (row: any) => <HrBadge variant="neutral">{row.leaveType?.name}</HrBadge>,
                },
                {
                  key: 'dates',
                  header: 'Período',
                  render: (row: any) => {
                    const start = new Date(row.startDate).toLocaleDateString('pt-AO');
                    const end = new Date(row.endDate).toLocaleDateString('pt-AO');
                    return (
                      <span className="text-xs text-[var(--hr-text)]">
                        {start} a {end}
                      </span>
                    );
                  },
                },
                {
                  key: 'days',
                  header: 'Dias Úteis',
                  render: (row: any) => (
                    <span className="font-semibold text-xs text-[var(--hr-primary)]">
                      {row.workingDaysCount} {row.workingDaysCount === 1 ? 'dia' : 'dias'}
                    </span>
                  ),
                },
                {
                  key: 'status',
                  header: 'Estado',
                  render: (row: any) => {
                    if (row.status === 'APROVADO') return <HrBadge variant="success">Aprovado</HrBadge>;
                    if (row.status === 'REJEITADO') return <HrBadge variant="error">Rejeitado</HrBadge>;
                    return <HrBadge variant="warning">Pendente</HrBadge>;
                  },
                },
                {
                  key: 'actions',
                  header: 'Ações',
                  render: (row: any) =>
                    row.status === 'PENDENTE' ? (
                      <div className="flex items-center gap-1.5">
                        <HrButton
                          size="sm"
                          variant="primary"
                          leftIcon={<Check className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenDecision(row, 'APROVADO')}
                        >
                          Aprovar
                        </HrButton>
                        <HrButton
                          size="sm"
                          variant="outline"
                          className="text-[var(--hr-status-error)] hover:bg-[var(--hr-status-error-bg)]"
                          leftIcon={<X className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenDecision(row, 'REJEITADO')}
                        >
                          Rejeitar
                        </HrButton>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--hr-text-muted)]">
                        {row.reviewedByName ? `Revisto por ${row.reviewedByName}` : 'Concluído'}
                      </span>
                    ),
                },
              ]}
              data={requests}
              keyExtractor={(item: any) => item.id}
              emptyMessage="Nenhum pedido de ausência encontrado com os filtros selecionados."
            />
          </div>

          <div className="sm:hidden">
            <HrCardList<any>
              items={requests}
              emptyMessage="Nenhum pedido de ausência encontrado."
              renderItem={(row: any) => ({
                item: row,
                key: row.id,
                title: row.employee?.fullName,
                subtitle: row.leaveType?.name,
                badge: (
                  <HrBadge variant={row.status === 'APROVADO' ? 'success' : row.status === 'REJEITADO' ? 'error' : 'warning'}>
                    {row.status}
                  </HrBadge>
                ),
                fields: [
                  {
                    label: 'Período',
                    value: `${new Date(row.startDate).toLocaleDateString('pt-AO')} a ${new Date(row.endDate).toLocaleDateString('pt-AO')}`,
                  },
                  {
                    label: 'Duração',
                    value: `${row.workingDaysCount} dias úteis`,
                  },
                ],
                actions:
                  row.status === 'PENDENTE' ? (
                    <div className="flex gap-2 pt-1 w-full">
                      <HrButton
                        size="sm"
                        variant="primary"
                        className="flex-1"
                        onClick={() => handleOpenDecision(row, 'APROVADO')}
                      >
                        Aprovar
                      </HrButton>
                      <HrButton
                        size="sm"
                        variant="outline"
                        className="flex-1 text-[var(--hr-status-error)]"
                        onClick={() => handleOpenDecision(row, 'REJEITADO')}
                      >
                        Rejeitar
                      </HrButton>
                    </div>
                  ) : undefined,
              })}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Mapa de Saldos de Férias 2026 */}
      {activeTab === 'saldos' && (
        <div className="space-y-4">
          <HrTable<any>
            columns={[
              {
                key: 'employee',
                header: 'Colaborador',
                render: (row: any) => (
                  <div>
                    <div className="font-medium text-[var(--hr-text)]">{row.fullName}</div>
                    <div className="text-xs text-[var(--hr-text-muted)]">{row.employeeNumber}</div>
                  </div>
                ),
              },
              {
                key: 'department',
                header: 'Departamento',
                render: (row: any) => row.department?.name || '—',
              },
              {
                key: 'entitled',
                header: 'Direito Anual (2026)',
                render: (row: any) => {
                  const bal = row.leaveBalances?.[0];
                  return `${bal?.entitledDays ?? 22} dias`;
                },
              },
              {
                key: 'used',
                header: 'Dias Gozados',
                render: (row: any) => {
                  const bal = row.leaveBalances?.[0];
                  return (
                    <span className="font-medium text-[var(--hr-status-warning)]">
                      {bal?.usedDays ?? 0} dias
                    </span>
                  );
                },
              },
              {
                key: 'pending',
                header: 'Dias Pendentes',
                render: (row: any) => {
                  const bal = row.leaveBalances?.[0];
                  return `${bal?.pendingDays ?? 0} dias`;
                },
              },
              {
                key: 'balance',
                header: 'Saldo Disponível',
                render: (row: any) => {
                  const bal = row.leaveBalances?.[0];
                  const total = bal?.entitledDays ?? 22;
                  const used = bal?.usedDays ?? 0;
                  const pending = bal?.pendingDays ?? 0;
                  const available = total - used - pending;
                  return (
                    <span className="font-bold text-sm text-[var(--hr-status-success)]">
                      {available} dias
                    </span>
                  );
                },
              },
            ]}
            data={employees}
            keyExtractor={(item: any) => item.id}
            emptyMessage="Nenhum colaborador encontrado."
          />
        </div>
      )}

      {/* Tab 3: Feriados Oficiais Angola */}
      {activeTab === 'feriados' && (
        <div className="space-y-4">
          <div className="p-4 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--hr-text)] mb-1">
              Feriados Nacionais Obrigatórios (Lei Geral do Trabalho de Angola)
            </h4>
            <p className="text-xs text-[var(--hr-text-muted)] leading-relaxed">
              Os feriados nacionais não contam para a contagem do período de férias dos colaboradores (Art. 132.º LGT).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {holidays.map((h) => (
              <div
                key={h.id}
                className="p-3 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] flex items-start gap-3 shadow-[var(--hr-shadow-sm)]"
              >
                <div className="p-2 bg-[var(--hr-primary-soft)] rounded-[var(--hr-radius-sm)] text-[var(--hr-primary)]">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-[var(--hr-text)] truncate">{h.name}</div>
                  <div className="text-[11px] text-[var(--hr-text-muted)] mt-0.5 font-mono">{h.date}</div>
                  <div className="mt-1">
                    <HrBadge variant="success" size="sm">
                      {h.status}
                    </HrBadge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Lançar Ausência (RH) */}
      <HrDialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Lançar Pedido de Ausência (RH)"
        description="Registo de ausência efetuado pela equipa de Recursos Humanos."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
          <HrField label="Colaborador" required>
            <HrSelect
              value={createForm.employeeId}
              onChange={(e) => setCreateForm({ ...createForm, employeeId: e.target.value })}
              options={[
                { value: '', label: 'Selecione o colaborador...' },
                ...employees.map((emp) => ({
                  value: emp.id,
                  label: `${emp.fullName} (${emp.employeeNumber})`,
                })),
              ]}
            />
          </HrField>

          <HrField label="Tipo de Licença / Ausência" required>
            <HrSelect
              value={createForm.leaveTypeId}
              onChange={(e) => setCreateForm({ ...createForm, leaveTypeId: e.target.value })}
              options={[
                { value: '', label: 'Selecione o tipo de licença...' },
                ...leaveTypes.map((t) => ({
                  value: t.id,
                  label: `${t.name} ${t.deductsFromBalance ? '(Deduz Saldo de Férias)' : ''}`,
                })),
              ]}
            />
          </HrField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <HrField label="Data de Início" required>
              <HrInput
                type="date"
                value={createForm.startDate}
                onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
              />
            </HrField>

            <HrField label="Data de Fim" required>
              <HrInput
                type="date"
                value={createForm.endDate}
                onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
              />
            </HrField>
          </div>

          <HrField label="Motivo / Fundamentação">
            <textarea
              value={createForm.reason}
              onChange={(e) => setCreateForm({ ...createForm, reason: e.target.value })}
              rows={3}
              placeholder="Descreva a justificação da ausência..."
              className="w-full px-3 py-2 text-xs bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] text-[var(--hr-text)] focus:outline-none focus:border-[var(--hr-primary)]"
            />
          </HrField>

          <div className="flex justify-end gap-2 pt-2">
            <HrButton
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </HrButton>
            <HrButton type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Registando...' : 'Registar Ausência'}
            </HrButton>
          </div>
        </form>
      </HrDialog>

      {/* Modal: Decisão de Pedido */}
      <HrDialog
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        title={decision === 'APROVADO' ? 'Aprovar Pedido de Ausência' : 'Rejeitar Pedido de Ausência'}
        description={
          decision === 'APROVADO'
            ? 'Ao aprovar, os dias úteis serão deduzidos do saldo caso aplicável.'
            : 'Por favor, indique a fundamentação para a rejeição do pedido.'
        }
      >
        <form onSubmit={handleDecisionSubmit} className="space-y-4 pt-2">
          {selectedRequest && (
            <div className="p-3 bg-[var(--hr-bg)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] text-xs space-y-1">
              <div>
                <span className="font-semibold text-[var(--hr-text)]">Colaborador:</span>{' '}
                {selectedRequest.employee?.fullName}
              </div>
              <div>
                <span className="font-semibold text-[var(--hr-text)]">Tipo:</span>{' '}
                {selectedRequest.leaveType?.name}
              </div>
              <div>
                <span className="font-semibold text-[var(--hr-text)]">Duração:</span>{' '}
                {selectedRequest.workingDaysCount} dias úteis
              </div>
            </div>
          )}

          <HrField label="Nota / Fundamentação do Revisor">
            <textarea
              value={decisionComment}
              onChange={(e) => setDecisionComment(e.target.value)}
              rows={3}
              placeholder="Observações da decisão..."
              className="w-full px-3 py-2 text-xs bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] text-[var(--hr-text)] focus:outline-none focus:border-[var(--hr-primary)]"
            />
          </HrField>

          <div className="flex justify-end gap-2 pt-2">
            <HrButton
              type="button"
              variant="outline"
              onClick={() => setIsDecisionModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </HrButton>
            <HrButton
              type="submit"
              variant={decision === 'APROVADO' ? 'primary' : 'outline'}
              className={
                decision === 'REJEITADO'
                  ? 'bg-[var(--hr-status-error)] text-white hover:opacity-90'
                  : ''
              }
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Processando...'
                : decision === 'APROVADO'
                ? 'Confirmar Aprovação'
                : 'Confirmar Rejeição'}
            </HrButton>
          </div>
        </form>
      </HrDialog>
    </div>
  );
}
