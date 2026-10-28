'use client';

import Link from 'next/link';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  RefreshCw,
  ShieldCheck,
  UserRoundPlus,
  Users,
} from 'lucide-react';
import { HrButton, HrEmptyState } from '@/components/hr';

type Metric = { activeEmployees: number; presentToday: number; absencesToday: number; pendingLeaves: number; newHiresThisMonth: number; contractsExpiring: number; docsExpiring: number };
type Item = { id: string; label: string; sub: string; badge: string; badgeVariant: 'warning' | 'error' | 'success' | 'info' | 'neutral'; href: string; type: string };

interface HrDashboardProps {
  stats: Metric;
  isLoading: boolean;
  isAlerting: boolean;
  recentEmployees: any[];
  expiringContracts: any[];
  expiringDocs: any[];
  departmentStats: { name: string; count: number }[];
  actionItems: Item[];
  auditLogs: any[];
  onRunAlerts: () => void;
}

const DEPARTMENT_COLORS = ['#0868B0', '#F09000', '#178F72', '#7858C7', '#D35E64', '#5686A5'];

function dateLabel(date: string | Date) {
  return new Date(date).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'JM';
}

function DonutChart({ departments, total }: { departments: { name: string; count: number }[]; total: number }) {
  const circumference = 2 * Math.PI * 37;
  let consumed = 0;
  const items = departments.filter((item) => item.count > 0).slice(0, 6);

  if (!total || items.length === 0) {
    return <HrEmptyState illustration="people" title="Sem dados de distribuição" description="A distribuição aparece quando existirem colaboradores activos." className="border-0 shadow-none" />;
  }

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div className="relative h-44 w-44 shrink-0" role="img" aria-label={`Distribuição de ${total} colaboradores activos por departamento`}>
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r="37" fill="none" stroke="var(--hr-surface-muted)" strokeWidth="12" />
          {items.map((item, index) => {
            const length = (item.count / total) * circumference;
            const offset = consumed;
            consumed += length;
            return <circle key={item.name} cx="50" cy="50" r="37" fill="none" stroke={DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length]} strokeWidth="12" strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-offset} strokeLinecap="butt" />;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tracking-tight text-[var(--hr-text)]">{total}</span>
          <span className="text-xs text-[var(--hr-text-muted)]">colaboradores</span>
        </div>
      </div>
      <ul className="grid w-full grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2">
        {items.map((item, index) => (
          <li key={item.name} className="flex min-w-0 items-center gap-2.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length] }} />
            <span className="min-w-0 flex-1 truncate text-sm text-[var(--hr-text-muted)]" title={item.name}>{item.name}</span>
            <span className="text-sm font-semibold tabular-nums text-[var(--hr-text)]">{Math.round((item.count / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HrDashboard({ stats, isLoading, isAlerting, recentEmployees, expiringContracts, expiringDocs, departmentStats, actionItems, auditLogs, onRunAlerts }: HrDashboardProps) {
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Bom dia' : now.getHours() < 18 ? 'Boa tarde' : 'Boa noite';
  const totalAttendanceRecords = stats.presentToday + stats.absencesToday;
  const presentShare = totalAttendanceRecords ? Math.round((stats.presentToday / totalAttendanceRecords) * 100) : 0;
  const missingContractItems = actionItems.filter((item) => item.type === 'sem_contrato').slice(0, 2).map((item) => ({
    id: item.id,
    kind: 'missing-contract',
    label: item.label,
    detail: item.sub,
    href: item.href,
  }));
  const priorityItems = [
    ...missingContractItems,
    ...[...expiringContracts.slice(0, 3).map((item) => ({ ...item, kind: 'contract' })), ...expiringDocs.slice(0, 3).map((item) => ({ ...item, kind: 'document' }))]
      .sort((a, b) => new Date(a.endDate || a.expiresAt).getTime() - new Date(b.endDate || b.expiresAt).getTime()),
  ].slice(0, 5);

  const mainMetrics = [
    { label: 'Quadro activo', value: stats.activeEmployees, caption: 'Colaboradores activos', icon: Users, iconTone: 'text-sky-700 bg-sky-50', trend: 'Equipa actual' },
    { label: 'Presenças hoje', value: stats.presentToday, caption: 'Registos de entrada', icon: CalendarCheck, iconTone: 'text-emerald-700 bg-emerald-50', trend: `${presentShare}% dos registos`, positive: true },
    { label: 'Faltas hoje', value: stats.absencesToday, caption: 'Justificadas e injustificadas', icon: AlertTriangle, iconTone: 'text-rose-700 bg-rose-50', trend: 'Registos do dia', negative: stats.absencesToday > 0 },
    { label: 'Férias pendentes', value: stats.pendingLeaves, caption: 'Pedidos por decidir', icon: CalendarDays, iconTone: 'text-amber-700 bg-amber-50', trend: 'A aguardar decisão' },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 pb-8">
      <section className="relative isolate overflow-hidden rounded-2xl bg-[#0C3152] px-6 py-7 text-white shadow-[var(--hr-shadow-md)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-24 -z-10 h-72 w-72 rounded-full border-[42px] border-white/[0.045]" />
        <div className="pointer-events-none absolute -bottom-32 right-40 -z-10 h-64 w-64 rounded-full bg-[#0868B0]/40 blur-3xl" />
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-sky-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(74,222,128,.15)]" />
              {now.toLocaleDateString('pt-AO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{greeting}, equipa de RH</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-sky-100/80 sm:text-base">Aqui está o ponto de situação da J.Matos. Veja o que precisa de atenção e acompanhe a equipa num só lugar.</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <HrButton variant="outline" size="md" onClick={onRunAlerts} isLoading={isAlerting} leftIcon={<RefreshCw className="h-4 w-4" />} className="border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/15 hover:text-white">
              Verificar alertas
            </HrButton>
            <Link href="/rh/funcionarios?novo=true">
              <HrButton variant="primary" size="md" leftIcon={<UserRoundPlus className="h-4 w-4" />} className="bg-[#F09000] text-white hover:bg-[#D77F00]">
                Novo colaborador
              </HrButton>
            </Link>
          </div>
        </div>
        <div className="mt-7 flex flex-wrap gap-x-7 gap-y-2 border-t border-white/15 pt-4 text-sm text-sky-100/90">
          <span className="inline-flex items-center gap-2"><UserRoundPlus className="h-4 w-4 text-sky-200" /> <strong className="text-white">{isLoading ? '—' : stats.newHiresThisMonth}</strong> admissões este mês</span>
          <span className="inline-flex items-center gap-2"><FileCheck2 className="h-4 w-4 text-amber-300" /> <strong className="text-white">{isLoading ? '—' : stats.contractsExpiring}</strong> contratos a vencer</span>
          <span className="inline-flex items-center gap-2"><FileText className="h-4 w-4 text-rose-300" /> <strong className="text-white">{isLoading ? '—' : stats.docsExpiring}</strong> documentos a expirar</span>
        </div>
      </section>

      <section aria-label="Indicadores principais" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mainMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <article key={metric.label} className="group rounded-xl border border-[var(--hr-border)] bg-[var(--hr-surface)] p-5 shadow-[var(--hr-shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--hr-shadow-md)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[var(--hr-text-muted)]">{metric.label}</p>
                  <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums text-[var(--hr-text)]" aria-live="polite">
                    {isLoading ? <span className="inline-block h-9 w-12 animate-pulse rounded-md bg-[var(--hr-surface-muted)]" aria-label="A carregar" /> : metric.value}
                  </p>
                </div>
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${metric.iconTone}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[var(--hr-border-subtle)] pt-3">
                <span className="text-xs text-[var(--hr-text-light)]">{metric.caption}</span>
                <span className={`inline-flex items-center gap-1 text-xs font-medium ${metric.negative ? 'text-rose-700' : metric.positive ? 'text-emerald-700' : 'text-[var(--hr-text-light)]'}`}>
                  {metric.negative ? <ArrowUpRight className="h-3.5 w-3.5" /> : metric.positive ? <ArrowDownRight className="h-3.5 w-3.5" /> : <Activity className="h-3.5 w-3.5" />}
                  {metric.trend}
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <article className="rounded-xl border border-[var(--hr-border)] bg-[var(--hr-surface)] p-5 shadow-[var(--hr-shadow-sm)] sm:p-6 xl:col-span-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div><h2 className="text-base font-semibold text-[var(--hr-text)]">Distribuição da equipa</h2><p className="mt-1 text-sm text-[var(--hr-text-light)]">Colaboradores activos por departamento</p></div>
            <Link href="/rh/departamentos" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--hr-primary)] hover:underline">Departamentos <ArrowRight className="h-4 w-4" /></Link>
          </div>
          {isLoading ? <div className="h-44 animate-pulse rounded-lg bg-[var(--hr-surface-muted)]" /> : <DonutChart departments={departmentStats} total={stats.activeEmployees} />}
        </article>

        <article className="rounded-xl border border-[var(--hr-border)] bg-[var(--hr-surface)] p-5 shadow-[var(--hr-shadow-sm)] sm:p-6 xl:col-span-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div><h2 className="text-base font-semibold text-[var(--hr-text)]">Assiduidade de hoje</h2><p className="mt-1 text-sm text-[var(--hr-text-light)]">Entradas e faltas registadas no sistema</p></div>
            <Link href="/rh/ponto" aria-label="Abrir gestão de ponto" className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--hr-surface-muted)] text-[var(--hr-text-muted)] hover:text-[var(--hr-primary)]"><Clock3 className="h-4 w-4" /></Link>
          </div>
          {isLoading ? <div className="h-44 animate-pulse rounded-lg bg-[var(--hr-surface-muted)]" /> : totalAttendanceRecords === 0 ? (
            <div className="flex h-44 flex-col items-center justify-center rounded-lg border border-dashed border-[var(--hr-border)] bg-[var(--hr-surface-muted)] px-6 text-center"><CalendarCheck className="mb-2 h-7 w-7 text-[var(--hr-text-light)]" /><p className="text-sm font-medium text-[var(--hr-text)]">Ainda sem registos de hoje</p><p className="mt-1 text-xs text-[var(--hr-text-light)]">As marcações e faltas aparecerão aqui durante o dia.</p></div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-end justify-between gap-4"><div><p className="text-4xl font-bold tracking-tight tabular-nums text-[var(--hr-text)]">{totalAttendanceRecords}</p><p className="mt-1 text-sm text-[var(--hr-text-light)]">registos contabilizados</p></div><div className="text-right"><p className="text-2xl font-semibold tabular-nums text-emerald-700">{presentShare}%</p><p className="text-xs text-[var(--hr-text-light)]">presenças</p></div></div>
              <div className="h-3 overflow-hidden rounded-full bg-[var(--hr-surface-muted)]" role="img" aria-label={`${presentShare}% presenças e ${100 - presentShare}% faltas entre os registos de hoje`}><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${presentShare}%` }} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-emerald-50 p-3"><p className="text-xs font-medium text-emerald-800">Presenças</p><p className="mt-1 text-xl font-semibold tabular-nums text-emerald-900">{stats.presentToday}</p></div>
                <div className="rounded-lg bg-rose-50 p-3"><p className="text-xs font-medium text-rose-800">Faltas</p><p className="mt-1 text-xl font-semibold tabular-nums text-rose-900">{stats.absencesToday}</p></div>
              </div>
              <Link href="/rh/ponto" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--hr-primary)] hover:underline">Ver ponto e assiduidade <ArrowRight className="h-4 w-4" /></Link>
            </div>
          )}
        </article>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <article className="rounded-xl border border-[var(--hr-border)] bg-[var(--hr-surface)] p-5 shadow-[var(--hr-shadow-sm)] sm:p-6 xl:col-span-7">
          <div className="mb-4 flex items-start justify-between gap-4"><div><h2 className="text-base font-semibold text-[var(--hr-text)]">Admissões recentes</h2><p className="mt-1 text-sm text-[var(--hr-text-light)]">Novos membros da equipa</p></div><Link href="/rh/funcionarios" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--hr-primary)] hover:underline">Ver equipa <ArrowRight className="h-4 w-4" /></Link></div>
          {isLoading ? <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-lg bg-[var(--hr-surface-muted)]" />)}</div> : recentEmployees.length === 0 ? <HrEmptyState illustration="people" title="Ainda não há colaboradores" description="Os novos registos aparecerão nesta lista." className="border-0 shadow-none" /> : (
            <ul className="divide-y divide-[var(--hr-border-subtle)]">
              {recentEmployees.slice(0, 5).map((employee) => <li key={employee.id}><Link href={`/rh/funcionarios/${employee.id}`} className="group flex items-center gap-3 py-3.5 first:pt-1 last:pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hr-primary)]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--hr-primary-soft)] text-sm font-bold text-[var(--hr-primary)]">{initials(employee.fullName)}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-[var(--hr-text)] group-hover:text-[var(--hr-primary)]">{employee.fullName}</span><span className="mt-0.5 block truncate text-xs text-[var(--hr-text-light)]">{employee.position?.title || 'Cargo por definir'} · {employee.department?.name || 'Sem departamento'}</span></span>
                <span className="hidden shrink-0 text-right sm:block"><span className="block text-xs font-medium text-[var(--hr-text-muted)]">{employee.employeeNumber}</span><span className="mt-0.5 block text-xs text-[var(--hr-text-light)]">{dateLabel(employee.admissionDate)}</span></span>
                <ArrowRight className="h-4 w-4 shrink-0 text-[var(--hr-text-light)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--hr-primary)]" />
              </Link></li>)}
            </ul>
          )}
        </article>

        <article className="rounded-xl border border-[var(--hr-border)] bg-[var(--hr-surface)] p-5 shadow-[var(--hr-shadow-sm)] sm:p-6 xl:col-span-5">
          <div className="mb-4 flex items-start justify-between gap-4"><div><h2 className="text-base font-semibold text-[var(--hr-text)]">Atenção necessária</h2><p className="mt-1 text-sm text-[var(--hr-text-light)]">Prazos que se aproximam</p></div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">{priorityItems.length} alertas</span></div>
          {isLoading ? <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-lg bg-[var(--hr-surface-muted)]" />)}</div> : priorityItems.length === 0 ? <div className="flex min-h-48 flex-col items-center justify-center rounded-lg bg-emerald-50/70 px-5 text-center"><CheckCircle2 className="h-8 w-8 text-emerald-600" /><p className="mt-2 text-sm font-semibold text-emerald-900">Tudo em dia</p><p className="mt-1 text-xs text-emerald-800">Não há contratos ou documentos a expirar no período.</p></div> : (
            <ul className="space-y-2.5">
              {priorityItems.map((item) => { const missing = item.kind === 'missing-contract'; const contract = item.kind === 'contract'; const deadline = contract ? item.endDate : item.expiresAt; return <li key={`${item.kind}-${item.id}`}><Link href={missing ? item.href : `/rh/funcionarios/${item.employeeId}?tab=${contract ? 'contratos' : 'documentos'}`} className="group flex items-center gap-3 rounded-lg border border-[var(--hr-border-subtle)] p-3 transition-colors hover:border-amber-300 hover:bg-amber-50/50">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${missing ? 'bg-rose-50 text-rose-700' : contract ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>{missing || !contract ? <AlertCircle className="h-4 w-4" /> : <FileCheck2 className="h-4 w-4" />}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-[var(--hr-text)]">{missing ? item.label : contract ? item.contractNumber : item.title}</span><span className="mt-0.5 block truncate text-xs text-[var(--hr-text-light)]">{missing ? item.detail : `${item.employee?.fullName || 'Colaborador'} · ${contract ? 'Contrato' : 'Documento'}`}</span></span>
                <span className="shrink-0 text-right"><span className="block text-xs font-semibold text-amber-800">{missing ? 'Regularizar' : dateLabel(deadline)}</span><ArrowRight className="ml-auto mt-1 h-3.5 w-3.5 text-[var(--hr-text-light)] group-hover:text-[var(--hr-primary)]" /></span>
              </Link></li>; })}
            </ul>
          )}
          <div className="mt-4 flex gap-4 border-t border-[var(--hr-border-subtle)] pt-3"><Link href="/rh/contratos" className="text-xs font-semibold text-[var(--hr-primary)] hover:underline">Ver contratos</Link><Link href="/rh/documentos" className="text-xs font-semibold text-[var(--hr-primary)] hover:underline">Ver documentos</Link></div>
        </article>
      </section>

      <section className="rounded-xl border border-[var(--hr-border)] bg-[var(--hr-surface)] p-5 shadow-[var(--hr-shadow-sm)] sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-base font-semibold text-[var(--hr-text)]">Actividade recente</h2><p className="mt-1 text-sm text-[var(--hr-text-light)]">Últimas acções registadas no sistema</p></div><Link href="/rh/auditoria" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--hr-primary)] hover:underline">Abrir auditoria <ArrowRight className="h-4 w-4" /></Link></div>
        {isLoading ? <div className="h-24 animate-pulse rounded-lg bg-[var(--hr-surface-muted)]" /> : auditLogs.length === 0 ? <div className="rounded-lg bg-[var(--hr-surface-muted)] px-5 py-8 text-center"><ShieldCheck className="mx-auto h-7 w-7 text-[var(--hr-text-light)]" /><p className="mt-2 text-sm font-medium text-[var(--hr-text)]">Sem actividade recente</p><p className="mt-1 text-xs text-[var(--hr-text-light)]">As acções registadas aparecerão aqui.</p></div> : (
          <ol className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
            {auditLogs.slice(0, 8).map((entry, index) => { const destructive = /DESLIGAR|ELIMINAR|REJEITAR/.test(entry.action || ''); const created = /CRIAR|ADMITIR/.test(entry.action || ''); const tone = destructive ? 'bg-rose-50 text-rose-700' : created ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700'; return <li key={entry.id} className="relative flex gap-3"><span className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone}`}>{destructive ? <AlertTriangle className="h-4 w-4" /> : created ? <UserRoundPlus className="h-4 w-4" /> : <Activity className="h-4 w-4" />}</span><span className="min-w-0 flex-1 border-b border-[var(--hr-border-subtle)] pb-3"><span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"><span className="text-sm font-semibold text-[var(--hr-text)]">{entry.userName || 'Sistema'} <span className="font-normal text-[var(--hr-text-muted)]">· {entry.action}</span></span><time dateTime={entry.createdAt} className="text-xs text-[var(--hr-text-light)]">{new Date(entry.createdAt).toLocaleString('pt-AO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</time></span><span className="mt-1 block truncate text-xs text-[var(--hr-text-light)]">{entry.details || entry.resource}</span></span>{index < 6 && <span className="pointer-events-none absolute left-[17px] top-9 hidden h-8 w-px bg-[var(--hr-border-subtle)] md:block" aria-hidden="true" />}</li>; })}
          </ol>
        )}
      </section>
    </div>
  );
}
