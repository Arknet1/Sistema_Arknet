'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  UserPlus,
  Search,
  Filter,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import {
  HrPageHeader,
  HrButton,
  HrBadge,
  HrTable,
  HrCardList,
  HrDialog,
  HrDrawer,
  HrInput,
  HrSelect,
  HrField,
  HrCheckbox,
} from '@/components/hr';
import { useHrToast } from '@/components/hr/hr-toast';
import { HR_EMPLOYEE_PREFIX } from '@/lib/hr/config';

function RhFuncionariosContent() {
  const searchParams = useSearchParams();
  const toast = useHrToast();

  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Mobile Filter Drawer
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // New Employee Modal
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('novo') === 'true');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [temporaryPasswordResult, setTemporaryPasswordResult] = useState<{
    name: string;
    email: string;
    pass: string;
  } | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    biNumber: '',
    birthDate: '',
    gender: 'M',
    phone: '',
    email: '',
    address: 'Luanda',
    city: 'Luanda',
    province: 'Luanda',
    departmentId: '',
    positionId: '',
    admissionDate: new Date().toISOString().split('T')[0],
    bankName: '',
    bankIban: '',
    bankAccountNumber: '',
    createSystemUser: true,
    userRole: 'FUNCIONARIO',
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (selectedDept) query.set('departmentId', selectedDept);
      if (selectedStatus) query.set('status', selectedStatus);
      query.set('page', String(page));
      query.set('limit', '12');

      const [empRes, deptRes, posRes] = await Promise.all([
        fetch(`/api/rh/funcionarios?${query.toString()}`),
        fetch('/api/rh/departamentos'),
        fetch('/api/rh/cargos'),
      ]);

      const [empData, deptData, posData] = await Promise.all([
        empRes.json().catch(() => ({})),
        deptRes.json().catch(() => ({})),
        posRes.json().catch(() => ({})),
      ]);

      if (empData.success) {
        setEmployees(empData.employees || []);
        setPagination(empData.pagination || { total: 0, totalPages: 1 });
      }

      if (deptData.success) {
        setDepartments(deptData.departments || []);
      }

      if (posData.success) {
        setPositions(posData.positions || []);
      }
    } catch {
      toast.error('Erro ao carregar colaboradores');
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedDept, selectedStatus, page, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.fullName.trim() || !formData.biNumber.trim()) {
      setFormError('Nome completo e Número de BI são obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/rh/funcionarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setFormError(data.error || 'Erro ao registar colaborador');
        setIsSubmitting(false);
        return;
      }

      toast.success('Colaborador registado com sucesso na J.Matos!');

      if (data.temporaryPassword) {
        setTemporaryPasswordResult({
          name: formData.fullName,
          email: data.userEmail || formData.email,
          pass: data.temporaryPassword,
        });
      } else {
        setIsModalOpen(false);
        resetForm();
      }

      loadData();
    } catch {
      setFormError('Erro de ligação ao servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      biNumber: '',
      birthDate: '',
      gender: 'M',
      phone: '',
      email: '',
      address: 'Luanda',
      city: 'Luanda',
      province: 'Luanda',
      departmentId: '',
      positionId: '',
      admissionDate: new Date().toISOString().split('T')[0],
      bankName: '',
      bankIban: '',
      bankAccountNumber: '',
      createSystemUser: true,
      userRole: 'FUNCIONARIO',
    });
    setFormError(null);
    setTemporaryPasswordResult(null);
  };

  const handleCopyPassword = () => {
    if (temporaryPasswordResult?.pass) {
      navigator.clipboard.writeText(temporaryPasswordResult.pass);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
      toast.info('Palavra-passe temporária copiada para a área de transferência.');
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
    <div className="space-y-5">
      <HrPageHeader
        title="Colaboradores"
        subtitle={`Gestão do quadro de pessoal da J.Matos (${pagination.total} registados)`}
        breadcrumbs={[
          { label: 'Recursos Humanos', href: '/rh' },
          { label: 'Colaboradores' },
        ]}
        actions={
          <>
            <HrButton
              variant="outline"
              size="sm"
              className="sm:hidden"
              onClick={() => setIsFilterDrawerOpen(true)}
              leftIcon={<Filter className="w-4 h-4" />}
            >
              Filtros
            </HrButton>
            <HrButton
              variant="primary"
              size="sm"
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Novo Colaborador
            </HrButton>
          </>
        }
      />

      {/* Filter Bar (Desktop) */}
      <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-3 sm:p-4 shadow-[var(--hr-shadow-sm)]">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <HrInput
              type="text"
              placeholder="Pesquisar por nome, N.º (JM-xxx), BI ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="w-48">
              <HrSelect
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Todos os Departamentos</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </HrSelect>
            </div>

            <div className="w-40">
              <HrSelect
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Todos os Estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="FERIAS">Férias</option>
                <option value="SUSPENSO">Suspenso</option>
                <option value="DESLIGADO">Desligado</option>
              </HrSelect>
            </div>

            <HrButton type="submit" variant="secondary" size="md">
              Pesquisar
            </HrButton>
          </div>
        </form>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block">
        <HrTable
          columns={[
            {
              key: 'employeeNumber',
              header: 'N.º Colaborador',
              width: '130px',
              render: (r) => (
                <span className="font-mono text-[13px] font-bold text-[var(--hr-primary)]">
                  {r.employeeNumber}
                </span>
              ),
            },
            {
              key: 'fullName',
              header: 'Nome Completo',
              render: (r) => (
                <div>
                  <div className="font-bold text-[15px] text-[var(--hr-text)]">{r.fullName}</div>
                  <div className="text-[13px] text-[var(--hr-text-muted)] flex items-center gap-2 mt-0.5">
                    <span>BI: {r.biNumber}</span>
                    {r.user && (
                      <span className="inline-flex items-center gap-1 text-[12px] text-[var(--hr-primary)] font-semibold">
                        <KeyRound className="w-3 h-3" /> Acesso activo
                      </span>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: 'department',
              header: 'Departamento & Cargo',
              render: (r) => (
                <div>
                  <div className="text-[14px] font-semibold text-[var(--hr-text)]">
                    {r.department?.name || 'Sem departamento'}
                  </div>
                  <div className="text-[13px] text-[var(--hr-text-muted)]">
                    {r.position?.title || 'Sem cargo'}
                  </div>
                </div>
              ),
            },
            {
              key: 'contact',
              header: 'Contacto',
              render: (r) => (
                <div>
                  <div className="text-[13px] font-medium text-[var(--hr-text)]">{r.phone || '—'}</div>
                  <div className="text-[13px] text-[var(--hr-text-muted)]">{r.email || '—'}</div>
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
            {
              key: 'actions',
              header: 'Acção',
              align: 'right',
              width: '90px',
              render: (r) => (
                <Link href={`/rh/funcionarios/${r.id}`}>
                  <HrButton variant="ghost" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                    Ficha
                  </HrButton>
                </Link>
              ),
            },
          ]}
          data={employees}
          keyExtractor={(r) => r.id}
          isLoading={isLoading}
          emptyMessage="Nenhum colaborador encontrado com os filtros aplicados."
        />
      </div>

      {/* Mobile Card List View */}
      <div className="sm:hidden">
        <HrCardList
          items={employees}
          isLoading={isLoading}
          emptyMessage="Nenhum colaborador encontrado."
          renderItem={(r) => ({
            item: r,
            key: r.id,
            title: r.fullName,
            subtitle: `${r.employeeNumber} · ${r.position?.title || r.department?.name || 'Sem cargo'}`,
            badge: statusBadge(r.status),
            fields: [
              { label: 'Departamento', value: r.department?.name || '—' },
              { label: 'Telefone', value: r.phone || '—' },
            ],
            onClick: () => {
              window.location.href = `/rh/funcionarios/${r.id}`;
            },
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

      {/* Mobile Filters Drawer */}
      <HrDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title="Filtrar Colaboradores"
        footer={
          <>
            <HrButton
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedDept('');
                setSelectedStatus('');
                setSearch('');
                setIsFilterDrawerOpen(false);
                setPage(1);
              }}
            >
              Limpar
            </HrButton>
            <HrButton
              variant="primary"
              size="sm"
              onClick={() => {
                setIsFilterDrawerOpen(false);
                setPage(1);
                loadData();
              }}
            >
              Aplicar Filtros
            </HrButton>
          </>
        }
      >
        <div className="space-y-4">
          <HrField label="Departamento">
            <HrSelect
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">Todos os Departamentos</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </HrSelect>
          </HrField>

          <HrField label="Estado Contratual">
            <HrSelect
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Todos os Estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="FERIAS">Férias</option>
              <option value="SUSPENSO">Suspenso</option>
              <option value="DESLIGADO">Desligado</option>
            </HrSelect>
          </HrField>
        </div>
      </HrDrawer>

      {/* New Employee Modal */}
      <HrDialog
        isOpen={isModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsModalOpen(false);
            resetForm();
          }
        }}
        title={temporaryPasswordResult ? 'Conta Criada com Sucesso' : 'Registar Novo Colaborador'}
        description={
          temporaryPasswordResult
            ? 'Registo e credenciais de acesso temporárias do colaborador.'
            : 'Preencha a ficha cadastral do colaborador da J.Matos.'
        }
        maxWidth="lg"
      >
        {temporaryPasswordResult ? (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-[var(--hr-status-success-bg)] border border-[var(--hr-border)] border-l-4 border-l-[var(--hr-status-success)] rounded-[var(--hr-radius)] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[var(--hr-status-success)] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[var(--hr-text)]">
                  Ficha criada e acesso gerado com sucesso!
                </h4>
                <p className="text-xs text-[var(--hr-text-muted)] mt-1">
                  O colaborador foi cadastrado com prefixo <strong>{HR_EMPLOYEE_PREFIX}</strong>. Entregue as credenciais provisórias abaixo:
                </p>
              </div>
            </div>

            <div className="p-4 bg-[var(--hr-surface-muted)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--hr-text-muted)]">Colaborador:</span>
                <span className="font-bold text-[var(--hr-text)]">{temporaryPasswordResult.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--hr-text-muted)]">E-mail de Login:</span>
                <span className="font-mono font-bold text-[var(--hr-text)]">{temporaryPasswordResult.email}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[var(--hr-border)]">
                <span className="text-[var(--hr-text-muted)]">Palavra-passe Temporária:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm bg-[var(--hr-surface)] px-2.5 py-1 border border-[var(--hr-border)] rounded text-[var(--hr-primary)]">
                    {temporaryPasswordResult.pass}
                  </span>
                  <HrButton
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPassword}
                    leftIcon={hasCopied ? <Check className="w-3.5 h-3.5 text-[var(--hr-status-success)]" /> : <Copy className="w-3.5 h-3.5" />}
                  >
                    {hasCopied ? 'Copiado' : 'Copiar'}
                  </HrButton>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <HrButton
                variant="primary"
                size="md"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                Concluir
              </HrButton>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateEmployee} className="space-y-5">
            {formError && (
              <div className="p-3 bg-[var(--hr-status-error-bg)] border border-[var(--hr-status-error)] rounded-[var(--hr-radius-sm)] text-xs text-[var(--hr-status-error)] font-medium">
                {formError}
              </div>
            )}

            {/* Section 1: Dados Pessoais */}
            <div>
              <h4 className="text-xs font-bold text-[var(--hr-text)] uppercase tracking-wider mb-3 pb-1 border-b border-[var(--hr-border-subtle)]">
                1. Dados de Identificação Pessoal
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <HrField label="Nome Completo" required>
                    <HrInput
                      required
                      placeholder="Ex: Carlos Manuel dos Santos"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </HrField>
                </div>

                <HrField label="N.º do Bilhete de Identidade (BI)" required hint="14 caracteres com formato angolano (ex.: 000123456LA012)">
                  <HrInput
                    required
                    placeholder="000000000XX000"
                    value={formData.biNumber}
                    onChange={(e) => setFormData({ ...formData, biNumber: e.target.value.toUpperCase() })}
                  />
                </HrField>

                <HrField label="Data de Nascimento">
                  <HrInput
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  />
                </HrField>

                <HrField label="Género">
                  <HrSelect
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </HrSelect>
                </HrField>

                <HrField label="Telefone de Contacto">
                  <HrInput
                    type="tel"
                    placeholder="+244 9XX XXX XXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </HrField>

                <div className="sm:col-span-2">
                  <HrField label="E-mail Pessoal / Corporativo" hint="Será utilizado para notificações e acesso ao portal">
                    <HrInput
                      type="email"
                      placeholder="carlos.santos@jmatos.co.ao"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </HrField>
                </div>
              </div>
            </div>

            {/* Section 2: Enquadramento */}
            <div>
              <h4 className="text-xs font-bold text-[var(--hr-text)] uppercase tracking-wider mb-3 pb-1 border-b border-[var(--hr-border-subtle)]">
                2. Enquadramento e Cargo na J.Matos
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <HrField label="Departamento">
                  <HrSelect
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  >
                    <option value="">Seleccione o departamento</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </HrSelect>
                </HrField>

                <HrField label="Cargo / Função">
                  <HrSelect
                    value={formData.positionId}
                    onChange={(e) => setFormData({ ...formData, positionId: e.target.value })}
                  >
                    <option value="">Seleccione o cargo</option>
                    {positions
                      .filter((p) => !formData.departmentId || p.departmentId === formData.departmentId)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                  </HrSelect>
                </HrField>

                <HrField label="Data de Admissão">
                  <HrInput
                    type="date"
                    value={formData.admissionDate}
                    onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                  />
                </HrField>
              </div>
            </div>

            {/* Section 3: Dados Bancários */}
            <div>
              <h4 className="text-xs font-bold text-[var(--hr-text)] uppercase tracking-wider mb-3 pb-1 border-b border-[var(--hr-border-subtle)]">
                3. Dados Bancários
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <HrField label="Instituição Bancária">
                  <HrInput
                    placeholder="Ex: BAI, BFA, Millennium Atlântico"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  />
                </HrField>

                <HrField label="IBAN Angolano (AO06...)">
                  <HrInput
                    placeholder="AO06.0000.0000.0000.0000.0"
                    value={formData.bankIban}
                    onChange={(e) => setFormData({ ...formData, bankIban: e.target.value.toUpperCase() })}
                  />
                </HrField>
              </div>
            </div>

            {/* Section 4: Acesso ao Sistema */}
            <div className="p-3.5 bg-[var(--hr-surface-muted)] border border-[var(--hr-border)] rounded-[var(--hr-radius)]">
              <HrCheckbox
                id="createSystemUser"
                label="Criar utilizador de acesso ao Portal do Colaborador"
                hint="Gera uma palavra-passe temporária para o colaborador aceder a /portal"
                checked={formData.createSystemUser}
                onChange={(e) => setFormData({ ...formData, createSystemUser: e.target.checked })}
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--hr-border)]">
              <HrButton
                type="button"
                variant="outline"
                size="md"
                disabled={isSubmitting}
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </HrButton>
              <HrButton
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
              >
                Registar Colaborador
              </HrButton>
            </div>
          </form>
        )}
      </HrDialog>
    </div>
  );
}

export default function RhFuncionariosPage() {
  return (
    <React.Suspense fallback={<div className="p-6 text-sm text-[var(--hr-text-muted)]">A carregar colaboradores...</div>}>
      <RhFuncionariosContent />
    </React.Suspense>
  );
}
