'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Clock,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import {
  HrPageHeader,
  HrButton,
  HrBadge,
  HrTable,
  HrCardList,
  HrEmptyState,
  HrSparkline,
} from '@/components/hr';
import { useHrToast } from '@/components/hr/hr-toast';

export default function RhOverviewPage() {
  const toast = useHrToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAlerting, setIsAlerting] = useState(false);
  const [stats, setStats] = useState({
    activeEmployees: 0,
    contractsExpiring: 0,
    docsExpiring: 0,
  });
  const [recentEmployees, setRecentEmployees] = useState<any[]>([]);
  const [expiringContracts, setExpiringContracts] = useState<any[]>([]);
  const [expiringDocs, setExpiringDocs] = useState<any[]>([]);
  const [departmentStats, setDepartmentStats] = useState<{ name: string; count: number }[]>([]);
  const [actionItems, setActionItems] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [empRes, deptRes, ctrRes, docRes, auditRes] = await Promise.all([
        fetch('/api/rh/funcionarios?limit=50'),
        fetch('/api/rh/departamentos'),
        fetch('/api/rh/contratos?expiringSoon=true'),
        fetch('/api/rh/documentos?expiringSoon=true'),
        fetch('/api/rh/auditoria?limit=8'),
      ]);

      const [empData, deptData, ctrData, docData, auditData] = await Promise.all([
        empRes.json().catch(() => ({})),
        deptRes.json().catch(() => ({})),
        ctrRes.json().catch(() => ({})),
        docRes.json().catch(() => ({})),
        auditRes.json().catch(() => ({})),
      ]);

      const allEmployees: any[] = empData.employees || [];
      const activeEmps = allEmployees.filter((e) => e.status === 'ACTIVO');
      const contractsExp = ctrData.contracts || [];
      const docsExp = docData.documents || [];
      const logs = auditData.logs || [];

      // 1. Stats
      setStats({
        activeEmployees: activeEmps.length,
        contractsExpiring: contractsExp.length,
        docsExpiring: docsExp.length,
      });

      // 2. Recent Employees
      setRecentEmployees(allEmployees.slice(0, 6));

      // 3. Expiring Contracts & Docs
      setExpiringContracts(contractsExp);
      setExpiringDocs(docsExp);

      // 4. Audit Logs
      setAuditLogs(logs);

      // 5. Department Breakdown (simple horizontal bars)
      const allDepts: any[] = deptData.departments || [];
      const deptCounts = allDepts.map((d) => {
        const count = activeEmps.filter((e) => e.departmentId === d.id).length;
        return { name: d.name, count };
      }).sort((a, b) => b.count - a.count);
      setDepartmentStats(deptCounts);

      // 6. Bloco "Por tratar" (Action items)
      const pending: any[] = [];

      // Contratos a expirar nos próximos 60 dias
      contractsExp.forEach((c: any) => {
        pending.push({
          id: `ctr-${c.id}`,
          type: 'contrato',
          label: `Renovar Contrato ${c.contractNumber}`,
          sub: `${c.employee?.fullName || 'Colaborador'} · Vence a ${new Date(c.endDate).toLocaleDateString('pt-AO')}`,
          badge: 'Contrato',
          badgeVariant: 'warning',
          href: `/rh/funcionarios/${c.employeeId}?tab=contratos`,
        });
      });

      // Documentos a expirar nos próximos 30 dias
      docsExp.forEach((d: any) => {
        pending.push({
          id: `doc-${d.id}`,
          type: 'documento',
          label: `Actualizar ${d.title}`,
          sub: `${d.employee?.fullName || 'Colaborador'} · Válido até ${new Date(d.expiresAt).toLocaleDateString('pt-AO')}`,
          badge: 'Documento',
          badgeVariant: 'warning',
          href: `/rh/funcionarios/${d.employeeId}?tab=documentos`,
        });
      });

      // Colaboradores activos sem contrato activo
      activeEmps.forEach((e: any) => {
        if (!e.contracts || e.contracts.length === 0) {
          pending.push({
            id: `no-ctr-${e.id}`,
            type: 'sem_contrato',
            label: 'Adicionar Contrato de Trabalho',
            sub: `${e.fullName} (${e.employeeNumber}) · Sem contrato activo`,
            badge: 'Urgente',
            badgeVariant: 'error',
            href: `/rh/funcionarios/${e.id}?tab=contratos`,
          });
        }
      });

      setActionItems(pending.slice(0, 6));
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
        return <HrBadge variant="error" dot size="sm">Desligado</HrBadge>;
      case 'FERIAS':
        return <HrBadge variant="info" dot size="sm">Férias</HrBadge>;
      case 'SUSPENSO':
        return <HrBadge variant="warning" dot size="sm">Suspenso</HrBadge>;
      default:
        return <HrBadge variant="neutral" dot size="sm">{st}</HrBadge>;
    }
  };

  const maxDeptCount = Math.max(...departmentStats.map((d) => d.count), 1);

  // Sparkline trend data (mock 14-point series for visual illustration)
  const empTrend = [38, 39, 39, 40, 41, 41, 42, 42, 43, 44, 44, 45, stats.activeEmployees, stats.activeEmployees];
  const ctrTrend = [3, 2, 4, 3, 5, 4, 3, 2, 4, 3, 2, 3, stats.contractsExpiring, stats.contractsExpiring];
  const docTrend = [1, 2, 1, 3, 2, 1, 2, 3, 2, 1, 2, 1, stats.docsExpiring, stats.docsExpiring];

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">
      {/* Page Header */}
      <HrPageHeader
        title="Visão Geral"
        subtitle="J.Matos Tecnologia · Painel de Gestão e Controlo de Recursos Humanos"
        actions={
          <div className="flex items-center gap-2">
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
          </div>
        }
      />

      {/* Point 4: 3 Indicators in a row with refined elevation & comfortable typography */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Indicator 1: Colaboradores activos */}
        <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-6 shadow-[var(--hr-shadow-sm)] hover:shadow-[var(--hr-shadow-md)] transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--hr-text-muted)]">
            <span className="text-[13px] font-bold uppercase tracking-wider text-[var(--hr-text-muted)]">
              Colaboradores Activos
            </span>
            <div className="w-8 h-8 rounded-full bg-[var(--hr-surface-muted)] border border-[var(--hr-border-subtle)] flex items-center justify-center">
              <Users className="w-4 h-4 text-[var(--hr-text-muted)]" />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-3xl font-extrabold text-[var(--hr-text)] tabular-nums font-mono tracking-tight">
                {stats.activeEmployees}
              </span>
              <span className="text-[12px] font-semibold text-[var(--hr-status-success)] mt-1.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--hr-status-success)]" />
                Quadro de pessoal em actividade
              </span>
            </div>
            <HrSparkline data={empTrend} width={80} height={28} color="var(--hr-status-success)" />
          </div>
        </div>

        {/* Indicator 2: Contratos a vencer (60 dias) */}
        <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-6 shadow-[var(--hr-shadow-sm)] hover:shadow-[var(--hr-shadow-md)] transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--hr-text-muted)]">
            <span className="text-[13px] font-bold uppercase tracking-wider text-[var(--hr-text-muted)]">
              Contratos a Vencer (60 dias)
            </span>
            <div className="w-8 h-8 rounded-full bg-[var(--hr-surface-muted)] border border-[var(--hr-border-subtle)] flex items-center justify-center">
              <FileCheck className="w-4 h-4 text-[var(--hr-text-muted)]" />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div className="flex flex-col">
              <span
                className={`text-3xl tabular-nums font-mono tracking-tight ${
                  stats.contractsExpiring > 0
                    ? 'font-extrabold text-[var(--hr-text)]'
                    : 'font-bold text-[var(--hr-text)]'
                }`}
              >
                {stats.contractsExpiring}
              </span>
              <span className="text-[12px] font-semibold text-[var(--hr-status-warning)] mt-1.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--hr-status-warning)]" />
                {stats.contractsExpiring > 0 ? 'Requer atenção para renovação' : 'Nenhuma caducidade próxima'}
              </span>
            </div>
            <HrSparkline data={ctrTrend} width={80} height={28} color="var(--hr-status-warning)" />
          </div>
        </div>

        {/* Indicator 3: Documentos a expirar (30 dias) */}
        <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-6 shadow-[var(--hr-shadow-sm)] hover:shadow-[var(--hr-shadow-md)] transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--hr-text-muted)]">
            <span className="text-[13px] font-bold uppercase tracking-wider text-[var(--hr-text-muted)]">
              Documentos a Expirar (30 dias)
            </span>
            <div className="w-8 h-8 rounded-full bg-[var(--hr-surface-muted)] border border-[var(--hr-border-subtle)] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-[var(--hr-text-muted)]" />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div className="flex flex-col">
              <span
                className={`text-3xl tabular-nums font-mono tracking-tight ${
                  stats.docsExpiring > 0
                    ? 'font-extrabold text-[var(--hr-text)]'
                    : 'font-bold text-[var(--hr-text)]'
                }`}
              >
                {stats.docsExpiring}
              </span>
              <span className="text-[12px] font-semibold text-[var(--hr-text-muted)] mt-1.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--hr-text-light)]" />
                {stats.docsExpiring > 0 ? 'Documentação a regularizar' : 'Toda a documentação válida'}
              </span>
            </div>
            <HrSparkline data={docTrend} width={80} height={28} color="var(--hr-text-light)" />
          </div>
        </div>
      </div>

      {/* Point 5: 12-Column Grid Row 2: Bloco "Por tratar" & Bloco "Colaboradores por departamento" */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Bloco "Por tratar" (7 colunas) */}
        <div className="lg:col-span-7 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[var(--hr-border-subtle)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--hr-text)] tracking-tight">
                  Por Tratar
                </h2>
                <p className="text-[13px] text-[var(--hr-text-muted)] mt-0.5">
                  Processos pendentes que exigem atenção dos Recursos Humanos
                </p>
              </div>
              <span className="text-[12px] font-bold text-[var(--hr-text)] bg-[var(--hr-surface-muted)] px-2.5 py-1 rounded-full border border-[var(--hr-border)]">
                {actionItems.length} pendente(s)
              </span>
            </div>

            {actionItems.length === 0 ? (
              <div className="py-10 text-center text-[13px] text-[var(--hr-text-muted)] flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="w-7 h-7 text-[var(--hr-status-success)]" />
                <span>Nenhum processo pendente. Todos os dados estão regularizados.</span>
              </div>
            ) : (
              <div className="divide-y divide-[var(--hr-border-subtle)]">
                {actionItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="py-3.5 flex items-center justify-between hover:bg-[var(--hr-surface-muted)] px-3 -mx-3 rounded-[var(--hr-radius-sm)] transition-colors group"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[15px] font-bold text-[var(--hr-text)] group-hover:text-[var(--hr-primary)] transition-colors">
                          {item.label}
                        </span>
                        <HrBadge variant={item.badgeVariant} size="sm">
                          {item.badge}
                        </HrBadge>
                      </div>
                      <p className="text-[13px] text-[var(--hr-text-muted)] mt-1 truncate">
                        {item.sub}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--hr-text-light)] group-hover:text-[var(--hr-primary)] group-hover:translate-x-0.5 transition flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bloco "Colaboradores por departamento" (5 colunas) */}
        <div className="lg:col-span-5 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)] p-6 flex flex-col justify-between">
          <div>
            <div className="pb-3.5 mb-4 border-b border-[var(--hr-border-subtle)]">
              <h2 className="text-lg font-bold text-[var(--hr-text)] tracking-tight">
                Colaboradores por Departamento
              </h2>
              <p className="text-[13px] text-[var(--hr-text-muted)] mt-0.5">
                Distribuição actual da equipa por sector de actividade
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {departmentStats.length === 0 ? (
                <div className="py-10 text-center text-[13px] text-[var(--hr-text-muted)]">
                  Sem departamentos registados.
                </div>
              ) : (
                departmentStats.map((dept) => {
                  const pct = Math.round((dept.count / maxDeptCount) * 100);
                  return (
                    <div key={dept.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[14px] font-semibold text-[var(--hr-text)] truncate pr-2">
                          {dept.name}
                        </span>
                        <span className="font-mono text-[14px] font-bold text-[var(--hr-text)] tabular-nums">
                          {dept.count}
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-[var(--hr-surface-muted)] rounded-full overflow-hidden border border-[var(--hr-border-subtle)]">
                        <div
                          className="h-full bg-[var(--hr-primary)] rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(pct, 6)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Point 5: 12-Column Grid Row 3: Colaboradores recentes & Alertas de caducidade */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Colaboradores Recentes (7 colunas) */}
        <div className="lg:col-span-7 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[var(--hr-border-subtle)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--hr-text)] tracking-tight">
                  Colaboradores Recentes
                </h2>
                <p className="text-[13px] text-[var(--hr-text-muted)] mt-0.5">
                  Últimos colaboradores activos admitidos na empresa
                </p>
              </div>
              <Link
                href="/rh/funcionarios"
                className="text-[13px] font-bold text-[var(--hr-primary)] hover:underline flex items-center gap-1"
              >
                <span>Ver todos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Desktop Table (52px rows) */}
            <div className="hidden sm:block">
              <HrTable<any>
                columns={[
                  {
                    key: 'employeeNumber',
                    header: 'N.º',
                    width: '110px',
                    className: 'whitespace-nowrap',
                    render: (r: any) => (
                      <span className="font-mono text-[13px] font-bold text-[var(--hr-primary)] whitespace-nowrap">
                        {r.employeeNumber}
                      </span>
                    ),
                  },
                  {
                    key: 'fullName',
                    header: 'Nome Completo',
                    render: (r: any) => (
                      <div>
                        <div className="font-bold text-[15px] text-[var(--hr-text)]">{r.fullName}</div>
                        <div className="text-[13px] text-[var(--hr-text-muted)] truncate mt-0.5">
                          {r.position?.title || r.department?.name || '—'}
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'department',
                    header: 'Departamento',
                    render: (r: any) => (
                      <span className="text-[14px] text-[var(--hr-text-muted)]">
                        {r.department?.name || '—'}
                      </span>
                    ),
                  },
                  {
                    key: 'status',
                    header: 'Estado',
                    align: 'center',
                    width: '100px',
                    render: (r: any) => statusBadge(r.status),
                  },
                ]}
                data={recentEmployees}
                keyExtractor={(r: any) => r.id}
                isLoading={isLoading}
                emptyMessage="Nenhum colaborador registado."
              />
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden">
              <HrCardList<any>
                items={recentEmployees}
                isLoading={isLoading}
                emptyMessage="Nenhum colaborador registado."
                renderItem={(r: any) => ({
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

        {/* Alertas de Caducidade (5 colunas) - Mostra N.º Contrato (Point 7) */}
        <div className="lg:col-span-5 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[var(--hr-border-subtle)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--hr-text)] tracking-tight">
                  Alertas de Caducidade
                </h2>
                <p className="text-[13px] text-[var(--hr-text-muted)] mt-0.5">
                  Contratos a renovar nos próximos 60 dias
                </p>
              </div>
              <Link
                href="/rh/contratos"
                className="text-[13px] font-bold text-[var(--hr-primary)] hover:underline flex items-center gap-1"
              >
                <span>Gestão</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Desktop Table (52px rows, with contractNumber) */}
            <div className="hidden sm:block">
              <HrTable<any>
                columns={[
                  {
                    key: 'contractNumber',
                    header: 'N.º Contrato',
                    width: '160px',
                    className: 'whitespace-nowrap',
                    render: (r: any) => (
                      <span className="font-mono text-[13px] font-bold text-[var(--hr-text)] whitespace-nowrap">
                        {r.contractNumber || '—'}
                      </span>
                    ),
                  },
                  {
                    key: 'employee',
                    header: 'Colaborador',
                    render: (r: any) => (
                      <span className="text-[14px] font-bold text-[var(--hr-text)]">
                        {r.employee?.fullName || '—'}
                      </span>
                    ),
                  },
                  {
                    key: 'endDate',
                    header: 'Data Limite',
                    align: 'right',
                    render: (r: any) => (
                      <span className="font-mono text-[13px] font-bold text-[var(--hr-text)] tabular-nums">
                        {r.endDate ? new Date(r.endDate).toLocaleDateString('pt-AO') : '—'}
                      </span>
                    ),
                  },
                  {
                    key: 'badge',
                    header: 'Situação',
                    align: 'center',
                    width: '100px',
                    render: () => <HrBadge variant="warning" dot size="sm">A Vencer</HrBadge>,
                  },
                ]}
                data={expiringContracts}
                keyExtractor={(r: any) => r.id}
                isLoading={isLoading}
                emptyMessage="Nenhum contrato em risco de caducidade imediata."
              />
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden">
              <HrCardList<any>
                items={expiringContracts}
                isLoading={isLoading}
                emptyMessage="Nenhum contrato a caducar."
                renderItem={(r: any) => ({
                  item: r,
                  key: r.id,
                  title: r.employee?.fullName,
                  subtitle: `${r.contractNumber} · ${r.type}`,
                  badge: <HrBadge variant="warning" dot size="sm">A Vencer</HrBadge>,
                  fields: [
                    {
                      label: 'Data Limite',
                      value: r.endDate ? new Date(r.endDate).toLocaleDateString('pt-AO') : '—',
                    },
                  ],
                  onClick: () => {
                    window.location.href = `/rh/funcionarios/${r.employeeId}?tab=contratos`;
                  },
                })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Point 5c: Bloco "Actividade recente" (as últimas 8 entradas de auditoria com dados sensíveis mascarados) */}
      <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)] p-6">
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[var(--hr-border-subtle)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--hr-text)] tracking-tight">
              Actividade Recente
            </h2>
            <p className="text-[13px] text-[var(--hr-text-muted)] mt-0.5">
              Últimas 8 acções registadas no livro de auditoria e conformidade
            </p>
          </div>
          <Link
            href="/rh/auditoria"
            className="text-[13px] font-bold text-[var(--hr-primary)] hover:underline flex items-center gap-1"
          >
            <span>Ver auditoria completa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Audit Log Table (52px row height) */}
        <div className="hidden sm:block">
          <HrTable<any>
            columns={[
              {
                key: 'userName',
                header: 'Operador',
                width: '210px',
                render: (r: any) => (
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[var(--hr-primary-soft)] text-[var(--hr-primary)] font-bold text-xs flex items-center justify-center flex-shrink-0 border border-[var(--hr-border-subtle)]">
                      {(r.userName || r.userRole || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-[14px] text-[var(--hr-text)] truncate">
                        {r.userName || 'Sistema'}
                      </div>
                      <div className="text-[12px] font-medium text-[var(--hr-text-muted)]">
                        {r.userRole || 'Operador'}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'action',
                header: 'Acção',
                width: '120px',
                render: (r: any) => {
                  let variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' = 'neutral';
                  if (r.action.includes('CRIAR')) variant = 'success';
                  if (r.action.includes('EDITAR')) variant = 'info';
                  if (r.action.includes('DESLIGAR') || r.action.includes('ELIMINAR')) variant = 'error';
                  return (
                    <HrBadge variant={variant} size="sm">
                      {r.action}
                    </HrBadge>
                  );
                },
              },
              {
                key: 'resource',
                header: 'Entidade',
                width: '140px',
                render: (r: any) => (
                  <span className="text-[14px] font-semibold text-[var(--hr-text)]">
                    {r.resource}
                  </span>
                ),
              },
              {
                key: 'details',
                header: 'Registo / Detalhes',
                render: (r: any) => (
                  <span className="text-[13px] text-[var(--hr-text-muted)] line-clamp-1">
                    {r.details || '—'}
                  </span>
                ),
              },
              {
                key: 'createdAt',
                header: 'Data & Hora',
                align: 'right',
                width: '170px',
                render: (r: any) => (
                  <span className="font-mono text-[13px] font-bold text-[var(--hr-text)] tabular-nums">
                    {new Date(r.createdAt).toLocaleString('pt-AO')}
                  </span>
                ),
              },
            ]}
            data={auditLogs}
            keyExtractor={(r: any) => r.id}
            isLoading={isLoading}
            emptyMessage="Nenhuma actividade registada na auditoria."
          />
        </div>

        {/* Mobile View for Audit */}
        <div className="sm:hidden">
          <HrCardList<any>
            items={auditLogs}
            isLoading={isLoading}
            emptyMessage="Nenhuma actividade de auditoria."
            renderItem={(r: any) => ({
              item: r,
              key: r.id,
              title: `${r.userName || 'Sistema'} · ${r.action}`,
              subtitle: r.details || r.resource,
              badge: <span className="text-xs font-mono text-[var(--hr-text-muted)]">{new Date(r.createdAt).toLocaleDateString('pt-AO')}</span>,
            })}
          />
        </div>
      </div>
    </div>
  );
}
