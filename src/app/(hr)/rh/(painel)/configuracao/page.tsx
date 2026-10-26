'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  MapPin,
  CalendarDays,
  FileText,
  Plus,
  Sliders,
  CheckCircle2,
  Trash2,
  Edit2,
  Globe,
  Clock,
  Shield,
} from 'lucide-react';
import {
  HrPageHeader,
  HrButton,
  HrBadge,
  HrTable,
  HrDialog,
  HrInput,
  HrField,
  HrSelect,
  HrTabs,
} from '@/components/hr';
import { useHrToast } from '@/components/hr/hr-toast';

export default function RhConfiguracaoPage() {
  const toast = useHrToast();

  const [activeTab, setActiveTab] = useState('locais');
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [locations, setLocations] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);

  // Modal Locais
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationForm, setLocationForm] = useState({
    name: '',
    latitude: '-8.8271',
    longitude: '13.2439',
    radiusMeters: '150',
    verificationMode: 'INFORMATIVO',
  });

  // Modal Tipos de Licença
  const [isLeaveTypeModalOpen, setIsLeaveTypeModalOpen] = useState(false);
  const [leaveTypeForm, setLeaveTypeForm] = useState({
    code: '',
    name: '',
    isPaid: true,
    deductsFromBalance: false,
    requiresDocument: false,
    maxDays: '',
  });

  // Modal Feriados
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [holidayForm, setHolidayForm] = useState({
    date: '2026-01-01',
    name: '',
    isRecurring: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [locRes, typesRes, holRes] = await Promise.all([
        fetch('/api/rh/configuracao/locais'),
        fetch('/api/rh/configuracao/tipos-licenca'),
        fetch('/api/rh/configuracao/feriados'),
      ]);

      const [locData, typesData, holData] = await Promise.all([
        locRes.json().catch(() => ({})),
        typesRes.json().catch(() => ({})),
        holRes.json().catch(() => ({})),
      ]);

      if (locData.success) setLocations(locData.locations || []);
      if (typesData.success) setLeaveTypes(typesData.leaveTypes || []);
      if (holData.success) setHolidays(holData.holidays || []);
    } catch {
      toast.error('Erro ao carregar dados de configuração');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create Location
  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationForm.name.trim()) {
      toast.error('O nome do local é obrigatório');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/rh/configuracao/locais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: locationForm.name.trim(),
          latitude: parseFloat(locationForm.latitude),
          longitude: parseFloat(locationForm.longitude),
          radiusMeters: parseFloat(locationForm.radiusMeters),
          verificationMode: locationForm.verificationMode,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Local de trabalho criado com sucesso');
        setIsLocationModalOpen(false);
        setLocationForm({
          name: '',
          latitude: '-8.8271',
          longitude: '13.2439',
          radiusMeters: '150',
          verificationMode: 'INFORMATIVO',
        });
        loadData();
      } else {
        toast.error(data.error || 'Erro ao criar local');
      }
    } catch {
      toast.error('Erro de ligação ao servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create Leave Type
  const handleLeaveTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveTypeForm.code.trim() || !leaveTypeForm.name.trim()) {
      toast.error('Preencha o código e o nome do tipo de licença');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/rh/configuracao/tipos-licenca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: leaveTypeForm.code.trim().toUpperCase(),
          name: leaveTypeForm.name.trim(),
          isPaid: leaveTypeForm.isPaid,
          deductsFromBalance: leaveTypeForm.deductsFromBalance,
          requiresDocument: leaveTypeForm.requiresDocument,
          maxDays: leaveTypeForm.maxDays ? parseInt(leaveTypeForm.maxDays, 10) : null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Tipo de licença criado com sucesso');
        setIsLeaveTypeModalOpen(false);
        setLeaveTypeForm({
          code: '',
          name: '',
          isPaid: true,
          deductsFromBalance: false,
          requiresDocument: false,
          maxDays: '',
        });
        loadData();
      } else {
        toast.error(data.error || 'Erro ao criar tipo de licença');
      }
    } catch {
      toast.error('Erro de ligação ao servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create Holiday
  const handleHolidaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayForm.name.trim() || !holidayForm.date) {
      toast.error('Preencha a data e o nome do feriado');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/rh/configuracao/feriados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: holidayForm.date,
          name: holidayForm.name.trim(),
          isRecurring: holidayForm.isRecurring,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Feriado adicionado com sucesso');
        setIsHolidayModalOpen(false);
        setHolidayForm({
          date: '2026-01-01',
          name: '',
          isRecurring: true,
        });
        loadData();
      } else {
        toast.error(data.error || 'Erro ao adicionar feriado');
      }
    } catch {
      toast.error('Erro de ligação ao servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'locais', label: 'Locais & Geofencing', badge: String(locations.length) },
    { id: 'licencas', label: 'Tipos de Licença (LGT)', badge: String(leaveTypes.length) },
    { id: 'feriados', label: 'Feriados Angola', badge: String(holidays.length) },
    { id: 'parametros', label: 'Parâmetros Gerais' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <HrPageHeader
        title="Configurações de RH"
        subtitle="Gestão de perímetros de geofencing, catálogo de licenças regulamentares e feriados angolanos."
      />

      {/* Tabs */}
      <HrTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Locais & Geofencing */}
      {activeTab === 'locais' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-[var(--hr-text-muted)]">
              Perímetros geográficos autorizados para picagem de ponto com validação por GPS.
            </p>
            <HrButton
              size="sm"
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsLocationModalOpen(true)}
            >
              Novo Local de Trabalho
            </HrButton>
          </div>

          <HrTable<any>
            columns={[
              {
                key: 'name',
                header: 'Localização',
                render: (row: any) => (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[var(--hr-primary)]" />
                    <div>
                      <div className="font-semibold text-xs text-[var(--hr-text)]">{row.name}</div>
                      <div className="text-[11px] text-[var(--hr-text-muted)] font-mono">
                        {row.latitude.toFixed(4)}, {row.longitude.toFixed(4)}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'radius',
                header: 'Raio Permitido',
                render: (row: any) => (
                  <span className="font-medium text-xs text-[var(--hr-text)]">{row.radiusMeters} metros</span>
                ),
              },
              {
                key: 'mode',
                header: 'Modo de Validação',
                render: (row: any) =>
                  row.verificationMode === 'BLOQUEANTE' ? (
                    <HrBadge variant="error">Bloqueante</HrBadge>
                  ) : (
                    <HrBadge variant="success">Informativo</HrBadge>
                  ),
              },
              {
                key: 'status',
                header: 'Estado',
                render: (row: any) => (
                  <HrBadge variant={row.active ? 'success' : 'neutral'}>
                    {row.active ? 'Ativo' : 'Inativo'}
                  </HrBadge>
                ),
              },
            ]}
            data={locations}
            keyExtractor={(item: any) => item.id}
            emptyMessage="Nenhum local de trabalho configurado."
          />
        </div>
      )}

      {/* Tab 2: Tipos de Licença */}
      {activeTab === 'licencas' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-[var(--hr-text-muted)]">
              Catálogo de ausências segundo a Lei Geral do Trabalho de Angola.
            </p>
            <HrButton
              size="sm"
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsLeaveTypeModalOpen(true)}
            >
              Novo Tipo de Licença
            </HrButton>
          </div>

          <HrTable<any>
            columns={[
              {
                key: 'code',
                header: 'Código',
                render: (row: any) => <code className="font-mono text-xs">{row.code}</code>,
              },
              {
                key: 'name',
                header: 'Designação',
                render: (row: any) => (
                  <div className="font-medium text-xs text-[var(--hr-text)]">{row.name}</div>
                ),
              },
              {
                key: 'remunerada',
                header: 'Remunerada',
                render: (row: any) => (
                  <HrBadge variant={row.isPaid ? 'success' : 'neutral'}>
                    {row.isPaid ? 'Sim' : 'Não'}
                  </HrBadge>
                ),
              },
              {
                key: 'deduz',
                header: 'Deduz Saldo de Férias',
                render: (row: any) => (
                  <HrBadge variant={row.deductsFromBalance ? 'warning' : 'neutral'}>
                    {row.deductsFromBalance ? 'Sim' : 'Não'}
                  </HrBadge>
                ),
              },
              {
                key: 'comprovativo',
                header: 'Exige Comprovativo',
                render: (row: any) => (
                  <span className="text-xs text-[var(--hr-text-muted)]">
                    {row.requiresDocument ? 'Sim' : 'Não'}
                  </span>
                ),
              },
            ]}
            data={leaveTypes}
            keyExtractor={(item: any) => item.id}
            emptyMessage="Nenhum tipo de licença configurado."
          />
        </div>
      )}

      {/* Tab 3: Feriados Angola */}
      {activeTab === 'feriados' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-[var(--hr-text-muted)]">
              Feriados oficiais de Angola aplicados automaticamente nas rotinas de ponto e férias.
            </p>
            <HrButton
              size="sm"
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsHolidayModalOpen(true)}
            >
              Adicionar Feriado
            </HrButton>
          </div>

          <HrTable<any>
            columns={[
              {
                key: 'date',
                header: 'Data (AAAA-MM-DD)',
                render: (row: any) => <code className="font-mono text-xs font-semibold">{row.date}</code>,
              },
              {
                key: 'name',
                header: 'Celebração Oficial',
                render: (row: any) => (
                  <div className="font-medium text-xs text-[var(--hr-text)]">{row.name}</div>
                ),
              },
              {
                key: 'recurring',
                header: 'Tipo',
                render: (row: any) => (
                  <HrBadge variant="neutral">
                    {row.isRecurring ? 'Anual Fixo' : 'Móvel'}
                  </HrBadge>
                ),
              },
              {
                key: 'status',
                header: 'Confirmação',
                render: (row: any) => <HrBadge variant="success">{row.status}</HrBadge>,
              },
            ]}
            data={holidays}
            keyExtractor={(item: any) => item.id}
            emptyMessage="Nenhum feriado registado."
          />
        </div>
      )}

      {/* Tab 4: Parâmetros Gerais */}
      {activeTab === 'parametros' && (
        <div className="space-y-4 max-w-2xl">
          <div className="p-4 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--hr-text)] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--hr-primary)]" /> Regras Globais de Assiduidade e Ponto
            </h3>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center justify-between p-3 bg-[var(--hr-bg)] border border-[var(--hr-border)] rounded-[var(--hr-radius-sm)]">
                <div>
                  <div className="font-semibold text-[var(--hr-text)]">Tolerância de Pontualidade</div>
                  <div className="text-[11px] text-[var(--hr-text-muted)]">
                    Período em que a entrada não conta como atraso injustificado.
                  </div>
                </div>
                <span className="font-bold text-sm text-[var(--hr-primary)]">10 Minutos</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[var(--hr-bg)] border border-[var(--hr-border)] rounded-[var(--hr-radius-sm)]">
                <div>
                  <div className="font-semibold text-[var(--hr-text)]">Regra de Arredondamento</div>
                  <div className="text-[11px] text-[var(--hr-text-muted)]">
                    Modo de cálculo para horas no fecho do dia.
                  </div>
                </div>
                <span className="font-bold text-sm text-[var(--hr-text)]">Ao minuto exato (0 min)</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[var(--hr-bg)] border border-[var(--hr-border)] rounded-[var(--hr-radius-sm)]">
                <div>
                  <div className="font-semibold text-[var(--hr-text)]">Retenção de Coordenadas GPS</div>
                  <div className="text-[11px] text-[var(--hr-text-muted)]">
                    Limpeza periódica de metadados de localização em conformidade com privacidade.
                  </div>
                </div>
                <span className="font-bold text-sm text-[var(--hr-text)]">12 Meses</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[var(--hr-bg)] border border-[var(--hr-border)] rounded-[var(--hr-radius-sm)]">
                <div>
                  <div className="font-semibold text-[var(--hr-text)]">Direito Anual a Férias (Base Legal)</div>
                  <div className="text-[11px] text-[var(--hr-text-muted)]">
                    Dias úteis atribuídos no dia 1 de Janeiro de cada ano (Art. 132.º LGT).
                  </div>
                </div>
                <span className="font-bold text-sm text-[var(--hr-status-success)]">22 Dias Úteis</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Novo Local */}
      <HrDialog
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        title="Novo Local de Trabalho (Geofencing)"
        description="Defina as coordenadas geográficas e raio de tolerância para picagem de ponto."
      >
        <form onSubmit={handleLocationSubmit} className="space-y-4 pt-2">
          <HrField label="Nome do Local / Polo" required>
            <HrInput
              value={locationForm.name}
              onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
              placeholder="Ex: Sede Talatona, Armazém Viana..."
            />
          </HrField>

          <div className="grid grid-cols-2 gap-3">
            <HrField label="Latitude" required>
              <HrInput
                value={locationForm.latitude}
                onChange={(e) => setLocationForm({ ...locationForm, latitude: e.target.value })}
                placeholder="-8.8271"
              />
            </HrField>

            <HrField label="Longitude" required>
              <HrInput
                value={locationForm.longitude}
                onChange={(e) => setLocationForm({ ...locationForm, longitude: e.target.value })}
                placeholder="13.2439"
              />
            </HrField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <HrField label="Raio Permitido (Metros)" required>
              <HrInput
                type="number"
                value={locationForm.radiusMeters}
                onChange={(e) => setLocationForm({ ...locationForm, radiusMeters: e.target.value })}
              />
            </HrField>

            <HrField label="Modo de Validação" required>
              <HrSelect
                value={locationForm.verificationMode}
                onChange={(e) => setLocationForm({ ...locationForm, verificationMode: e.target.value })}
                options={[
                  { value: 'INFORMATIVO', label: 'Informativo (Alerta na auditoria)' },
                  { value: 'BLOQUEANTE', label: 'Bloqueante (Rejeita fora do raio)' },
                ]}
              />
            </HrField>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <HrButton
              type="button"
              variant="outline"
              onClick={() => setIsLocationModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </HrButton>
            <HrButton type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Gravando...' : 'Gravar Local'}
            </HrButton>
          </div>
        </form>
      </HrDialog>

      {/* Modal: Novo Tipo de Licença */}
      <HrDialog
        isOpen={isLeaveTypeModalOpen}
        onClose={() => setIsLeaveTypeModalOpen(false)}
        title="Novo Tipo de Licença"
        description="Adicione uma categoria de ausência segundo a legislação ou política interna."
      >
        <form onSubmit={handleLeaveTypeSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <HrField label="Código Único" required>
              <HrInput
                value={leaveTypeForm.code}
                onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, code: e.target.value })}
                placeholder="Ex: ESTUDOS, LUTO"
              />
            </HrField>

            <HrField label="Designação" required>
              <HrInput
                value={leaveTypeForm.name}
                onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, name: e.target.value })}
                placeholder="Ex: Dispensa para Exames"
              />
            </HrField>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer p-2 bg-[var(--hr-bg)] border border-[var(--hr-border)] rounded-[var(--hr-radius-sm)]">
              <input
                type="checkbox"
                checked={leaveTypeForm.isPaid}
                onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, isPaid: e.target.checked })}
              />
              <span className="font-medium text-[var(--hr-text)]">Remunerada</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-2 bg-[var(--hr-bg)] border border-[var(--hr-border)] rounded-[var(--hr-radius-sm)]">
              <input
                type="checkbox"
                checked={leaveTypeForm.deductsFromBalance}
                onChange={(e) =>
                  setLeaveTypeForm({ ...leaveTypeForm, deductsFromBalance: e.target.checked })
                }
              />
              <span className="font-medium text-[var(--hr-text)]">Deduz Saldo de Férias</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <HrButton
              type="button"
              variant="outline"
              onClick={() => setIsLeaveTypeModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </HrButton>
            <HrButton type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Gravando...' : 'Gravar Licença'}
            </HrButton>
          </div>
        </form>
      </HrDialog>

      {/* Modal: Novo Feriado */}
      <HrDialog
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        title="Novo Feriado Oficial"
        description="Registe uma data comemorativa nacional para Angola."
      >
        <form onSubmit={handleHolidaySubmit} className="space-y-4 pt-2">
          <HrField label="Data" required>
            <HrInput
              type="date"
              value={holidayForm.date}
              onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
            />
          </HrField>

          <HrField label="Nome da Celebração" required>
            <HrInput
              value={holidayForm.name}
              onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
              placeholder="Ex: Dia da Paz e da Reconciliação Nacional"
            />
          </HrField>

          <div className="flex justify-end gap-2 pt-2">
            <HrButton
              type="button"
              variant="outline"
              onClick={() => setIsHolidayModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </HrButton>
            <HrButton type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Gravando...' : 'Gravar Feriado'}
            </HrButton>
          </div>
        </form>
      </HrDialog>
    </div>
  );
}
