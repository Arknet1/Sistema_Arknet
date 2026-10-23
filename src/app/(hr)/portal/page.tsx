'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  FileText,
  Briefcase,
  Lock,
  Download,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Shield,
  KeyRound,
  Calendar,
  Building2,
} from 'lucide-react';
import {
  HrAppBar,
  HrBottomNav,
  HrTabs,
  HrButton,
  HrBadge,
  HrDataList,
  HrTable,
  HrCardList,
  HrDialog,
  HrInput,
  HrField,
  HrSkeleton,
} from '@/components/hr';
import { useHrToast } from '@/components/hr/hr-toast';

export default function PortalColaboradorPage() {
  const router = useRouter();
  const toast = useHrToast();

  const [user, setUser] = useState<any | null>(null);
  const [employee, setEmployee] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('perfil');

  // Password Change state
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Check session
      const sessionRes = await fetch('/api/auth/session');
      if (!sessionRes.ok) {
        router.push('/rh/entrar?redirect=/portal');
        return;
      }
      const sessionData = await sessionRes.json().catch(() => ({}));
      if (!sessionData?.user) {
        router.push('/rh/entrar?redirect=/portal');
        return;
      }
      setUser(sessionData.user);

      if (sessionData.user.mustChangePassword) {
        setIsChangingPass(true);
      }

      // 2. Fetch employee portal data
      const portalRes = await fetch('/api/portal/dados');
      const portalData = await portalRes.json().catch(() => ({}));

      if (portalRes.ok && portalData.success) {
        setEmployee(portalData.employee);
      } else if (portalRes.status === 401) {
        router.push('/rh/entrar?redirect=/portal');
      } else {
        toast.error(portalData.error || 'Não foi possível carregar os seus dados.');
      }
    } catch {
      toast.error('Erro de ligação ao carregar dados do portal.');
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
    } catch {
      // ignore
    }
    window.location.href = '/rh/entrar';
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);

    if (newPass.length < 8) {
      setPassError('A nova palavra-passe deve ter no mínimo 8 caracteres.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('A nova palavra-passe e a confirmação não coincidem.');
      return;
    }

    setIsSubmittingPass(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        toast.success('Palavra-passe actualizada com sucesso!');
        setIsChangingPass(false);
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
        if (user) {
          setUser({ ...user, mustChangePassword: false });
        }
      } else {
        setPassError(data.error || 'Erro ao alterar a palavra-passe.');
      }
    } catch {
      setPassError('Erro de ligação ao actualizar palavra-passe.');
    } finally {
      setIsSubmittingPass(false);
    }
  };

  const navItems = [
    { id: 'perfil', label: 'Meu Perfil', icon: <User className="w-5 h-5" /> },
    { id: 'documentos', label: 'Documentos', icon: <FileText className="w-5 h-5" /> },
    { id: 'contrato', label: 'Carreira', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'seguranca', label: 'Segurança', icon: <Lock className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--hr-bg)]">
      {/* Top App Bar */}
      <HrAppBar
        title="Portal do Colaborador"
        showLogo
        logoHref="/portal"
        userName={employee?.fullName || user?.name || user?.email?.split('@')[0]}
        onLogout={handleLogout}
      />

      {/* Main Content Area with Safe-Area bottom padding on mobile */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
        {/* First Access Warning Banner */}
        {user?.mustChangePassword && (
          <div className="mb-5 p-4 bg-[var(--hr-status-warning-bg)] border border-[var(--hr-border)] border-l-4 border-l-[var(--hr-status-warning)] rounded-[var(--hr-radius)] flex items-start justify-between gap-3 shadow-[var(--hr-shadow-sm)]">
            <div className="flex items-start gap-2.5">
              <KeyRound className="w-5 h-5 text-[var(--hr-status-warning)] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[var(--hr-text)] uppercase tracking-wide">
                  Primeiro Acesso Detectado
                </h4>
                <p className="text-xs text-[var(--hr-text)] mt-0.5 leading-relaxed">
                  Para sua segurança, é obrigatório alterar a palavra-passe provisória atribuída pelos Recursos Humanos da J.Matos.
                </p>
              </div>
            </div>
            <HrButton
              variant="primary"
              size="sm"
              onClick={() => setIsChangingPass(true)}
            >
              Alterar Agora
            </HrButton>
          </div>
        )}

        {/* Desktop Tabs Header (hidden on mobile, uses BottomNav instead) */}
        <div className="hidden md:block mb-6">
          <HrTabs
            tabs={navItems}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <HrSkeleton className="h-28 w-full" />
            <HrSkeleton className="h-60 w-full" />
          </div>
        ) : !employee ? (
          <div className="p-8 text-center bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)]">
            <Shield className="w-8 h-8 text-[var(--hr-text-muted)] mx-auto mb-2" />
            <h3 className="text-base font-bold text-[var(--hr-text)]">
              Ficha de Colaborador Não Vinculada
            </h3>
            <p className="text-xs text-[var(--hr-text-muted)] mt-1 max-w-md mx-auto">
              A sua conta de utilizador ainda não tem uma ficha cadastral de colaborador ligada no sistema de RH da J.Matos.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header Hero Card */}
            <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-4 sm:p-5 shadow-[var(--hr-shadow-sm)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-full bg-[var(--hr-primary-soft)] text-[var(--hr-primary)] border border-[var(--hr-border)] flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {employee.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-[var(--hr-text)] truncate">
                    {employee.fullName}
                  </h2>
                  <p className="text-xs text-[var(--hr-text-muted)] flex items-center gap-2 mt-0.5 truncate">
                    <span className="font-mono font-bold text-[var(--hr-primary)]">{employee.employeeNumber}</span>
                    <span>·</span>
                    <span>{employee.position?.title || 'Sem cargo'}</span>
                    <span>·</span>
                    <span>{employee.department?.name || 'J.Matos'}</span>
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <HrBadge variant="success" dot size="md">
                  {employee.status || 'Activo'}
                </HrBadge>
              </div>
            </div>

            {/* TAB: Perfil */}
            {activeTab === 'perfil' && (
              <div className="space-y-5">
                {/* Dados Pessoais & Contacto */}
                <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-5 sm:p-6 shadow-[var(--hr-shadow-sm)]">
                  <h3 className="text-[13px] font-bold text-[var(--hr-text)] uppercase tracking-wider pb-2.5 mb-3.5 border-b border-[var(--hr-border-subtle)]">
                    Identificação & Contactos
                  </h3>
                  <HrDataList
                    columns={2}
                    items={[
                      { label: 'Nome Completo', value: employee.fullName },
                      { label: 'Bilhete de Identidade (BI)', value: employee.biNumber, masked: true, rawUnmaskedValue: employee.biNumber },
                      { label: 'Telefone', value: employee.phone || '—' },
                      { label: 'E-mail', value: employee.email || user?.email || '—' },
                      { label: 'Data de Nascimento', value: employee.birthDate ? new Date(employee.birthDate).toLocaleDateString('pt-AO') : '—' },
                      { label: 'Género', value: employee.gender === 'M' ? 'Masculino' : employee.gender === 'F' ? 'Feminino' : '—' },
                      { label: 'Endereço', value: `${employee.address || ''}, ${employee.city || ''}` },
                      { label: 'Nacionalidade', value: employee.nationality || 'Angolana' },
                    ]}
                  />
                </div>

                {/* Dados Bancários */}
                <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-5 sm:p-6 shadow-[var(--hr-shadow-sm)]">
                  <h3 className="text-[13px] font-bold text-[var(--hr-text)] uppercase tracking-wider pb-2.5 mb-3.5 border-b border-[var(--hr-border-subtle)]">
                    Dados Bancários Cadastrados
                  </h3>
                  <HrDataList
                    columns={2}
                    items={[
                      { label: 'Banco', value: employee.bankName || '—' },
                      { label: 'IBAN Angolano', value: employee.bankIban || '—', masked: !!employee.bankIban, rawUnmaskedValue: employee.bankIban },
                      { label: 'N.º da Conta', value: employee.bankAccountNumber || '—' },
                      {
                        label: 'Vencimento Base Mensal',
                        value: employee.baseSalary ? `${Number(employee.baseSalary).toLocaleString('pt-AO')} Kz` : 'Confidencial',
                        masked: !!employee.baseSalary,
                        rawUnmaskedValue: employee.baseSalary ? `${Number(employee.baseSalary).toLocaleString('pt-AO')} Kz` : undefined,
                      },
                    ]}
                  />
                </div>
              </div>
            )}

            {/* TAB: Documentos */}
            {activeTab === 'documentos' && (
              <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-4 sm:p-5 shadow-[var(--hr-shadow-sm)]">
                <div className="pb-3 mb-3 border-b border-[var(--hr-border-subtle)]">
                  <h3 className="text-sm font-bold text-[var(--hr-text)]">
                    Meus Documentos Oficiais
                  </h3>
                  <p className="text-xs text-[var(--hr-text-muted)] mt-0.5">
                    Ficheiros e certidões arquivados no seu processo de colaborador
                  </p>
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block">
                  <HrTable<any>
                    columns={[
                      {
                        key: 'title',
                        header: 'Documento',
                        render: (r: any) => (
                          <div>
                            <div className="font-bold text-[var(--hr-text)]">{r.title}</div>
                            <div className="text-xs text-[var(--hr-text-muted)] font-mono">{r.type} · {(r.fileSize / 1024).toFixed(0)} KB</div>
                          </div>
                        ),
                      },
                      {
                        key: 'expiresAt',
                        header: 'Validade',
                        render: (r: any) => (
                          r.expiresAt ? (
                            <span className="text-xs tabular-nums text-[var(--hr-text)]">
                              {new Date(r.expiresAt).toLocaleDateString('pt-AO')}
                            </span>
                          ) : (
                            <span className="text-xs text-[var(--hr-text-muted)]">Vitalício / S/ Prazo</span>
                          )
                        ),
                      },
                      {
                        key: 'download',
                        header: 'Acção',
                        align: 'right',
                        render: (r: any) => (
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
                    data={employee.documents || []}
                    keyExtractor={(r: any) => r.id}
                    emptyMessage="Nenhum documento disponível no seu arquivo."
                  />
                </div>

                {/* Mobile Cards */}
                <div className="sm:hidden">
                  <HrCardList<any>
                    items={employee.documents || []}
                    emptyMessage="Nenhum documento disponível."
                    renderItem={(r: any) => ({
                      item: r,
                      key: r.id,
                      title: r.title,
                      subtitle: `${r.type} · ${(r.fileSize / 1024).toFixed(0)} KB`,
                      actions: (
                        <a
                          href={`/api/rh/documentos/${r.id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--hr-primary)] border border-[var(--hr-border)] rounded hover:bg-[var(--hr-surface-muted)]"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Descarregar</span>
                        </a>
                      ),
                    })}
                  />
                </div>
              </div>
            )}

            {/* TAB: Carreira & Contratos */}
            {activeTab === 'contrato' && (
              <div className="space-y-5">
                <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-4 sm:p-5 shadow-[var(--hr-shadow-sm)]">
                  <h3 className="text-xs font-bold text-[var(--hr-text)] uppercase tracking-wider pb-2 mb-3 border-b border-[var(--hr-border-subtle)]">
                    Vínculo Contratual Actual
                  </h3>
                  <HrTable<any>
                    columns={[
                      { key: 'type', header: 'Modalidade' },
                      {
                        key: 'startDate',
                        header: 'Data de Início',
                        render: (r: any) => new Date(r.startDate).toLocaleDateString('pt-AO'),
                      },
                      {
                        key: 'endDate',
                        header: 'Data de Fim',
                        render: (r: any) => (r.endDate ? new Date(r.endDate).toLocaleDateString('pt-AO') : 'Sem termo certo'),
                      },
                      {
                        key: 'status',
                        header: 'Estado',
                        align: 'center',
                        render: (r: any) => <HrBadge variant="success" size="sm">{r.status}</HrBadge>,
                      },
                    ]}
                    data={employee.contracts || []}
                    keyExtractor={(r: any) => r.id}
                    emptyMessage="Nenhum contrato registado."
                  />
                </div>

                <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-4 sm:p-5 shadow-[var(--hr-shadow-sm)]">
                  <h3 className="text-xs font-bold text-[var(--hr-text)] uppercase tracking-wider pb-2 mb-3 border-b border-[var(--hr-border-subtle)]">
                    Histórico de Funções na J.Matos
                  </h3>
                  <HrTable<any>
                    columns={[
                      { key: 'position', header: 'Cargo', render: (r: any) => r.position?.title || 'Cargo inicial' },
                      { key: 'department', header: 'Departamento', render: (r: any) => r.department?.name || '—' },
                      {
                        key: 'startDate',
                        header: 'Período',
                        render: (r: any) => `${new Date(r.startDate).toLocaleDateString('pt-AO')} — ${r.endDate ? new Date(r.endDate).toLocaleDateString('pt-AO') : 'Presente'}`,
                      },
                    ]}
                    data={employee.careerHistory || []}
                    keyExtractor={(r: any) => r.id}
                    emptyMessage="Sem histórico de progressão anterior."
                  />
                </div>
              </div>
            )}

            {/* TAB: Segurança / Senha */}
            {activeTab === 'seguranca' && (
              <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-4 sm:p-5 shadow-[var(--hr-shadow-sm)] max-w-lg">
                <h3 className="text-sm font-bold text-[var(--hr-text)] mb-1">
                  Segurança da Conta
                </h3>
                <p className="text-xs text-[var(--hr-text-muted)] mb-4">
                  Actualize a sua palavra-passe de acesso ao Portal do Colaborador.
                </p>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  {passError && (
                    <div className="p-3 bg-[var(--hr-status-error-bg)] border border-[var(--hr-status-error)] rounded-[var(--hr-radius-sm)] text-xs text-[var(--hr-status-error)] font-medium">
                      {passError}
                    </div>
                  )}

                  <HrField label="Palavra-passe Actual" required>
                    <HrInput
                      type="password"
                      required
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      placeholder="••••••••••••"
                      leftIcon={<Lock className="w-4 h-4" />}
                    />
                  </HrField>

                  <HrField label="Nova Palavra-passe" required hint="Mínimo 8 caracteres">
                    <HrInput
                      type="password"
                      required
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="••••••••••••"
                      leftIcon={<KeyRound className="w-4 h-4" />}
                    />
                  </HrField>

                  <HrField label="Confirmar Nova Palavra-passe" required>
                    <HrInput
                      type="password"
                      required
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="••••••••••••"
                      leftIcon={<KeyRound className="w-4 h-4" />}
                    />
                  </HrField>

                  <div className="pt-2">
                    <HrButton
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={isSubmittingPass}
                    >
                      Actualizar Palavra-passe
                    </HrButton>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Fixed bottom with safe-area insets) */}
      <HrBottomNav
        items={navItems}
        activeId={activeTab}
        onChange={setActiveTab}
      />

      {/* First-access Change Password Modal */}
      <HrDialog
        isOpen={isChangingPass}
        onClose={() => {
          if (!user?.mustChangePassword) setIsChangingPass(false);
        }}
        title="Definir Nova Palavra-passe"
        description="Por favor, defina a sua nova palavra-passe pessoal e segura."
        maxWidth="sm"
      >
        <form onSubmit={handleChangePassword} className="space-y-4 py-1">
          {passError && (
            <div className="p-3 bg-[var(--hr-status-error-bg)] border border-[var(--hr-status-error)] rounded-[var(--hr-radius-sm)] text-xs text-[var(--hr-status-error)] font-medium">
              {passError}
            </div>
          )}

          <HrField label="Palavra-passe Actual / Temporária" required>
            <HrInput
              type="password"
              required
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="Senha atribuída"
            />
          </HrField>

          <HrField label="Nova Palavra-passe Pessoal" required hint="Mínimo 8 caracteres">
            <HrInput
              type="password"
              required
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="••••••••••••"
            />
          </HrField>

          <HrField label="Confirmar Nova Palavra-passe" required>
            <HrInput
              type="password"
              required
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="••••••••••••"
            />
          </HrField>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--hr-border)]">
            {!user?.mustChangePassword && (
              <HrButton variant="outline" size="sm" onClick={() => setIsChangingPass(false)}>
                Cancelar
              </HrButton>
            )}
            <HrButton type="submit" variant="primary" size="sm" isLoading={isSubmittingPass}>
              Guardar Senha
            </HrButton>
          </div>
        </form>
      </HrDialog>
    </div>
  );
}
