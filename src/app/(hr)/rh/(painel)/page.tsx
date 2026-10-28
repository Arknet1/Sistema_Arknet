'use client';

import { useState, useEffect } from 'react';
import { useHrToast } from '@/components/hr/hr-toast';
import { HrDashboard } from '@/components/hr/hr-dashboard';

export default function RhOverviewPage() {
  const toast = useHrToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAlerting, setIsAlerting] = useState(false);
  const [stats, setStats] = useState({
    activeEmployees: 0,
    contractsExpiring: 0,
    docsExpiring: 0,
    presentToday: 0,
    absencesToday: 0,
    pendingLeaves: 0,
    newHiresThisMonth: 0,
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
      const [empRes, deptRes, ctrRes, docRes, auditRes, dashboardRes] = await Promise.all([
        fetch('/api/rh/funcionarios?limit=100'),
        fetch('/api/rh/departamentos'),
        fetch('/api/rh/contratos?expiringSoon=true'),
        fetch('/api/rh/documentos?expiringSoon=true'),
        fetch('/api/rh/auditoria?limit=8'),
        fetch('/api/rh/dashboard'),
      ]);

      const [empData, deptData, ctrData, docData, auditData, dashData] = await Promise.all([
        empRes.json().catch(() => ({})),
        deptRes.json().catch(() => ({})),
        ctrRes.json().catch(() => ({})),
        docRes.json().catch(() => ({})),
        auditRes.json().catch(() => ({})),
        dashboardRes.json().catch(() => ({})),
      ]);

      if (!dashboardRes.ok) throw new Error(dashData.error || 'Não foi possível carregar os indicadores.')

      const allEmployees: any[] = empData.employees || dashData.recentEmployees || [];
      const activeEmps = allEmployees.filter((e) => e.status === 'ACTIVO');
      const contractsExp = ctrData.contracts || [];
      const docsExp = docData.documents || [];
      const logs = auditData.logs || [];

      // 1. Stats
      setStats({
        activeEmployees: dashData.stats?.activeEmployees ?? empData.pagination?.total ?? activeEmps.length,
        contractsExpiring: dashData.stats?.contractsExpiring ?? contractsExp.length,
        docsExpiring: dashData.stats?.docsExpiring ?? docsExp.length,
        presentToday: dashData.stats?.presentToday ?? 0,
        absencesToday: dashData.stats?.absencesToday ?? 0,
        pendingLeaves: dashData.stats?.pendingLeaves ?? 0,
        newHiresThisMonth: dashData.stats?.newHiresThisMonth ?? 0,
      });

      // 2. Recent Employees
      setRecentEmployees(dashData.recentEmployees?.slice(0, 6) || allEmployees.slice(0, 6));

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
      setDepartmentStats(dashData.departmentStats || deptCounts);

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
      const res = await fetch('/api/rh/alertas/processar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast.success(
          `Verificação concluída. ${data.report?.sent ?? data.summary?.sent ?? 0} alerta(s) processado(s).`,
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

  return (
    <HrDashboard
      stats={stats}
      isLoading={isLoading}
      isAlerting={isAlerting}
      recentEmployees={recentEmployees}
      expiringContracts={expiringContracts}
      expiringDocs={expiringDocs}
      departmentStats={departmentStats}
      actionItems={actionItems}
      auditLogs={auditLogs}
      onRunAlerts={handleRunAlerts}
    />
  );
}
