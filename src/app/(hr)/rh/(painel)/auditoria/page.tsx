'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  HrPageHeader,
  HrButton,
  HrBadge,
  HrTable,
  HrCardList,
  HrDialog,
  HrInput,
  HrSelect,
} from '@/components/hr';
import { useHrToast } from '@/components/hr/hr-toast';

export default function RhAuditoriaPage() {
  const toast = useHrToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resource, setResource] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: '15',
        search,
        resource,
        action,
      });

      const res = await fetch(`/api/rh/auditoria?${query.toString()}`);
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setLogs(data.logs || []);
        setPagination({
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 1,
        });
      } else {
        toast.error(data.error || 'Erro ao carregar auditoria.');
      }
    } catch {
      toast.error('Erro de ligação ao servidor.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, resource, action, toast]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const actionBadge = (act: string) => {
    switch (act) {
      case 'CRIAR':
        return <HrBadge variant="success" size="sm">Criação</HrBadge>;
      case 'ACTUALIZAR':
        return <HrBadge variant="info" size="sm">Edição</HrBadge>;
      case 'DESLIGAR':
        return <HrBadge variant="error" size="sm">Desligamento</HrBadge>;
      case 'ELIMINAR':
        return <HrBadge variant="error" size="sm">Remoção</HrBadge>;
      default:
        return <HrBadge variant="neutral" size="sm">{act}</HrBadge>;
    }
  };

  return (
    <div className="space-y-5">
      <HrPageHeader
        title="Auditoria & Rastreabilidade"
        subtitle="Registo imutável de operações e eventos do módulo de Recursos Humanos da J.Matos"
        breadcrumbs={[
          { label: 'Recursos Humanos', href: '/rh' },
          { label: 'Auditoria' },
        ]}
      />

      {/* Filter and Search Bar */}
      <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-3 sm:p-4 shadow-[var(--hr-shadow-sm)] flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <HrInput
            type="text"
            placeholder="Pesquisar por utilizador, detalhes ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-[var(--hr-text-muted)]" />}
          />
        </div>

        <div className="w-full sm:w-44">
          <HrSelect value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}>
            <option value="">Todas as Acções</option>
            <option value="CRIAR">Criação</option>
            <option value="ACTUALIZAR">Actualização</option>
            <option value="DESLIGAR">Desligamento</option>
            <option value="ELIMINAR">Eliminação</option>
          </HrSelect>
        </div>

        <div className="w-full sm:w-44">
          <HrSelect value={resource} onChange={(e) => { setResource(e.target.value); setPage(1); }}>
            <option value="">Todas as Entidades</option>
            <option value="HrEmployee">Colaborador</option>
            <option value="HrContract">Contrato</option>
            <option value="HrDocument">Documento</option>
            <option value="HrDepartment">Departamento</option>
            <option value="HrPosition">Cargo</option>
          </HrSelect>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block">
        <HrTable
          columns={[
            {
              key: 'createdAt',
              header: 'Data / Hora',
              width: '150px',
              render: (r) => (
                <span className="text-xs font-mono tabular-nums text-[var(--hr-text)]">
                  {new Date(r.createdAt).toLocaleString('pt-AO')}
                </span>
              ),
            },
            {
              key: 'actor',
              header: 'Operador / Utilizador',
              render: (r) => (
                <div>
                  <div className="font-semibold text-xs text-[var(--hr-text)]">
                    {r.actorName || r.actorEmail || 'Sistema Automático'}
                  </div>
                  <div className="text-xs text-[var(--hr-text-muted)] font-mono">
                    {r.actorRole || 'SYSTEM'}
                  </div>
                </div>
              ),
            },
            {
              key: 'action',
              header: 'Acção',
              align: 'center',
              width: '120px',
              render: (r) => actionBadge(r.action),
            },
            {
              key: 'entity',
              header: 'Entidade Alvo',
              render: (r) => (
                <div className="text-xs">
                  <span className="font-bold text-[var(--hr-text)]">{r.entityType}</span>
                  {r.entityId && (
                    <span className="text-[var(--hr-text-muted)] font-mono text-xs ml-1.5">
                      #{r.entityId.slice(-6)}
                    </span>
                  )}
                </div>
              ),
            },
            {
              key: 'diff',
              header: 'Detalhes',
              align: 'right',
              width: '90px',
              render: (r) => (
                <HrButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLog(r)}
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                >
                  Ver
                </HrButton>
              ),
            },
          ]}
          data={logs}
          keyExtractor={(r) => r.id}
          isLoading={isLoading}
          emptyMessage="Nenhum registo de auditoria encontrado."
        />
      </div>

      {/* Mobile Card List */}
      <div className="sm:hidden">
        <HrCardList
          items={logs}
          isLoading={isLoading}
          emptyMessage="Nenhum registo de auditoria."
          renderItem={(r) => ({
            item: r,
            key: r.id,
            title: `${r.action} em ${r.entityType}`,
            subtitle: `${new Date(r.createdAt).toLocaleString('pt-AO')} · ${r.actorEmail || 'Sistema'}`,
            badge: actionBadge(r.action),
            actions: (
              <HrButton variant="outline" size="sm" onClick={() => setSelectedLog(r)}>
                Ver Detalhes
              </HrButton>
            ),
          })}
        />
      </div>

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-3 shadow-[var(--hr-shadow-sm)]">
          <span className="text-xs text-[var(--hr-text-muted)]">
            Página <strong className="text-[var(--hr-text)]">{page}</strong> de{' '}
            <strong className="text-[var(--hr-text)]">{pagination.totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <HrButton
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Anterior
            </HrButton>
            <HrButton
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages || isLoading}
              onClick={() => setPage((p) => p + 1)}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Seguinte
            </HrButton>
          </div>
        </div>
      )}

      {/* Detail Diff Modal */}
      <HrDialog
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Detalhes do Registo de Auditoria"
        maxWidth="lg"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-[var(--hr-surface-muted)] border border-[var(--hr-border)] rounded text-xs">
              <div>
                <span className="text-[var(--hr-text-muted)] block">Acção:</span>
                <span className="font-bold text-[var(--hr-text)]">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-[var(--hr-text-muted)] block">Entidade:</span>
                <span className="font-bold text-[var(--hr-text)]">{selectedLog.entityType}</span>
              </div>
              <div>
                <span className="text-[var(--hr-text-muted)] block">Operador:</span>
                <span className="font-bold text-[var(--hr-text)] truncate block">{selectedLog.actorEmail || 'Sistema'}</span>
              </div>
              <div>
                <span className="text-[var(--hr-text-muted)] block">Data / Hora:</span>
                <span className="font-mono text-[var(--hr-text)]">{new Date(selectedLog.createdAt).toLocaleString('pt-AO')}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-bold text-[var(--hr-text)] uppercase tracking-wider mb-1.5">
                  Dados Gravados (Snapshot Seguro)
                </h4>
                <pre className="p-3 bg-[var(--hr-surface-muted)] border border-[var(--hr-border)] rounded text-xs font-mono text-[var(--hr-text)] overflow-x-auto max-h-60 leading-relaxed">
                  {typeof selectedLog.changes === 'object'
                    ? JSON.stringify(selectedLog.changes, null, 2)
                    : selectedLog.changes || 'Sem dados adicionais registados.'}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <HrButton variant="primary" size="sm" onClick={() => setSelectedLog(null)}>
                Fechar
              </HrButton>
            </div>
          </div>
        )}
      </HrDialog>
    </div>
  );
}
