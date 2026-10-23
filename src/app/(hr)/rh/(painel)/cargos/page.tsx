'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Briefcase, Plus, Edit2, Search } from 'lucide-react';
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

export default function RhCargosPage() {
  const toast = useHrToast();
  const [positions, setPositions] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    level: 'Junior',
    salaryCategory: 'CAT-A',
    description: '',
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [posRes, deptRes] = await Promise.all([
        fetch('/api/rh/cargos'),
        fetch('/api/rh/departamentos'),
      ]);
      const [posData, deptData] = await Promise.all([
        posRes.json().catch(() => ({})),
        deptRes.json().catch(() => ({})),
      ]);

      if (posData.success) {
        setPositions(posData.positions || []);
      }
      if (deptData.success) {
        setDepartments(deptData.departments || []);
      }
    } catch {
      toast.error('Erro ao carregar cargos e funções.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingPos(null);
    setFormData({ title: '', code: '', level: 'Junior', salaryCategory: 'CAT-A', description: '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pos: any) => {
    setEditingPos(pos);
    setFormData({
      title: pos.title,
      code: pos.code,
      level: pos.level || 'Junior',
      salaryCategory: pos.salaryCategory || 'CAT-A',
      description: pos.description || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.code.trim()) {
      setFormError('Título e Código do cargo são obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const url = editingPos
        ? `/api/rh/cargos/${editingPos.id}`
        : '/api/rh/cargos';
      const method = editingPos ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        toast.success(editingPos ? 'Cargo actualizado com sucesso.' : 'Cargo criado com sucesso.');
        setIsModalOpen(false);
        loadData();
      } else {
        setFormError(data.error || 'Erro ao gravar cargo.');
      }
    } catch {
      setFormError('Erro de ligação ao servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPositions = positions.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <HrPageHeader
        title="Cargos e Funções"
        subtitle="Carreiras e grelha funcional da J.Matos Tecnologia"
        breadcrumbs={[
          { label: 'Recursos Humanos', href: '/rh' },
          { label: 'Cargos' },
        ]}
        actions={
          <HrButton
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Novo Cargo
          </HrButton>
        }
      />

      {/* Search Bar */}
      <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-3 sm:p-4 shadow-[var(--hr-shadow-sm)]">
        <div className="max-w-md">
          <HrInput
            type="text"
            placeholder="Pesquisar por título ou código de cargo..."
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
              key: 'title',
              header: 'Título da Função',
              render: (r) => (
                <div>
                  <div className="font-bold text-[var(--hr-text)]">{r.title}</div>
                  {r.description && (
                    <div className="text-xs text-[var(--hr-text-muted)] truncate max-w-sm">
                      {r.description}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'level',
              header: 'Nível / Carreira',
              align: 'center',
              width: '140px',
              render: (r) => (
                <span className="text-xs font-medium text-[var(--hr-text)] bg-[var(--hr-surface-muted)] border border-[var(--hr-border)] px-2.5 py-0.5 rounded">
                  {r.level || 'Padrão'}
                </span>
              ),
            },
            {
              key: 'salaryCategory',
              header: 'Categoria',
              align: 'center',
              width: '120px',
              render: (r) => (
                <span className="font-mono text-xs font-semibold text-[var(--hr-text)]">
                  {r.salaryCategory || '—'}
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
          data={filteredPositions}
          keyExtractor={(r) => r.id}
          isLoading={isLoading}
          emptyMessage="Nenhum cargo registado."
        />
      </div>

      {/* Mobile Card List View */}
      <div className="sm:hidden">
        <HrCardList
          items={filteredPositions}
          isLoading={isLoading}
          emptyMessage="Nenhum cargo registado."
          renderItem={(r) => ({
            item: r,
            key: r.id,
            title: r.title,
            subtitle: `Código: ${r.code} · ${r.level || 'Geral'}`,
            badge: (
              <HrBadge variant={r.isActive !== false ? 'success' : 'neutral'} size="sm">
                {r.isActive !== false ? 'Activo' : 'Inactivo'}
              </HrBadge>
            ),
            fields: [
              { label: 'Categoria', value: r.salaryCategory || '—' },
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

      {/* Modal Criar / Editar Cargo */}
      <HrDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPos ? 'Editar Cargo' : 'Novo Cargo'}
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
              <HrField label="Título do Cargo" required>
                <HrInput
                  required
                  placeholder="Ex: Engenheiro de Telecomunicações"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </HrField>
            </div>

            <HrField label="Código" required hint="Sigla identificadora">
              <HrInput
                required
                placeholder="Ex: ENG-TEL"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </HrField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <HrField label="Nível Profissional">
              <HrSelect
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              >
                <option value="Estagiário">Estagiário</option>
                <option value="Júnior">Júnior</option>
                <option value="Pleno">Pleno</option>
                <option value="Sénior">Sénior</option>
                <option value="Especialista">Especialista</option>
                <option value="Coordenador">Coordenador</option>
                <option value="Director">Director</option>
              </HrSelect>
            </HrField>

            <HrField label="Categoria Salarial">
              <HrInput
                placeholder="Ex: CAT-A, NÍVEL-3"
                value={formData.salaryCategory}
                onChange={(e) => setFormData({ ...formData, salaryCategory: e.target.value })}
              />
            </HrField>
          </div>

          <HrField label="Descrição das Atribuições e Responsabilidades">
            <HrTextarea
              rows={3}
              placeholder="Descreva o escopo e qualificações exigidas para este cargo..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              {editingPos ? 'Actualizar' : 'Criar Cargo'}
            </HrButton>
          </div>
        </form>
      </HrDialog>
    </div>
  );
}
