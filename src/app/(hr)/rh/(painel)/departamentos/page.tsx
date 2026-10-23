'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, Edit2, Search } from 'lucide-react';
import {
  HrPageHeader,
  HrButton,
  HrBadge,
  HrTable,
  HrCardList,
  HrDialog,
  HrInput,
  HrField,
  HrTextarea,
  HrSelect,
} from '@/components/hr';
import { useHrToast } from '@/components/hr/hr-toast';

export default function RhDepartamentosPage() {
  const toast = useHrToast();
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    parentId: '',
  });

  const loadDepartments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/rh/departamentos');
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setDepartments(data.departments || []);
      } else {
        toast.error(data.error || 'Erro ao carregar departamentos');
      }
    } catch {
      toast.error('Erro de ligação ao servidor.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const handleOpenCreate = () => {
    setEditingDept(null);
    setFormData({ name: '', code: '', description: '', parentId: '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: any) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      parentId: dept.parentId || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      setFormError('Nome e Código são obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const url = editingDept
        ? `/api/rh/departamentos/${editingDept.id}`
        : '/api/rh/departamentos';
      const method = editingDept ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        toast.success(
          editingDept
            ? 'Departamento actualizado com sucesso.'
            : 'Departamento criado com sucesso.'
        );
        setIsModalOpen(false);
        loadDepartments();
      } else {
        setFormError(data.error || 'Erro ao gravar departamento.');
      }
    } catch {
      setFormError('Erro de ligação ao gravar departamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDepts = departments.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <HrPageHeader
        title="Departamentos"
        subtitle="Estrutura organizacional da J.Matos Tecnologia"
        breadcrumbs={[
          { label: 'Recursos Humanos', href: '/rh' },
          { label: 'Departamentos' },
        ]}
        actions={
          <HrButton
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Novo Departamento
          </HrButton>
        }
      />

      {/* Search Input */}
      <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-3 sm:p-4 shadow-[var(--hr-shadow-sm)]">
        <div className="max-w-md">
          <HrInput
            type="text"
            placeholder="Pesquisar por nome ou código de departamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-[var(--hr-text-muted)]" />}
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block">
        <HrTable
          columns={[
            {
              key: 'code',
              header: 'Código',
              width: '120px',
              render: (r) => (
                <span className="font-mono text-xs font-bold text-[var(--hr-primary)]">
                  {r.code}
                </span>
              ),
            },
            {
              key: 'name',
              header: 'Nome do Departamento',
              render: (r) => (
                <div>
                  <div className="font-bold text-[var(--hr-text)]">{r.name}</div>
                  {r.description && (
                    <div className="text-xs text-[var(--hr-text-muted)] truncate max-w-sm">
                      {r.description}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'employees',
              header: 'Colaboradores',
              align: 'center',
              width: '140px',
              render: (r) => (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[var(--hr-surface-muted)] border border-[var(--hr-border)] text-[var(--hr-text)] tabular-nums">
                  {r._count?.employees ?? (r.employees?.length || 0)} afectos
                </span>
              ),
            },
            {
              key: 'status',
              header: 'Estado',
              align: 'center',
              width: '100px',
              render: (r) => (
                <HrBadge variant={r.isActive !== false ? 'success' : 'neutral'} size="sm">
                  {r.isActive !== false ? 'Activo' : 'Inactivo'}
                </HrBadge>
              ),
            },
            {
              key: 'actions',
              header: 'Acção',
              align: 'right',
              width: '90px',
              render: (r) => (
                <HrButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEdit(r)}
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Editar
                </HrButton>
              ),
            },
          ]}
          data={filteredDepts}
          keyExtractor={(r) => r.id}
          isLoading={isLoading}
          emptyMessage="Nenhum departamento cadastrado."
        />
      </div>

      {/* Mobile Card List View */}
      <div className="sm:hidden">
        <HrCardList
          items={filteredDepts}
          isLoading={isLoading}
          emptyMessage="Nenhum departamento cadastrado."
          renderItem={(r) => ({
            item: r,
            key: r.id,
            title: r.name,
            subtitle: `Código: ${r.code}`,
            badge: (
              <HrBadge variant={r.isActive !== false ? 'success' : 'neutral'} size="sm">
                {r.isActive !== false ? 'Activo' : 'Inactivo'}
              </HrBadge>
            ),
            fields: [
              { label: 'Colaboradores', value: `${r._count?.employees ?? 0} afectos` },
              { label: 'Descrição', value: r.description || '—' },
            ],
            actions: (
              <HrButton variant="outline" size="sm" onClick={() => handleOpenEdit(r)}>
                Editar
              </HrButton>
            ),
          })}
        />
      </div>

      {/* Create / Edit Department Modal */}
      <HrDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? 'Editar Departamento' : 'Novo Departamento'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-[var(--hr-status-error-bg)] border border-[var(--hr-status-error)] rounded-[var(--hr-radius-sm)] text-xs text-[var(--hr-status-error)] font-medium">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <HrField label="Nome do Departamento" required>
                <HrInput
                  required
                  placeholder="Ex: Engenharia de Redes & Sistemas"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </HrField>
            </div>

            <HrField label="Código" required hint="Sigla identificadora">
              <HrInput
                required
                placeholder="Ex: ENG-REDES"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </HrField>
          </div>

          <HrField label="Descrição / Atribuições">
            <HrTextarea
              rows={3}
              placeholder="Descreva a finalidade e âmbito deste departamento..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </HrField>

          <HrField label="Departamento Superior (Opcional)">
            <HrSelect
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
            >
              <option value="">Sem departamento superior (Directoria)</option>
              {departments
                .filter((d) => !editingDept || d.id !== editingDept.id)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
            </HrSelect>
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
              {editingDept ? 'Actualizar' : 'Criar Departamento'}
            </HrButton>
          </div>
        </form>
      </HrDialog>
    </div>
  );
}
