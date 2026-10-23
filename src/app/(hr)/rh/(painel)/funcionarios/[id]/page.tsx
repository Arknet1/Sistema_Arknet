'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  User,
  FileText,
  FileCheck,
  History,
  KeyRound,
  UserX,
  Upload,
  Download,
  AlertTriangle,
  Copy,
  Check,
  CheckCircle2,
} from 'lucide-react';
import {
  HrPageHeader,
  HrButton,
  HrBadge,
  HrTabs,
  HrDataList,
  HrTable,
  HrCardList,
  HrDialog,
  HrConfirmDialog,
  HrInput,
  HrSelect,
  HrField,
  HrTextarea,
  HrSkeleton,
} from '@/components/hr';
import { useHrToast } from '@/components/hr/hr-toast';

export default function RhFuncionarioDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const toast = useHrToast();
  const id = params?.id as string;

  const [employee, setEmployee] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dados');

  // Terminate Modal
  const [isTerminateOpen, setIsTerminateOpen] = useState(false);
  const [terminateReason, setTerminateReason] = useState('RESCISAO_MUTUO_ACORDO');
  const [terminateNotes, setTerminateNotes] = useState('');
  const [isTerminating, setIsTerminating] = useState(false);

  // User Account Modal
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userResult, setUserResult] = useState<{ email: string; pass: string } | null>(null);
  const [hasCopiedUserPass, setHasCopiedUserPass] = useState(false);

  // Document Upload Modal
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('BI');
  const [docExpiresAt, setDocExpiresAt] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const loadEmployee = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/rh/funcionarios/${id}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setEmployee(data.employee);
        setUserEmail(data.employee.email || '');
      } else {
        toast.error(data.error || 'Não foi possível carregar a ficha.');
      }
    } catch {
      toast.error('Erro de ligação ao servidor.');
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    if (id) loadEmployee();
  }, [id, loadEmployee]);

  const handleTerminate = async () => {
    setIsTerminating(true);
    try {
      const res = await fetch(`/api/rh/funcionarios/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: terminateReason, notes: terminateNotes }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast.success('Colaborador desligado da empresa e acessos revogados.');
        setIsTerminateOpen(false);
        loadEmployee();
      } else {
        toast.error(data.error || 'Erro ao processar desligamento.');
      }
    } catch {
      toast.error('Erro de ligação.');
    } finally {
      setIsTerminating(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);
    try {
      const res = await fetch(`/api/rh/funcionarios/${id}/criar-utilizador`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast.success('Acesso ao Portal do Colaborador criado com sucesso!');
        setUserResult({
          email: data.user?.email || userEmail,
          pass: data.temporaryPassword,
        });
        loadEmployee();
      } else {
        toast.error(data.error || 'Erro ao criar conta de acesso.');
      }
    } catch {
      toast.error('Erro de rede.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile || !docTitle) {
      toast.warning('Seleccione um ficheiro e preencha o título.');
      return;
    }

    setIsUploadingDoc(true);
    try {
      const form = new FormData();
      form.append('file', docFile);
      form.append('employeeId', id);
      form.append('title', docTitle);
      form.append('type', docType);
      if (docExpiresAt) form.append('expiresAt', docExpiresAt);

      const res = await fetch('/api/rh/documentos', {
        method: 'POST',
        body: form,
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        toast.success('Documento arquivado com segurança.');
        setIsUploadDocOpen(false);
        setDocFile(null);
        setDocTitle('');
        setDocExpiresAt('');
        loadEmployee();
      } else {
        toast.error(data.error || 'Erro ao guardar documento.');
      }
    } catch {
      toast.error('Erro no upload.');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const statusBadge = (st: string) => {
    switch (st) {
      case 'ACTIVO':
        return <HrBadge variant="success" dot size="md">Activo</HrBadge>;
      case 'DESLIGADO':
        return <HrBadge variant="error" size="md">Desligado</HrBadge>;
      case 'FERIAS':
        return <HrBadge variant="info" size="md">Férias</HrBadge>;
      case 'SUSPENSO':
        return <HrBadge variant="warning" size="md">Suspenso</HrBadge>;
      default:
        return <HrBadge variant="neutral" size="md">{st}</HrBadge>;
    }
  };

  if (isLoading && !employee) {
    return (
      <div className="space-y-4">
        <HrSkeleton className="h-8 w-64" />
        <HrSkeleton className="h-4 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <HrSkeleton className="h-40" />
          <HrSkeleton className="h-40" />
          <HrSkeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-8 text-center bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)]">
        <h3 className="text-base font-bold text-[var(--hr-text)]">Colaborador não encontrado</h3>
        <p className="text-xs text-[var(--hr-text-muted)] mt-1">O registo solicitado não existe ou foi removido.</p>
        <div className="mt-4">
          <HrButton variant="outline" size="sm" onClick={() => router.push('/rh/funcionarios')}>
            Voltar à lista
          </HrButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <HrPageHeader
        title={employee.fullName}
        subtitle={`${employee.employeeNumber} · ${employee.position?.title || 'Sem cargo'} · ${employee.department?.name || 'Geral'}`}
        badge={statusBadge(employee.status)}
        breadcrumbs={[
          { label: 'Recursos Humanos', href: '/rh' },
          { label: 'Colaboradores', href: '/rh/funcionarios' },
          { label: employee.fullName },
        ]}
        actions={
          <>
            {employee.status !== 'DESLIGADO' && (
              <HrButton
                variant="outline"
                size="sm"
                onClick={() => setIsTerminateOpen(true)}
                className="hover:border-[var(--hr-status-error)] hover:text-[var(--hr-status-error)]"
                leftIcon={<UserX className="w-4 h-4 text-[var(--hr-status-error)]" />}
              >
                Desligar Colaborador
              </HrButton>
            )}
            <HrButton
              variant="primary"
              size="sm"
              onClick={() => setIsUploadDocOpen(true)}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Arquivar Documento
            </HrButton>
          </>
        }
      />

      {/* Tabs */}
      <HrTabs
        tabs={[
          { id: 'dados', label: 'Dados Gerais', icon: <User className="w-4 h-4" /> },
          { id: 'contratos', label: 'Contratos', icon: <FileCheck className="w-4 h-4" />, badge: <span className="text-[12px] font-mono font-bold">({employee.contracts?.length || 0})</span> },
          { id: 'documentos', label: 'Documentos', icon: <FileText className="w-4 h-4" />, badge: <span className="text-[12px] font-mono font-bold">({employee.documents?.length || 0})</span> },
          { id: 'carreira', label: 'Carreira', icon: <History className="w-4 h-4" /> },
          { id: 'acesso', label: 'Acesso Portal', icon: <KeyRound className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab 1: Dados Gerais */}
      {activeTab === 'dados' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Card: Identificação Pessoal */}
          <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-5 sm:p-6 shadow-[var(--hr-shadow-sm)]">
            <h3 className="text-[13px] font-bold text-[var(--hr-text)] uppercase tracking-wider pb-2.5 mb-3.5 border-b border-[var(--hr-border-subtle)]">
              Identificação & Contactos
            </h3>
            <HrDataList
              columns={2}
              items={[
                { label: 'N.º Colaborador', value: <span className="font-mono font-bold text-[var(--hr-primary)]">{employee.employeeNumber}</span> },
                { label: 'Bilhete de Identidade (BI)', value: employee.biNumber, masked: true, rawUnmaskedValue: employee.biNumber },
                { label: 'Data de Nascimento', value: employee.birthDate ? new Date(employee.birthDate).toLocaleDateString('pt-AO') : '—' },
                { label: 'Género', value: employee.gender === 'M' ? 'Masculino' : employee.gender === 'F' ? 'Feminino' : '—' },
                { label: 'Telefone', value: employee.phone || '—' },
                { label: 'E-mail', value: employee.email || '—' },
                { label: 'Endereço', value: `${employee.address || ''}, ${employee.city || ''} (${employee.province || ''})` },
                { label: 'Nacionalidade', value: employee.nationality || 'Angolana' },
              ]}
            />
          </div>

          {/* Card: Enquadramento & Dados Bancários */}
          <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-5 sm:p-6 shadow-[var(--hr-shadow-sm)]">
            <h3 className="text-[13px] font-bold text-[var(--hr-text)] uppercase tracking-wider pb-2.5 mb-3.5 border-b border-[var(--hr-border-subtle)]">
              Enquadramento & Dados Bancários
            </h3>
            <HrDataList
              columns={2}
              items={[
                { label: 'Departamento', value: employee.department?.name || '—' },
                { label: 'Cargo Actual', value: employee.position?.title || '—' },
                { label: 'Data de Admissão', value: employee.admissionDate ? new Date(employee.admissionDate).toLocaleDateString('pt-AO') : '—' },
                { label: 'Responsável Directo', value: employee.supervisor?.fullName || '—' },
                { label: 'Instituição Bancária', value: employee.bankName || '—' },
                { label: 'IBAN Angolano', value: employee.bankIban || '—', masked: !!employee.bankIban, rawUnmaskedValue: employee.bankIban },
                { label: 'Conta Bancária', value: employee.bankAccountNumber || '—' },
                {
                  label: 'Vencimento Base',
                  value: employee.baseSalary ? `${Number(employee.baseSalary).toLocaleString('pt-AO')} Kz` : 'Sob Consulta',
                  masked: !!employee.baseSalary,
                  rawUnmaskedValue: employee.baseSalary ? `${Number(employee.baseSalary).toLocaleString('pt-AO')} Kz` : undefined,
                },
              ]}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Contratos */}
      {activeTab === 'contratos' && (
        <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-4 sm:p-5 shadow-[var(--hr-shadow-sm)]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--hr-border-subtle)]">
            <div>
              <h3 className="text-sm font-bold text-[var(--hr-text)]">Histórico de Contratos</h3>
              <p className="text-xs text-[var(--hr-text-muted)]">Vínculos contratuais celebrados com a J.Matos</p>
            </div>
          </div>

          <HrTable<any>
            columns={[
              { key: 'type', header: 'Tipo de Contrato' },
              {
                key: 'startDate',
                header: 'Início',
                render: (r: any) => new Date(r.startDate).toLocaleDateString('pt-AO'),
              },
              {
                key: 'endDate',
                header: 'Fim / Renovação',
                render: (r: any) => (r.endDate ? new Date(r.endDate).toLocaleDateString('pt-AO') : 'Indeterminado'),
              },
              {
                key: 'baseSalary',
                header: 'Salário Base',
                align: 'right',
                render: (r: any) => (
                  <span className="font-mono text-xs">
                    {r.baseSalary ? `${Number(r.baseSalary).toLocaleString('pt-AO')} Kz` : '—'}
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'Estado',
                align: 'center',
                render: (r: any) => (
                  <HrBadge variant={r.status === 'ACTIVO' ? 'success' : 'neutral'} size="sm">
                    {r.status}
                  </HrBadge>
                ),
              },
            ]}
            data={employee.contracts || []}
            keyExtractor={(r: any) => r.id}
            emptyMessage="Nenhum contrato registado para este colaborador."
          />
        </div>
      )}

      {/* Tab 3: Documentos */}
      {activeTab === 'documentos' && (
        <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-4 sm:p-5 shadow-[var(--hr-shadow-sm)]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--hr-border-subtle)]">
            <div>
              <h3 className="text-sm font-bold text-[var(--hr-text)]">Arquivo Documental Seguro</h3>
              <p className="text-xs text-[var(--hr-text-muted)]">Documentos oficiais com protecção de privacidade</p>
            </div>
            <HrButton
              variant="secondary"
              size="sm"
              onClick={() => setIsUploadDocOpen(true)}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Novo Documento
            </HrButton>
          </div>

          <HrTable<any>
            columns={[
              {
                key: 'title',
                header: 'Documento',
                render: (r: any) => (
                  <div>
                    <div className="font-bold text-[var(--hr-text)]">{r.title}</div>
                    <div className="text-xs text-[var(--hr-text-muted)] font-mono">{r.type} · {(r.fileSize / 1024).toFixed(1)} KB</div>
                  </div>
                ),
              },
              {
                key: 'expiresAt',
                header: 'Data de Validade',
                render: (r: any) => (
                  r.expiresAt ? (
                    <span className="text-xs tabular-nums text-[var(--hr-text)]">
                      {new Date(r.expiresAt).toLocaleDateString('pt-AO')}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--hr-text-muted)]">Sem validade</span>
                  )
                ),
              },
              {
                key: 'status',
                header: 'Situação',
                align: 'center',
                render: (r: any) => {
                  if (!r.expiresAt) return <HrBadge variant="neutral" size="sm">Válido</HrBadge>;
                  const isExp = new Date(r.expiresAt) < new Date();
                  return isExp ? (
                    <HrBadge variant="error" size="sm">Expirado</HrBadge>
                  ) : (
                    <HrBadge variant="success" size="sm">Em Dia</HrBadge>
                  );
                },
              },
              {
                key: 'action',
                header: 'Descarregar',
                align: 'right',
                render: (r: any) => (
                  <a
                    href={`/api/rh/documentos/${r.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[var(--hr-primary)] hover:bg-[var(--hr-primary-soft)] rounded transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                ),
              },
            ]}
            data={employee.documents || []}
            keyExtractor={(r: any) => r.id}
            emptyMessage="Nenhum documento anexado ao processo."
          />
        </div>
      )}

      {/* Tab 4: Carreira */}
      {activeTab === 'carreira' && (
        <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-4 sm:p-5 shadow-[var(--hr-shadow-sm)]">
          <h3 className="text-sm font-bold text-[var(--hr-text)] mb-3 pb-2 border-b border-[var(--hr-border-subtle)]">
            Progressão na J.Matos
          </h3>
          <HrTable<any>
            columns={[
              {
                key: 'position',
                header: 'Cargo / Função',
                render: (r: any) => r.position?.title || 'Cargo inicial',
              },
              {
                key: 'department',
                header: 'Departamento',
                render: (r: any) => r.department?.name || '—',
              },
              {
                key: 'startDate',
                header: 'Período',
                render: (r: any) => (
                  <span className="text-xs tabular-nums">
                    {new Date(r.startDate).toLocaleDateString('pt-AO')} —{' '}
                    {r.endDate ? new Date(r.endDate).toLocaleDateString('pt-AO') : 'Presente'}
                  </span>
                ),
              },
              {
                key: 'notes',
                header: 'Observações',
                render: (r: any) => <span className="text-xs text-[var(--hr-text-muted)]">{r.notes || '—'}</span>,
              },
            ]}
            data={employee.careerHistory || []}
            keyExtractor={(r: any) => r.id}
            emptyMessage="Sem alterações de cargo registadas até ao momento."
          />
        </div>
      )}

      {/* Tab 5: Acesso ao Sistema */}
      {activeTab === 'acesso' && (
        <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-4 sm:p-5 shadow-[var(--hr-shadow-sm)] max-w-2xl">
          <h3 className="text-sm font-bold text-[var(--hr-text)] mb-2">
            Credenciais de Acesso ao Portal do Colaborador
          </h3>
          <p className="text-xs text-[var(--hr-text-muted)] mb-4">
            Permite ao colaborador consultar recibos, dados pessoais e documentos na rota <code>/portal</code>.
          </p>

          {employee.user ? (
            <div className="p-4 bg-[var(--hr-surface-muted)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--hr-text-muted)]">Conta de utilizador associada:</span>
                <HrBadge variant="success" size="sm">Activa</HrBadge>
              </div>
              <div className="text-sm font-bold font-mono text-[var(--hr-text)]">
                {employee.user.email}
              </div>
              <div className="pt-2 border-t border-[var(--hr-border)] flex items-center justify-between">
                <span className="text-xs text-[var(--hr-text-muted)]">Perfil de Permissão:</span>
                <span className="text-xs font-bold text-[var(--hr-primary)]">{employee.user.role}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[var(--hr-surface-muted)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] space-y-3">
              <p className="text-xs text-[var(--hr-text-muted)]">
                Este colaborador ainda não possui utilizador configurado para o portal de auto-atendimento.
              </p>
              <HrButton
                variant="primary"
                size="sm"
                onClick={() => setIsCreateUserOpen(true)}
                leftIcon={<KeyRound className="w-4 h-4" />}
              >
                Criar Acesso ao Portal
              </HrButton>
            </div>
          )}
        </div>
      )}

      {/* Terminate Employee Confirm Dialog */}
      <HrConfirmDialog
        isOpen={isTerminateOpen}
        onClose={() => setIsTerminateOpen(false)}
        onConfirm={handleTerminate}
        title="Desligar Colaborador da Empresa"
        message={`Confirma o encerramento do vínculo de ${employee.fullName}? Esta acção alterará o estado para DESLIGADO, revogará o acesso ao sistema e ficará registada na auditoria de RH.`}
        confirmText="Confirmar Desligamento"
        isDestructive
        isLoading={isTerminating}
      />

      {/* Create User Modal */}
      <HrDialog
        isOpen={isCreateUserOpen}
        onClose={() => {
          setIsCreateUserOpen(false);
          setUserResult(null);
        }}
        title={userResult ? 'Acesso Criado com Sucesso' : 'Gerar Acesso ao Portal'}
        maxWidth="md"
      >
        {userResult ? (
          <div className="space-y-4 py-2">
            <div className="p-3 bg-[var(--hr-status-success-bg)] border border-[var(--hr-status-success)] rounded-[var(--hr-radius-sm)] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[var(--hr-status-success)] flex-shrink-0" />
              <p className="text-xs font-semibold text-[var(--hr-status-success)]">
                Acesso gerado com sucesso para o colaborador!
              </p>
            </div>
            <div className="p-4 bg-[var(--hr-surface-muted)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--hr-text-muted)]">E-mail de Login:</span>
                <span className="font-mono font-bold text-[var(--hr-text)]">{userResult.email}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[var(--hr-border)]">
                <span className="text-[var(--hr-text-muted)]">Palavra-passe Temporária:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm bg-[var(--hr-surface)] px-2.5 py-1 border border-[var(--hr-border)] rounded text-[var(--hr-primary)]">
                    {userResult.pass}
                  </span>
                  <HrButton
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(userResult.pass);
                      setHasCopiedUserPass(true);
                      setTimeout(() => setHasCopiedUserPass(false), 2000);
                      toast.info('Palavra-passe copiada.');
                    }}
                    leftIcon={hasCopiedUserPass ? <Check className="w-3.5 h-3.5 text-[var(--hr-status-success)]" /> : <Copy className="w-3.5 h-3.5" />}
                  >
                    {hasCopiedUserPass ? 'Copiado' : 'Copiar'}
                  </HrButton>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <HrButton
                variant="primary"
                size="md"
                onClick={() => {
                  setIsCreateUserOpen(false);
                  setUserResult(null);
                }}
              >
                Concluir
              </HrButton>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateUser} className="space-y-4">
            <HrField label="E-mail de Acesso" required hint="Utilizado para login em /portal">
              <HrInput
                type="email"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="colaborador@jmatos.co.ao"
              />
            </HrField>
            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--hr-border)]">
              <HrButton variant="outline" size="sm" onClick={() => setIsCreateUserOpen(false)}>
                Cancelar
              </HrButton>
              <HrButton variant="primary" size="sm" type="submit" isLoading={isCreatingUser}>
                Criar Utilizador
              </HrButton>
            </div>
          </form>
        )}
      </HrDialog>

      {/* Upload Document Modal */}
      <HrDialog
        isOpen={isUploadDocOpen}
        onClose={() => setIsUploadDocOpen(false)}
        title="Arquivar Documento de Colaborador"
        maxWidth="md"
      >
        <form onSubmit={handleUploadDocument} className="space-y-4">
          <HrField label="Título do Documento" required>
            <HrInput
              required
              placeholder="Ex: Cópia do Bilhete de Identidade, Certificado de Habilitações"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
            />
          </HrField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <HrField label="Tipo de Documento">
              <HrSelect value={docType} onChange={(e) => setDocType(e.target.value)}>
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
                value={docExpiresAt}
                onChange={(e) => setDocExpiresAt(e.target.value)}
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

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--hr-border)]">
            <HrButton variant="outline" size="sm" onClick={() => setIsUploadDocOpen(false)}>
              Cancelar
            </HrButton>
            <HrButton variant="primary" size="sm" type="submit" isLoading={isUploadingDoc}>
              Arquivar
            </HrButton>
          </div>
        </form>
      </HrDialog>
    </div>
  );
}
