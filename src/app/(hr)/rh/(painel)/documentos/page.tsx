'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Upload, Download, Search } from 'lucide-react';
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

export default function RhDocumentosPage() {
  const toast = useHrToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterExpiring, setFilterExpiring] = useState(false);

  // Upload Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [employeeId, setEmployeeId] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('BI');
  const [expiresAt, setExpiresAt] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (filterType) query.set('type', filterType);
      if (filterExpiring) query.set('expiringSoon', 'true');

      const [docRes, empRes] = await Promise.all([
        fetch(`/api/rh/documentos?${query.toString()}`),
        fetch('/api/rh/funcionarios?limit=100&status=ACTIVO'),
      ]);

      const [docData, empData] = await Promise.all([
        docRes.json().catch(() => ({})),
        empRes.json().catch(() => ({})),
      ]);

      if (docData.success) setDocuments(docData.documents || []);
      if (empData.success) setEmployees(empData.employees || []);
    } catch {
      toast.error('Erro ao carregar documentos.');
    } finally {
      setIsLoading(false);
    }
  }, [filterType, filterExpiring, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile || !employeeId || !title.trim()) {
      setFormError('Preencha todos os campos obrigatórios e seleccione o ficheiro.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const form = new FormData();
      form.append('file', docFile);
      form.append('employeeId', employeeId);
      form.append('title', title.trim());
      form.append('type', type);
      if (expiresAt) form.append('expiresAt', expiresAt);

      const res = await fetch('/api/rh/documentos', {
        method: 'POST',
        body: form,
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        toast.success('Documento arquivado com segurança.');
        setIsModalOpen(false);
        setDocFile(null);
        setTitle('');
        setExpiresAt('');
        loadData();
      } else {
        setFormError(data.error || 'Erro ao arquivar documento.');
      }
    } catch {
      setFormError('Erro de ligação ao servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDocs = documents.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const empName = d.employee?.fullName?.toLowerCase() || '';
    const t = d.title?.toLowerCase() || '';
    return empName.includes(q) || t.includes(q);
  });

  return (
    <div className="space-y-5">
      <HrPageHeader
        title="Arquivo Documental"
        subtitle="Repositório seguro e controlo de validade de documentos dos colaboradores"
        breadcrumbs={[
          { label: 'Recursos Humanos', href: '/rh' },
          { label: 'Documentos' },
        ]}
        actions={
          <HrButton
            variant="primary"
            size="sm"
            onClick={() => {
              setFormError(null);
              setIsModalOpen(true);
            }}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Novo Documento
          </HrButton>
        }
      />

      {/* Search and Filters */}
      <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-3 sm:p-4 shadow-[var(--hr-shadow-sm)] flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <HrInput
            type="text"
            placeholder="Pesquisar por título de documento ou colaborador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-[var(--hr-text-muted)]" />}
          />
        </div>

        <div className="w-full sm:w-48">
          <HrSelect
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Todos os Tipos</option>
            <option value="BI">Bilhete de Identidade</option>
            <option value="CONTRATO">Contrato de Trabalho</option>
            <option value="DIPLOMA">Diploma / Certificado</option>
            <option value="ATESTADO_MEDICO">Atestado Médico</option>
            <option value="REGISTO_CRIMINAL">Registo Criminal</option>
            <option value="OUTRO">Outros</option>
          </HrSelect>
        </div>

        <HrButton
          variant={filterExpiring ? 'secondary' : 'outline'}
          size="md"
          onClick={() => setFilterExpiring(!filterExpiring)}
        >
          {filterExpiring ? 'A ver a caducar' : 'Apenas a caducar'}
        </HrButton>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block">
        <HrTable
          columns={[
            {
              key: 'title',
              header: 'Documento',
              render: (r) => (
                <div>
                  <div className="font-bold text-[var(--hr-text)]">{r.title}</div>
                  <div className="text-xs text-[var(--hr-text-muted)] font-mono">
                    {r.type} · {(r.fileSize / 1024).toFixed(1)} KB
                  </div>
                </div>
              ),
            },
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
              key: 'expiresAt',
              header: 'Validade',
              render: (r) => (
                r.expiresAt ? (
                  <span className="text-xs tabular-nums text-[var(--hr-text)]">
                    {new Date(r.expiresAt).toLocaleDateString('pt-AO')}
                  </span>
                ) : (
                  <span className="text-xs text-[var(--hr-text-muted)]">Sem prazo</span>
                )
              ),
            },
            {
              key: 'status',
              header: 'Situação',
              align: 'center',
              width: '110px',
              render: (r) => {
                if (!r.expiresAt) return <HrBadge variant="neutral" size="sm">Permanente</HrBadge>;
                const isExp = new Date(r.expiresAt) < new Date();
                return isExp ? (
                  <HrBadge variant="error" size="sm">Expirado</HrBadge>
                ) : (
                  <HrBadge variant="success" size="sm">Válido</HrBadge>
                );
              },
            },
            {
              key: 'download',
              header: 'Acção',
              align: 'right',
              width: '110px',
              render: (r) => (
                <a
                  href={`/api/rh/documentos/${r.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--hr-primary)] hover:bg-[var(--hr-primary-soft)] rounded transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              ),
            },
          ]}
          data={filteredDocs}
          keyExtractor={(r) => r.id}
          isLoading={isLoading}
          emptyMessage="Nenhum documento encontrado."
        />
      </div>

      {/* Mobile Card List View */}
      <div className="sm:hidden">
        <HrCardList
          items={filteredDocs}
          isLoading={isLoading}
          emptyMessage="Nenhum documento encontrado."
          renderItem={(r) => ({
            item: r,
            key: r.id,
            title: r.title,
            subtitle: `${r.employee?.fullName || 'Colaborador'} · ${r.type}`,
            badge: r.expiresAt && new Date(r.expiresAt) < new Date() ? (
              <HrBadge variant="error" size="sm">Expirado</HrBadge>
            ) : (
              <HrBadge variant="neutral" size="sm">{(r.fileSize / 1024).toFixed(0)} KB</HrBadge>
            ),
            actions: (
              <a
                href={`/api/rh/documentos/${r.id}/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--hr-primary)] py-1.5 px-3 border border-[var(--hr-border)] rounded hover:bg-[var(--hr-surface-muted)]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descarregar</span>
              </a>
            ),
          })}
        />
      </div>

      {/* Upload Modal */}
      <HrDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Arquivar Novo Documento"
        maxWidth="md"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-[var(--hr-status-error-bg)] border border-[var(--hr-status-error)] rounded-[var(--hr-radius-sm)] text-xs text-[var(--hr-status-error)] font-medium">
              {formError}
            </div>
          )}

          <HrField label="Colaborador" required>
            <HrSelect
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              <option value="">Seleccione o colaborador</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.fullName} ({e.employeeNumber})
                </option>
              ))}
            </HrSelect>
          </HrField>

          <HrField label="Título / Descritivo do Documento" required>
            <HrInput
              required
              placeholder="Ex: Cópia do Bilhete de Identidade"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </HrField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <HrField label="Tipo de Documento">
              <HrSelect value={type} onChange={(e) => setType(e.target.value)}>
                <option value="BI">Bilhete de Identidade (BI)</option>
                <option value="CONTRATO">Contrato de Trabalho</option>
                <option value="DIPLOMA">Diploma / Certificado</option>
                <option value="ATESTADO_MEDICO">Atestado Médico</option>
                <option value="REGISTO_CRIMINAL">Registo Criminal</option>
                <option value="OUTRO">Outro Documento</option>
              </HrSelect>
            </HrField>

            <HrField label="Data de Validade (se aplicável)">
              <HrInput
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </HrField>
          </div>

          <HrField label="Ficheiro (PDF, JPG, PNG até 10MB)" required>
            <input
              type="file"
              required
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setDocFile(e.target.files?.[0] || null)}
              className="text-xs text-[var(--hr-text)] file:mr-3 file:py-2 file:px-3 file:rounded-[var(--hr-radius-sm)] file:border-0 file:text-xs file:font-semibold file:bg-[var(--hr-primary-soft)] file:text-[var(--hr-primary)] hover:file:bg-[#D5E6F4] cursor-pointer"
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
              Arquivar Documento
            </HrButton>
          </div>
        </form>
      </HrDialog>
    </div>
  );
}
