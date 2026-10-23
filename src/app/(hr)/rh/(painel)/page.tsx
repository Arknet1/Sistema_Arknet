'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  FileCheck,
  AlertTriangle,
  UserPlus,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  HrPageHeader,
  HrButton,
  HrBadge,
  HrTable,
  HrCardList,
  HrEmptyState,
} from '@/components/hr';
import { useHrToast } from '@/components/hr/hr-toast';

export default function RhOverviewPage() {
  const toast = useHrToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAlerting, setIsAlerting] = useState(false);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    departmentsCount: 0,
    contractsExpiring: 0,
    docsExpiring: 0,
  });
  const [recentEmployees, setRecentEmployees] = useState<any[]>([]);
  const [expiringContracts, setExpiringContracts] = useState<any[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [empRes, deptRes, ctrRes, docRes] = await Promise.all([
        fetch('/api/rh/funcionarios?limit=6'),
        fetch('/api/rh/departamentos'),
        fetch('/api/rh/contratos?expiringSoon=true'),
        fetch('/api/rh/documentos?expiringSoon=true'),
      ]);

      const [empData, deptData, ctrData, docData] = await Promise.all([
        empRes.json().catch(() => ({})),
        deptRes.json().catch(() => ({})),
        ctrRes.json().catch(() => ({})),
        docRes.json().catch(() => ({})),
      ]);

      if (empData.success) {
        setRecentEmployees(empData.employees || []);
        const total = empData.pagination?.total ?? (empData.employees || []).length;
        const active = (empData.employees || []).filter((e: any) => e.status === 'ACTIVO').length;
        setStats((prev) => ({
          ...prev,
          totalEmployees: total,
          activeEmployees: active,
        }));
      }

      if (deptData.success) {
        setStats((prev) => ({
          ...prev,
          departmentsCount: (deptData.departments || []).length,
        }));
      }

      if (ctrData.success) {
        setExpiringContracts(ctrData.contracts || []);
        setStats((prev) => ({
          ...prev,
          contractsExpiring: (ctrData.contracts || []).length,
        }));
      }

      if (docData.success) {
        setStats((prev) => ({
          ...prev,
          docsExpiring: (docData.documents || []).length,
        }));
      }
    } catch {
      toast.error('Não foi possível carregar os dados actualizados.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunAlerts = async () => {
    setIsAlerting(true);
    try {
      const res = await fetch('/api/rh/cron/alertas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast.success(
          `Varredura concluída. ${data.summary?.sent ?? 0} alerta(s) processado(s).`,
          'Alertas de Caducidade'
        );
        loadData();
      } else {
        toast.warning(data.error || 'Nenhum alerta pendente ou não autorizado.');
      }
    } catch {
      toast.error('Erro de ligação ao processar alertas de caducidade.');
    } finally {
      setIsAlerting(false);
    }
  };

  const statusBadge = (st: string) => {
    switch (st) {
      case 'ACTIVO':
        return <HrBadge variant="success" dot size="sm">Activo</HrBadge>;
      case 'DESLIGADO':
        return <HrBadge variant="error" size="sm">Desligado</HrBadge>;
      case 'FERIAS':
        return <HrBadge variant="info" size="sm">Férias</HrBadge>;
      case 'SUSPENSO':
        return <HrBadge variant="warning" size="sm">Suspenso</HrBadge>;
      default:
        return <HrBadge variant="neutral" size="sm">{st}</HrBadge>;
    }
  };

  return (
    <div className="space-y-6">
      <HrPageHeader
        title="Visão Geral"
        subtitle="J.Matos Tecnologia · Painel de Gestão e Controlo de Recursos Humanos"
        actions={
          <>
            <HrButton
              variant="outline"
              size="sm"
              onClick={handleRunAlerts}
              isLoading={isAlerting}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Verificar Alertas
            </HrButton>
            <Link href="/rh/funcionarios?novo=true">
              <HrButton
                variant="primary"
                size="sm"
                leftIcon={<UserPlus className="w-4 h-4" />}
              >
                Novo Colaborador
              </HrButton>
            </Link>
          </>
        }
      />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)]">
          <div className="flex items-center justify-between text-[var(--hr-text-muted)]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Colaboradores</span>
            <Users className="w-4 h-4 text-[var(--hr-primary)]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[var(--hr-text)] tabular-nums">
              {stats.totalEmployees}
            </span>
            <span className="text-xs text-[var(--hr-status-success)] font-medium">
              {stats.activeEmployees} activos
            </span>
          </div>
        </div>

        <div className="p-4 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)]">
          <div className="flex items-center justify-between text-[var(--hr-text-muted)]">
            <span className="text-xs font-semibold uppercase tracking-wider">Departamentos</span>
            <Building2 className="w-4 h-4 text-[var(--hr-primary)]" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-[var(--hr-text)] tabular-nums">
              {stats.departmentsCount}
            </span>
          </div>
        </div>

        <div className="p-4 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)]">
          <div className="flex items-center justify-between text-[var(--hr-text-muted)]">
            <span className="text-xs font-semibold uppercase tracking-wider">Contratos a Expirar</span>
            <FileCheck className="w-4 h-4 text-[var(--hr-status-warning)]" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-[var(--hr-text)] tabular-nums">
              {stats.contractsExpiring}
            </span>
            <span className="text-xs text-[var(--hr-text-muted)] ml-2">próximos 60 dias</span>
          </div>
        </div>

        <div className="p-4 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)]">
          <div className="flex items-center justify-between text-[var(--hr-text-muted)]">
            <span className="text-xs font-semibold uppercase tracking-wider">Documentos a Expirar</span>
            <AlertTriangle className="w-4 h-4 text-[var(--hr-status-error)]" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-[var(--hr-text)] tabular-nums">
              {stats.docsExpiring}
            </span>
            <span className="text-xs text-[var(--hr-text-muted)] ml-2">próximos 30 dias</span>
          </div>
        </div>
      </div>

      {/* Grid: Recent Employees & Expiring Contracts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Employees */}
        <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--hr-border-subtle)]">
              <div>
                <h2 className="text-sm font-bold text-[var(--hr-text)]">
                  Colaboradores Recentes
                </h2>
                <p className="text-xs text-[var(--hr-text-muted)]">
                  Últimos colaboradores admitidos na J.Matos
                </p>
              </div>
              <Link
                href="/rh/funcionarios"
                className="text-xs font-semibold text-[var(--hr-primary)] hover:underline flex items-center gap-1"
              >
                <span>Ver todos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block">
              <HrTable
                columns={[
                  {
                    key: 'employeeNumber',
                    header: 'N.º',
                    width: '90px',
                    render: (r) => (
                      <span className="font-mono text-xs font-bold text-[var(--hr-primary)]">
                        {r.employeeNumber}
                      </span>
                    ),
                  },
                  {
                    key: 'fullName',
                    header: 'Nome Completo',
                    render: (r) => (
                      <div>
                        <div className="font-semibold text-[var(--hr-text)]">{r.fullName}</div>
                        <div className="text-[11px] text-[var(--hr-text-muted)] truncate">
                          {r.position?.title || r.department?.name || '—'}
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'status',
                    header: 'Estado',
                    align: 'center',
                    width: '100px',
                    render: (r) => statusBadge(r.status),
                  },
                ]}
                data={recentEmployees}
                keyExtractor={(r) => r.id}
                isLoading={isLoading}
                emptyMessage="Nenhum colaborador registado."
              />
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden">
              <HrCardList
                items={recentEmployees}
                isLoading={isLoading}
                emptyMessage="Nenhum colaborador registado."
                renderItem={(r) => ({
                  item: r,
                  key: r.id,
                  title: r.fullName,
                  subtitle: `${r.employeeNumber} · ${r.position?.title || 'Sem cargo'}`,
                  badge: statusBadge(r.status),
                  onClick: () => {
                    window.location.href = `/rh/funcionarios/${r.id}`;
                  },
                })}
              />
            </div>
          </div>
        </div>

        {/* Expiring Contracts / Alerts */}
        <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--hr-border-subtle)]">
              <div>
                <h2 className="text-sm font-bold text-[var(--hr-text)]">
                  Alertas de Caducidade
                </h2>
                <p className="text-xs text-[var(--hr-text-muted)]">
                  Contratos e documentos com renovação urgente
                </p>
              </div>
              <Link
                href="/rh/contratos"
                className="text-xs font-semibold text-[var(--hr-primary)] hover:underline flex items-center gap-1"
              >
                <span>Gestão contratos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block">
              <HrTable
                columns={[
                  {
                    key: 'employee',
                    header: 'Colaborador',
                    render: (r) => (
                      <div>
                        <div className="font-semibold text-[var(--hr-text)]">
                          {r.employee?.fullName || '—'}
                        </div>
                        <div className="text-[11px] text-[var(--hr-text-muted)] font-mono">
                          {r.employee?.employeeNumber}
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'type',
                    header: 'Tipo',
                    render: (r) => (
                      <span className="text-xs text-[var(--hr-text)]">{r.type}</span>
                    ),
                  },
                  {
                    key: 'endDate',
                    header: 'Caducidade',
                    align: 'right',
                    render: (r) => (
                      <span className="text-xs font-bold text-[var(--hr-status-warning)] tabular-nums">
                        {r.endDate ? new Date(r.endDate).toLocaleDateString('pt-AO') : '—'}
                      </span>
                    ),
                  },
                ]}
                data={expiringContracts}
                keyExtractor={(r) => r.id}
                isLoading={isLoading}
                emptyMessage="Nenhum contrato em período crítico de caducidade."
              />
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden">
              <HrCardList
                items={expiringContracts}
                isLoading={isLoading}
                emptyMessage="Nenhum contrato em período crítico de caducidade."
                renderItem={(r) => ({
                  item: r,
                  key: r.id,
                  title: r.employee?.fullName || 'Colaborador',
                  subtitle: `${r.type} · Fim: ${
                    r.endDate ? new Date(r.endDate).toLocaleDateString('pt-AO') : '—'
                  }`,
                  badge: <HrBadge variant="warning" size="sm">A Caducar</HrBadge>,
                })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
