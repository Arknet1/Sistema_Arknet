'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  UserPlus,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  MapPin,
  Building2,
  ChevronRight,
  Filter,
  DollarSign,
  UserCheck,
} from 'lucide-react'
import {
  HrButton,
  HrBadge,
  HrDialog,
  HrInput,
  HrField,
  HrSelect,
  HrSkeleton,
  HrTabs,
} from '@/components/hr'
import { useHrToast } from '@/components/hr/hr-toast'

export default function RecrutamentoPage() {
  const toast = useHrToast()
  const [activeTab, setActiveTab] = useState('vagas')
  const [isLoading, setIsLoading] = useState(true)

  // Data states
  const [openings, setOpenings] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [positions, setPositions] = useState<any[]>([])

  // Modal states
  const [isNewOpeningOpen, setIsNewOpeningOpen] = useState(false)
  const [isNewCandidateOpen, setIsNewCandidateOpen] = useState(false)
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [openingForm, setOpeningForm] = useState({
    title: '',
    departmentId: '',
    positionId: '',
    type: 'FULL_TIME',
    location: 'Luanda',
    openingsCount: 1,
    requirements: '',
    salaryRangeMin: 150000,
    salaryRangeMax: 300000,
  })

  const [candidateForm, setCandidateForm] = useState({
    jobOpeningId: '',
    fullName: '',
    email: '',
    phone: '',
    biNumber: '',
    experienceYears: 2,
    resumeUrl: '',
    notes: '',
  })

  // Admission 1-Click Form
  const [admitForm, setAdmitForm] = useState({
    departmentId: '',
    positionId: '',
    employeeNumber: 'ARK-EMP-00',
    biNumber: '',
    birthDate: '1995-01-01',
    admissionDate: new Date().toISOString().split('T')[0],
    baseSalary: 250000,
    contractType: 'DETERMINADO',
    address: 'Luanda, Angola',
    bankName: 'BFA',
    bankIban: '',
    bankAccountNumber: '',
  })

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [openingsRes, candidatesRes, deptsRes, posRes] = await Promise.all([
        fetch('/api/rh/recrutamento/vagas'),
        fetch('/api/rh/recrutamento/candidatos'),
        fetch('/api/rh/departamentos'),
        fetch('/api/rh/cargos'),
      ])

      const [openingsData, candidatesData, deptsData, posData] = await Promise.all([
        openingsRes.json().catch(() => ({})),
        candidatesRes.json().catch(() => ({})),
        deptsRes.json().catch(() => ({})),
        posRes.json().catch(() => ({})),
      ])

      if (openingsData.success) {
        setOpenings(openingsData.openings || [])
        if (openingsData.openings?.length > 0 && !candidateForm.jobOpeningId) {
          setCandidateForm((p) => ({ ...p, jobOpeningId: openingsData.openings[0].id }))
        }
      }
      if (candidatesData.success) setCandidates(candidatesData.candidates || [])
      if (deptsData.success) {
        setDepartments(deptsData.departments || [])
        if (deptsData.departments?.length > 0 && !openingForm.departmentId) {
          setOpeningForm((p) => ({ ...p, departmentId: deptsData.departments[0].id }))
          setAdmitForm((p) => ({ ...p, departmentId: deptsData.departments[0].id }))
        }
      }
      if (posData.success) {
        setPositions(posData.positions || [])
        if (posData.positions?.length > 0 && !openingForm.positionId) {
          setOpeningForm((p) => ({ ...p, positionId: posData.positions[0].id }))
          setAdmitForm((p) => ({ ...p, positionId: posData.positions[0].id }))
        }
      }
    } catch {
      toast.error('Erro de ligação ao carregar dados de recrutamento.')
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Handlers
  const handleCreateOpening = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!openingForm.title) {
      toast.error('O título da vaga é obrigatório.')
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/rh/recrutamento/vagas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(openingForm),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Vaga de emprego aberta com sucesso!')
        setIsNewOpeningOpen(false)
        loadData()
      } else {
        toast.error(data.error || 'Erro ao criar vaga.')
      }
    } catch {
      toast.error('Erro de ligação ao criar vaga.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!candidateForm.fullName || !candidateForm.email || !candidateForm.phone) {
      toast.error('Preencha os campos obrigatórios do candidato.')
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/rh/recrutamento/candidatos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidateForm),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Candidato registado com sucesso no pipeline!')
        setIsNewCandidateOpen(false)
        loadData()
      } else {
        toast.error(data.error || 'Erro ao registar candidato.')
      }
    } catch {
      toast.error('Erro de ligação ao registar candidato.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateStatus = async (candidateId: string, status: string) => {
    try {
      const res = await fetch('/api/rh/recrutamento/candidatos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, status }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Estado do candidato actualizado para "${status}".`)
        loadData()
      } else {
        toast.error(data.error || 'Erro ao actualizar estado.')
      }
    } catch {
      toast.error('Erro de ligação ao actualizar estado.')
    }
  }

  const handleOpenAdmit = (cand: any) => {
    setSelectedCandidate(cand)
    const nextSeq = String(candidates.length + 10).padStart(3, '0')
    setAdmitForm((p) => ({
      ...p,
      employeeNumber: `ARK-EMP-${nextSeq}`,
      biNumber: cand.biNumber || '',
    }))
    setIsAdmitModalOpen(true)
  }

  const handleAdmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!admitForm.employeeNumber || !admitForm.biNumber || !admitForm.baseSalary) {
      toast.error('Preencha todos os campos contratuais obrigatórios.')
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/rh/recrutamento/candidatos/${selectedCandidate.id}/admitir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(admitForm),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(
          `Candidato admitido com sucesso! Ficha ${data.employee?.employeeNumber} criada no sistema.`
        )
        setIsAdmitModalOpen(false)
        loadData()
      } else {
        toast.error(data.error || 'Erro ao admitir candidato.')
      }
    } catch {
      toast.error('Erro de ligação ao admitir candidato.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const tabs = [
    { id: 'vagas', label: 'Vagas & Processos Abertos', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'candidatos', label: 'Pipeline de Candidatos', icon: <Users className="w-4 h-4" /> },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--hr-text)] flex items-center gap-2.5">
            <UserPlus className="w-6 h-6 text-[var(--hr-primary)]" />
            Recrutamento & Admissão Integrada (ATS)
          </h1>
          <p className="text-xs sm:text-sm text-[var(--hr-text-muted)] mt-1">
            Gestão de vagas, triagem de talentos técnicos e admissão 1-clique com criação automática de contrato.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'vagas' && (
            <HrButton variant="primary" size="sm" onClick={() => setIsNewOpeningOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Abrir Nova Vaga
            </HrButton>
          )}
          {activeTab === 'candidatos' && (
            <HrButton variant="primary" size="sm" onClick={() => setIsNewCandidateOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Registar Candidato
            </HrButton>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)]">
          <div className="text-xs text-[var(--hr-text-muted)]">Vagas Activas</div>
          <div className="text-2xl font-bold text-[var(--hr-text)] mt-1">{openings.length}</div>
        </div>
        <div className="p-4 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)]">
          <div className="text-xs text-[var(--hr-text-muted)]">Total Candidatos</div>
          <div className="text-2xl font-bold text-[var(--hr-primary)] mt-1">{candidates.length}</div>
        </div>
        <div className="p-4 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)]">
          <div className="text-xs text-[var(--hr-text-muted)]">Em Entrevista</div>
          <div className="text-2xl font-bold text-[var(--hr-status-warning)] mt-1">
            {candidates.filter((c) => c.status === 'ENTREVISTA').length}
          </div>
        </div>
        <div className="p-4 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)]">
          <div className="text-xs text-[var(--hr-text-muted)]">Admitidos (Contratados)</div>
          <div className="text-2xl font-bold text-[var(--hr-status-success)] mt-1">
            {candidates.filter((c) => c.status === 'ADMITIDO').length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <HrTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: Vagas Abertas */}
      {activeTab === 'vagas' && (
        <div className="space-y-4">
          {isLoading ? (
            <HrSkeleton className="h-48 w-full" />
          ) : openings.length === 0 ? (
            <div className="p-8 text-center bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)]">
              <Briefcase className="w-8 h-8 text-[var(--hr-text-muted)] mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[var(--hr-text)]">Nenhuma vaga aberta no momento</h3>
              <p className="text-xs text-[var(--hr-text-muted)] mt-1">
                Crie novas oportunidades de emprego para equipas técnicas de fibra óptica, engenharia ou suporte.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {openings.map((op) => (
                <div
                  key={op.id}
                  className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-5 shadow-[var(--hr-shadow-sm)] flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-bold text-[var(--hr-text)] leading-snug">{op.title}</h3>
                      <HrBadge variant={op.status === 'ABERTA' ? 'success' : 'neutral'} size="sm">
                        {op.status}
                      </HrBadge>
                    </div>
                    <div className="text-xs text-[var(--hr-text-muted)] flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-[var(--hr-primary)]" />
                      <span>{op.department?.name || 'Geral'}</span>
                      <span>·</span>
                      <MapPin className="w-3.5 h-3.5 text-[var(--hr-primary)]" />
                      <span>{op.location}</span>
                    </div>
                    {op.requirements && (
                      <p className="text-xs text-[var(--hr-text-muted)] line-clamp-2 mt-1">
                        {op.requirements}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[var(--hr-border)] flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--hr-text)]">
                      {op._count?.candidates || 0} Candidatura(s)
                    </span>
                    <HrBadge variant="info" size="sm">
                      {op.type === 'FULL_TIME' ? 'Tempo Inteiro' : op.type}
                    </HrBadge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Pipeline de Candidatos */}
      {activeTab === 'candidatos' && (
        <div className="space-y-4">
          <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-5 shadow-[var(--hr-shadow-sm)]">
            <h3 className="text-sm font-bold text-[var(--hr-text)] mb-3">
              Candidaturas Submetidas & Gestão de Fases
            </h3>
            {candidates.length === 0 ? (
              <p className="text-xs text-[var(--hr-text-muted)] py-4 text-center">
                Nenhum candidato registado até ao momento.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[var(--hr-border)] text-[var(--hr-text-muted)]">
                      <th className="py-2.5 px-3">Candidato</th>
                      <th className="py-2.5 px-3">Contacto</th>
                      <th className="py-2.5 px-3">Vaga Alvo</th>
                      <th className="py-2.5 px-3">Experiência</th>
                      <th className="py-2.5 px-3">Fase Actual</th>
                      <th className="py-2.5 px-3 text-right">Admissão / Acção</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--hr-border)]">
                    {candidates.map((cand) => (
                      <tr key={cand.id} className="hover:bg-[var(--hr-hover)] transition">
                        <td className="py-3 px-3 font-semibold text-[var(--hr-text)]">
                          {cand.fullName}
                          {cand.biNumber && (
                            <div className="text-[11px] font-mono text-[var(--hr-text-muted)]">
                              BI: {cand.biNumber}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-[var(--hr-text-muted)]">
                          <div>{cand.email}</div>
                          <div className="font-mono text-[11px]">{cand.phone}</div>
                        </td>
                        <td className="py-3 px-3 font-medium text-[var(--hr-text)]">
                          {cand.jobOpening?.title || 'Candidatura Espontânea'}
                        </td>
                        <td className="py-3 px-3 text-[var(--hr-text-muted)]">
                          {cand.experienceYears ? `${cand.experienceYears} ano(s)` : 'N/D'}
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={cand.status}
                            disabled={cand.status === 'ADMITIDO'}
                            onChange={(e) => handleUpdateStatus(cand.id, e.target.value)}
                            className="bg-[var(--hr-bg)] border border-[var(--hr-border)] rounded px-2 py-1 text-xs font-semibold"
                          >
                            <option value="NOVO">Novo</option>
                            <option value="TRIAGEM">Triagem</option>
                            <option value="ENTREVISTA">Entrevista</option>
                            <option value="PROPOSTA">Proposta</option>
                            <option value="ADMITIDO">Admitido</option>
                            <option value="REJEITADO">Rejeitado</option>
                          </select>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {cand.status === 'ADMITIDO' ? (
                            <HrBadge variant="success" size="sm">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Contratado
                            </HrBadge>
                          ) : (
                            <HrButton
                              variant="primary"
                              size="sm"
                              onClick={() => handleOpenAdmit(cand)}
                            >
                              <UserCheck className="w-3.5 h-3.5 mr-1" />
                              Admitir (1-Clique)
                            </HrButton>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Nova Vaga */}
      <HrDialog
        isOpen={isNewOpeningOpen}
        onClose={() => setIsNewOpeningOpen(false)}
        title="Abrir Nova Vaga de Emprego"
        description="Publique uma vaga para recrutamento e selecção interna ou externa."
        maxWidth="md"
      >
        <form onSubmit={handleCreateOpening} className="space-y-4 pt-2">
          <HrField label="Título da Função / Vaga" required>
            <HrInput
              type="text"
              required
              placeholder="Ex: Técnico de Instalação e Redes de Fibra Óptica"
              value={openingForm.title}
              onChange={(e) => setOpeningForm((p) => ({ ...p, title: e.target.value }))}
            />
          </HrField>

          <div className="grid grid-cols-2 gap-3">
            <HrField label="Departamento">
              <HrSelect
                value={openingForm.departmentId}
                onChange={(e) => setOpeningForm((p) => ({ ...p, departmentId: e.target.value }))}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </HrSelect>
            </HrField>
            <HrField label="Cargo Associado">
              <HrSelect
                value={openingForm.positionId}
                onChange={(e) => setOpeningForm((p) => ({ ...p, positionId: e.target.value }))}
              >
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </HrSelect>
            </HrField>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <HrField label="Regime">
              <HrSelect
                value={openingForm.type}
                onChange={(e) => setOpeningForm((p) => ({ ...p, type: e.target.value }))}
              >
                <option value="FULL_TIME">Tempo Inteiro</option>
                <option value="TEMPORARIO">Determinado</option>
                <option value="ESTAGIO">Estágio Profissional</option>
              </HrSelect>
            </HrField>
            <HrField label="Localidade">
              <HrInput
                type="text"
                value={openingForm.location}
                onChange={(e) => setOpeningForm((p) => ({ ...p, location: e.target.value }))}
              />
            </HrField>
            <HrField label="N.º de Vagas">
              <HrInput
                type="number"
                min="1"
                value={openingForm.openingsCount}
                onChange={(e) => setOpeningForm((p) => ({ ...p, openingsCount: Number(e.target.value) }))}
              />
            </HrField>
          </div>

          <HrField label="Requisitos Técnicos e Perfil Desejado">
            <HrInput
              type="text"
              placeholder="Ex: Carta de condução ligeiro, experiência em telecomunicações..."
              value={openingForm.requirements}
              onChange={(e) => setOpeningForm((p) => ({ ...p, requirements: e.target.value }))}
            />
          </HrField>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--hr-border)]">
            <HrButton type="button" variant="outline" size="sm" onClick={() => setIsNewOpeningOpen(false)}>
              Cancelar
            </HrButton>
            <HrButton type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Publicar Vaga
            </HrButton>
          </div>
        </form>
      </HrDialog>

      {/* MODAL: Registar Candidato */}
      <HrDialog
        isOpen={isNewCandidateOpen}
        onClose={() => setIsNewCandidateOpen(false)}
        title="Registar Candidato no Pipeline"
        description="Introduza os dados cadastrais da candidatura recebida."
        maxWidth="md"
      >
        <form onSubmit={handleCreateCandidate} className="space-y-4 pt-2">
          <HrField label="Vaga Alvo">
            <HrSelect
              value={candidateForm.jobOpeningId}
              onChange={(e) => setCandidateForm((p) => ({ ...p, jobOpeningId: e.target.value }))}
            >
              {openings.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.title}
                </option>
              ))}
            </HrSelect>
          </HrField>

          <HrField label="Nome Completo do Candidato" required>
            <HrInput
              type="text"
              required
              value={candidateForm.fullName}
              onChange={(e) => setCandidateForm((p) => ({ ...p, fullName: e.target.value }))}
            />
          </HrField>

          <div className="grid grid-cols-2 gap-3">
            <HrField label="E-mail" required>
              <HrInput
                type="email"
                required
                value={candidateForm.email}
                onChange={(e) => setCandidateForm((p) => ({ ...p, email: e.target.value }))}
              />
            </HrField>
            <HrField label="Telefone / WhatsApp" required>
              <HrInput
                type="tel"
                required
                placeholder="+244 9..."
                value={candidateForm.phone}
                onChange={(e) => setCandidateForm((p) => ({ ...p, phone: e.target.value }))}
              />
            </HrField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <HrField label="Bilhete de Identidade (BI)">
              <HrInput
                type="text"
                placeholder="Ex: 007293812LA041"
                value={candidateForm.biNumber}
                onChange={(e) => setCandidateForm((p) => ({ ...p, biNumber: e.target.value }))}
              />
            </HrField>
            <HrField label="Anos de Experiência">
              <HrInput
                type="number"
                value={candidateForm.experienceYears}
                onChange={(e) => setCandidateForm((p) => ({ ...p, experienceYears: Number(e.target.value) }))}
              />
            </HrField>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--hr-border)]">
            <HrButton type="button" variant="outline" size="sm" onClick={() => setIsNewCandidateOpen(false)}>
              Cancelar
            </HrButton>
            <HrButton type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Registar Candidato
            </HrButton>
          </div>
        </form>
      </HrDialog>

      {/* MODAL: Admissão 1-Clique */}
      <HrDialog
        isOpen={isAdmitModalOpen}
        onClose={() => setIsAdmitModalOpen(false)}
        title={`Admitir Candidato — ${selectedCandidate?.fullName}`}
        description="Formalize a contratação. Será criada a ficha cadastral do colaborador e o contrato inicial de trabalho na mesma transacção segura."
        maxWidth="lg"
      >
        <form onSubmit={handleAdmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <HrField label="N.º Mecanográfico (Funcionário)" required>
              <HrInput
                type="text"
                required
                value={admitForm.employeeNumber}
                onChange={(e) => setAdmitForm((p) => ({ ...p, employeeNumber: e.target.value }))}
              />
            </HrField>
            <HrField label="Bilhete de Identidade (BI)" required>
              <HrInput
                type="text"
                required
                value={admitForm.biNumber}
                onChange={(e) => setAdmitForm((p) => ({ ...p, biNumber: e.target.value }))}
              />
            </HrField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <HrField label="Departamento" required>
              <HrSelect
                value={admitForm.departmentId}
                onChange={(e) => setAdmitForm((p) => ({ ...p, departmentId: e.target.value }))}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </HrSelect>
            </HrField>
            <HrField label="Cargo Efectivo" required>
              <HrSelect
                value={admitForm.positionId}
                onChange={(e) => setAdmitForm((p) => ({ ...p, positionId: e.target.value }))}
              >
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </HrSelect>
            </HrField>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <HrField label="Data de Nascimento" required>
              <HrInput
                type="date"
                required
                value={admitForm.birthDate}
                onChange={(e) => setAdmitForm((p) => ({ ...p, birthDate: e.target.value }))}
              />
            </HrField>
            <HrField label="Data de Admissão" required>
              <HrInput
                type="date"
                required
                value={admitForm.admissionDate}
                onChange={(e) => setAdmitForm((p) => ({ ...p, admissionDate: e.target.value }))}
              />
            </HrField>
            <HrField label="Salário Base Mensal (Kz)" required>
              <HrInput
                type="number"
                required
                value={admitForm.baseSalary}
                onChange={(e) => setAdmitForm((p) => ({ ...p, baseSalary: Number(e.target.value) }))}
              />
            </HrField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <HrField label="Tipo de Contrato" required>
              <HrSelect
                value={admitForm.contractType}
                onChange={(e) => setAdmitForm((p) => ({ ...p, contractType: e.target.value }))}
              >
                <option value="DETERMINADO">A Prazo Determinado</option>
                <option value="INDETERMINADO">Por Tempo Indeterminado</option>
                <option value="ESTAGIO">Estágio Profissional</option>
              </HrSelect>
            </HrField>
            <HrField label="Banco de Pagamento">
              <HrSelect
                value={admitForm.bankName}
                onChange={(e) => setAdmitForm((p) => ({ ...p, bankName: e.target.value }))}
              >
                <option value="BFA">Banco de Fomento Angola (BFA)</option>
                <option value="BAI">Banco Angolano de Investimentos (BAI)</option>
                <option value="BIC">Banco BIC</option>
                <option value="ATLANTICO">Banco Millennium Atlântico</option>
                <option value="STANDARD">Standard Bank Angola</option>
              </HrSelect>
            </HrField>
          </div>

          <HrField label="Morada de Residência" required>
            <HrInput
              type="text"
              required
              value={admitForm.address}
              onChange={(e) => setAdmitForm((p) => ({ ...p, address: e.target.value }))}
            />
          </HrField>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--hr-border)]">
            <HrButton type="button" variant="outline" size="sm" onClick={() => setIsAdmitModalOpen(false)}>
              Cancelar
            </HrButton>
            <HrButton type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Confirmar Admissão e Gerar Contrato
            </HrButton>
          </div>
        </form>
      </HrDialog>
    </div>
  )
}
