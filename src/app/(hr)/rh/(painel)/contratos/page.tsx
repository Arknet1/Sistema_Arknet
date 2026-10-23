'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileCheck, Plus, Search } from 'lucide-react';
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
} from '@/components/hr';
import { useHrToast } from '@/components/hr/hr-toast';

export default function RhContratosPage() {
  const toast = useHrToast();
  const [contracts, setContracts] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: '',
    contractNumber: '',
    type: 'INDETERMINADO',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    baseSalary: '',
    workDays: 'SEG-SEX',
    dailyHours: '8',
    weeklyHours: '40',
    status: 'ACTIVO',
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (filterStatus) query.set('status', filterStatus);

      const [ctrRes, empRes] = await Promise.all([
        fetch(`/api/rh/contratos?${query.toString()}`),
        fetch('/api/rh/funcionarios?limit=100&status=ACTIVO'),
      ]);

      const [ctrData, empData] = await Promise.all([
        ctrRes.json().catch(() => ({})),
        empRes.json().catch(() => ({})),
      ]);

      if (ctrData.success) setContracts(ctrData.contracts || []);
      if (empData.success) setEmployees(empData.employees || []);
    } catch {
      toast.error('Erro ao carregar contratos');
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setFormData({
      employeeId: '',
      contractNumber: '',
      type: 'INDETERMINADO',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      baseSalary: '',
      workDays: 'SEG-SEX',
      dailyHours: '8',
      weeklyHours: '40',
      status: 'ACTIVO',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId) {
      setFormError('Seleccione o colaborador.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch('/api/rh/contratos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        toast.success('Contrato registado com sucesso.');
        setIsModalOpen(false);
        loadData();
      } else {
        setFormError(data.error || 'Erro ao registar contrato.');
      }
    } catch {
      setFormError('Erro de ligação ao servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredContracts = contracts.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const empName = c.employee?.fullName?.toLowerCase() || '';
    const num = c.contractNumber?.toLowerCase() || '';
    return empName.includes(q) || num.includes(q);
  });

  return (
    <div className="space-y-5">
      <HrPageHeader
        title="Gestão Contratual"
        subtitle="Vínculos contratuais e prazos de caducidade na J.Matos"
        breadcrumbs={[
          { label: 'Recursos Humanos', href: '/rh' },
          { label: 'Contratos' },
        ]}
        actions={
          <HrButton
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Novo Contrato
          </HrButton>
        }
      />

      {/* Search and Filters */}
      <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-3 sm:p-4 shadow-[var(--hr-shadow-sm)] flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <HrInput
            type="text"
            placeholder="Pesquisar por colaborador ou número de contrato..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-[var(--hr-text-muted)]" />}
          />
        </div>

        <div className="w-full sm:w-48">
          <HrSelect
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Todos os Estados</option>
            <option value="ACTIVO">Activo</option>
            <option value="TERMINADO">Terminado</option>
            <option value="RESCINDIDO">Rescindido</option>
          </HrSelect>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block">
        <HrTable
          columns={[
            {
              key: 'employee',
              header: 'Colaborador',
              render: (r) => (
                <div>
                  <div className="font-bold text-[var(--hr-text)]">
                    {r.employee?.fullName || '—'}
                  </div>
                  <div className="text-xs text-[var(--hr-text-muted)] font-mono">
                    {r.employee?.employeeNumber} · {r.contractNumber || 'S/N'}
                  </div>
                </div>
              ),
            },
            {
              key: 'type',
              header: 'Modalidade',
              render: (r) => <span className="text-xs text-[var(--hr-text)]">{r.type}</span>,
            },
            {
              key: 'dates',
              header: 'Vigência',
              render: (r) => (
                <div className="text-xs tabular-nums">
                  <div>Início: {new Date(r.startDate).toLocaleDateString('pt-AO')}</div>
                  <div className="text-[var(--hr-text-muted)]">
                    Fim: {r.endDate ? new Date(r.endDate).toLocaleDateString('pt-AO') : 'Indeterminado'}
                  </div>
                </div>
              ),
            },
            {
              key: 'salary',
              header: 'Vencimento Base',
              align: 'right',
              render: (r) => (
                <span className="font-mono text-xs font-semibold tabular-nums">
                  {r.baseSalary ? `${Number(r.baseSalary).toLocaleString('pt-AO')} Kz` : '—'}
                </span>
              ),
            },
            {
              key: 'status',
              header: 'Estado',
              align: 'center',
              width: '100px',
              render: (r) => (
                <HrBadge variant={r.status === 'ACTIVO' ? 'success' : 'neutral'} size="sm">
                  {r.status}
                </HrBadge>
              ),
            },
          ]}
          data={filteredContracts}
          keyExtractor={(r) => r.id}
          isLoading={isLoading}
          emptyMessage="Nenhum contrato encontrado."
        />
      </div>

      {/* Mobile Card List View */}
      <div className="sm:hidden">
        <HrCardList
          items={filteredContracts}
          isLoading={isLoading}
          emptyMessage="Nenhum contrato encontrado."
          renderItem={(r) => ({
            item: r,
            key: r.id,
            title: r.employee?.fullName || 'Colaborador',
            subtitle: `${r.type} · ${r.contractNumber || 'S/N'}`,
            badge: (
              <HrBadge variant={r.status === 'ACTIVO' ? 'success' : 'neutral'} size="sm">
                {r.status}
              </HrBadge>
            ),
            fields: [
              {
                label: 'Início',
                value: new Date(r.startDate).toLocaleDateString('pt-AO'),
              },
              {
                label: 'Fim',
                value: r.endDate ? new Date(r.endDate).toLocaleDateString('pt-AO') : 'Indeterminado',
              },
            ],
          })}
        />
      </div>

      {/* Create Contract Modal */}
      <HrDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registar Novo Contrato de Trabalho"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-[var(--hr-status-error-bg)] border border-[var(--hr-status-error)] rounded-[var(--hr-radius-sm)] text-xs text-[var(--hr-status-error)] font-medium">
              {formError}
            </div>
          )}

          <HrField label="Colaborador" required>
            <HrSelect
              required
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            >
              <option value="">Seleccione o colaborador</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.fullName} ({e.employeeNumber})
                </option>
              ))}
            </HrSelect>
          </HrField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <HrField label="Tipo de Contrato" required>
              <HrSelect
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="INDETERMINADO">Tempo Indeterminado (Efectivo)</option>
                <option value="DETERMINADO">Termo Certo (Determinado)</option>
                <option value="ESTAGIO">Estágio Profissional</option>
                <option value="PRESTACAO_SERVICOS">Prestação de Serviços</option>
              </HrSelect>
            </HrField>

            <HrField label="Número do Contrato (Opcional)">
              <HrInput
                placeholder="Ex: CT-2026/012"
                value={formData.contractNumber}
                onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
              />
            </HrField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <HrField label="Data de Início" required>
              <HrInput
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </HrField>

            <HrField label="Data de Fim (se termo certo)">
              <HrInput
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </HrField>
          </div>

          <HrField label="Salário Base Mensal (Kz)">
            <HrInput
              type="number"
              placeholder="Ex: 450000"
              value={formData.baseSalary}
              onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
            />
          </HrField>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--hr-border)]">
            <HrButton
              type="button"
              variant="outline"
              size="md"
              disabled={isSubmitting}
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </HrButton>
            <HrButton type="submit" variant="primary" size="md" isLoading={isSubmitting}>
              Registar Contrato
            </HrButton>
          </div>
        </form>
      </HrDialog>
    </div>
  );
}
