'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Award,
  GraduationCap,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Star,
  Users,
  Calendar,
  Building2,
  ChevronRight,
  Shield,
  Search,
} from 'lucide-react'
import {
  HrButton,
  HrBadge,
  HrTable,
  HrDialog,
  HrInput,
  HrField,
  HrSelect,
  HrSkeleton,
  HrTabs,
} from '@/components/hr'
import { useHrToast } from '@/components/hr/hr-toast'

export default function DesempenhoPage() {
  const toast = useHrToast()
  const [activeTab, setActiveTab] = useState('ciclos')
  const [isLoading, setIsLoading] = useState(true)

  // Data states
  const [cycles, setCycles] = useState<any[]>([])
  const [selectedCycle, setSelectedCycle] = useState<any | null>(null)
  const [certifications, setCertifications] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])

  // Modal states
  const [isNewCycleOpen, setIsNewCycleOpen] = useState(false)
  const [isNewCertOpen, setIsNewCertOpen] = useState(false)
  const [isNewCourseOpen, setIsNewCourseOpen] = useState(false)
  const [isReviewDetailOpen, setIsReviewDetailOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<any | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [cycleForm, setCycleForm] = useState({
    title: 'Avaliação de Desempenho 2026',
    year: 2026,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    notes: 'Ciclo anual de avaliação por competências e cumprimento de objectivos.',
  })

  const [certForm, setCertForm] = useState({
    employeeId: '',
    title: '',
    issuingEntity: '',
    licenseNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    notes: '',
  })

  const [courseForm, setCourseForm] = useState({
    title: '',
    provider: '',
    durationHours: 16,
    category: 'TECNICA',
    startDate: new Date().toISOString().split('T')[0],
    location: 'Sede ARKNET Luanda',
    notes: '',
  })

  // Review evaluation form (RH / Chefia)
  const [evalForm, setEvalForm] = useState({
    managerRating: 4.0,
    objectivesRating: 4.0,
    competenciesRating: 4.0,
    managerComments: '',
    strengths: '',
    areasToImprove: '',
    developmentPlan: '',
  })

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [cyclesRes, certsRes, coursesRes, empRes] = await Promise.all([
        fetch('/api/rh/desempenho/ciclos'),
        fetch('/api/rh/formacao/certificacoes'),
        fetch('/api/rh/formacao/cursos'),
        fetch('/api/rh/funcionarios'),
      ])

      const [cyclesData, certsData, coursesData, empData] = await Promise.all([
        cyclesRes.json().catch(() => ({})),
        certsRes.json().catch(() => ({})),
        coursesRes.json().catch(() => ({})),
        empRes.json().catch(() => ({})),
      ])

      if (cyclesData.success) {
        setCycles(cyclesData.cycles || [])
        if (cyclesData.cycles?.length > 0 && !selectedCycle) {
          loadCycleDetail(cyclesData.cycles[0].id)
        }
      }
      if (certsData.success) setCertifications(certsData.certifications || [])
      if (coursesData.success) setCourses(coursesData.courses || [])
      if (empData.success) {
        setEmployees(empData.employees || [])
        if (empData.employees?.length > 0 && !certForm.employeeId) {
          setCertForm((p) => ({ ...p, employeeId: empData.employees[0].id }))
        }
      }
    } catch {
      toast.error('Erro de ligação ao carregar dados de desempenho.')
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const loadCycleDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/rh/desempenho/ciclos/${id}`)
      const data = await res.json()
      if (res.ok && data.success) {
        setSelectedCycle(data.cycle)
      }
    } catch {
      toast.error('Erro ao carregar detalhe do ciclo.')
    }
  }

  useEffect(() => {
    loadData()
  }, [loadData])

  // Handlers
  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/rh/desempenho/ciclos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cycleForm),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Ciclo de avaliação criado e colaboradores associados!')
        setIsNewCycleOpen(false)
        loadData()
      } else {
        toast.error(data.error || 'Erro ao criar ciclo.')
      }
    } catch {
      toast.error('Erro de ligação ao criar ciclo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateCert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!certForm.title || !certForm.issuingEntity) {
      toast.error('Preencha os campos obrigatórios da certificação.')
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/rh/formacao/certificacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(certForm),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Certificação técnica registada com sucesso!')
        setIsNewCertOpen(false)
        loadData()
      } else {
        toast.error(data.error || 'Erro ao registar certificação.')
      }
    } catch {
      toast.error('Erro de ligação ao registar certificação.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseForm.title || !courseForm.provider) {
      toast.error('Preencha o título e a entidade formadora.')
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/rh/formacao/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Acção de formação registada com sucesso!')
        setIsNewCourseOpen(false)
        loadData()
      } else {
        toast.error(data.error || 'Erro ao registar curso.')
      }
    } catch {
      toast.error('Erro de ligação ao registar curso.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenReview = (rev: any) => {
    setSelectedReview(rev)
    setEvalForm({
      managerRating: Number(rev.managerRating) || 4.0,
      objectivesRating: Number(rev.objectivesRating) || 4.0,
      competenciesRating: Number(rev.competenciesRating) || 4.0,
      managerComments: rev.managerComments || '',
      strengths: rev.strengths || '',
      areasToImprove: rev.areasToImprove || '',
      developmentPlan: rev.developmentPlan || '',
    })
    setIsReviewDetailOpen(true)
  }

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!evalForm.managerComments.trim()) {
      toast.error('O parecer avaliativo é obrigatório.')
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/rh/desempenho/avaliacoes/${selectedReview.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'AVALIACAO_GESTOR',
          ...evalForm,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Avaliação de desempenho concluída e gravada com sucesso!')
        setIsReviewDetailOpen(false)
        if (selectedCycle) loadCycleDetail(selectedCycle.id)
      } else {
        toast.error(data.error || 'Erro ao submeter avaliação.')
      }
    } catch {
      toast.error('Erro de ligação ao submeter avaliação.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const tabs = [
    { id: 'ciclos', label: 'Ciclos de Avaliação', icon: <Award className="w-4 h-4" /> },
    { id: 'certificacoes', label: 'Certificações Técnicas', icon: <Star className="w-4 h-4" /> },
    { id: 'cursos', label: 'Cursos & Formação', icon: <GraduationCap className="w-4 h-4" /> },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--hr-text)] flex items-center gap-2.5">
            <Award className="w-6 h-6 text-[var(--hr-primary)]" />
            Avaliação de Desempenho & Formação
          </h1>
          <p className="text-xs sm:text-sm text-[var(--hr-text-muted)] mt-1">
            Gestão de ciclos de mérito, competências técnicas, certificações de segurança e planos de desenvolvimento (PDI).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'ciclos' && (
            <HrButton variant="primary" size="sm" onClick={() => setIsNewCycleOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Novo Ciclo de Avaliação
            </HrButton>
          )}
          {activeTab === 'certificacoes' && (
            <HrButton variant="primary" size="sm" onClick={() => setIsNewCertOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Registar Certificação
            </HrButton>
          )}
          {activeTab === 'cursos' && (
            <HrButton variant="primary" size="sm" onClick={() => setIsNewCourseOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Criar Acção de Formação
            </HrButton>
          )}
        </div>
      </div>

      {/* Tabs */}
      <HrTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: Ciclos de Avaliação */}
      {activeTab === 'ciclos' && (
        <div className="space-y-6">
          {isLoading ? (
            <HrSkeleton className="h-48 w-full" />
          ) : cycles.length === 0 ? (
            <div className="p-8 text-center bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)]">
              <Award className="w-8 h-8 text-[var(--hr-text-muted)] mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[var(--hr-text)]">Nenhum ciclo de avaliação criado</h3>
              <p className="text-xs text-[var(--hr-text-muted)] mt-1">
                Inicie um novo ciclo anual ou semestral para gerar fichas de avaliação para os colaboradores.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Cycles list */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[var(--hr-text-muted)] uppercase tracking-wider">
                  Ciclos Registados
                </h3>
                {cycles.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => loadCycleDetail(c.id)}
                    className={`p-4 rounded-[var(--hr-radius)] border cursor-pointer transition ${
                      selectedCycle?.id === c.id
                        ? 'bg-[var(--hr-primary-soft)] border-[var(--hr-primary)] text-[var(--hr-text)]'
                        : 'bg-[var(--hr-surface)] border-[var(--hr-border)] hover:border-[var(--hr-primary)] text-[var(--hr-text)]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-bold text-sm">{c.title}</div>
                      <HrBadge variant={c.status === 'ACTIVO' ? 'success' : 'neutral'} size="sm">
                        {c.status}
                      </HrBadge>
                    </div>
                    <div className="text-xs text-[var(--hr-text-muted)] mt-1 flex items-center gap-3">
                      <span>Ano: <strong>{c.year}</strong></span>
                      <span>·</span>
                      <span>{c._count?.reviews || 0} Colaboradores</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Detail of Selected Cycle */}
              <div className="lg:col-span-2 space-y-4">
                {selectedCycle ? (
                  <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-5 shadow-[var(--hr-shadow-sm)] space-y-4">
                    <div className="flex items-start justify-between border-b border-[var(--hr-border)] pb-3">
                      <div>
                        <h2 className="text-base font-bold text-[var(--hr-text)]">{selectedCycle.title}</h2>
                        <p className="text-xs text-[var(--hr-text-muted)] mt-0.5">
                          {selectedCycle.notes || 'Sem observações gerais.'}
                        </p>
                      </div>
                      <HrBadge variant="info" size="md">
                        {selectedCycle.reviews?.length || 0} Fichas Geradas
                      </HrBadge>
                    </div>

                    {/* Table of reviews in this cycle */}
                    <div className="overflow-x-auto">
                      <table className="hr-premium-table w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-[var(--hr-border)] text-[var(--hr-text-muted)]">
                            <th className="py-2.5 px-3">Colaborador</th>
                            <th className="py-2.5 px-3">Departamento</th>
                            <th className="py-2.5 px-3">Auto-Avaliação</th>
                            <th className="py-2.5 px-3">Nota Final</th>
                            <th className="py-2.5 px-3">Estado</th>
                            <th className="py-2.5 px-3 text-right">Acção</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--hr-border)]">
                          {selectedCycle.reviews?.map((r: any) => (
                            <tr key={r.id} className="hover:bg-[var(--hr-hover)] transition">
                              <td className="py-3 px-3 font-semibold text-[var(--hr-text)]">
                                {r.employee?.fullName}
                                <div className="text-[11px] font-normal text-[var(--hr-text-muted)]">
                                  {r.employee?.position?.title}
                                </div>
                              </td>
                              <td className="py-3 px-3 text-[var(--hr-text-muted)]">
                                {r.employee?.department?.name}
                              </td>
                              <td className="py-3 px-3 font-mono">
                                {r.selfRating ? `${Number(r.selfRating).toFixed(1)} / 5` : 'Pendente'}
                              </td>
                              <td className="py-3 px-3 font-mono font-bold">
                                {r.finalScore ? (
                                  <span className="text-[var(--hr-primary)]">
                                    {Number(r.finalScore).toFixed(1)} / 5
                                  </span>
                                ) : (
                                  '—'
                                )}
                              </td>
                              <td className="py-3 px-3">
                                <HrBadge
                                  variant={
                                    r.status === 'CONCLUIDO'
                                      ? 'success'
                                      : r.status === 'PENDENTE_AVALIADOR'
                                      ? 'warning'
                                      : 'neutral'
                                  }
                                  size="sm"
                                >
                                  {r.status === 'CONCLUIDO'
                                    ? 'Concluído'
                                    : r.status === 'PENDENTE_AVALIADOR'
                                    ? 'Aguardando Chefia'
                                    : 'Aguardando Auto'}
                                </HrBadge>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <HrButton
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenReview(r)}
                                >
                                  Avaliar
                                </HrButton>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-[var(--hr-text-muted)]">
                    Seleccione um ciclo à esquerda para visualizar as avaliações dos colaboradores.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Certificações Técnicas */}
      {activeTab === 'certificacoes' && (
        <div className="space-y-4">
          <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-5 shadow-[var(--hr-shadow-sm)]">
            <h3 className="text-sm font-bold text-[var(--hr-text)] mb-3">
              Certificações & Habilitações Técnicas dos Colaboradores
            </h3>
            {certifications.length === 0 ? (
              <p className="text-xs text-[var(--hr-text-muted)] py-4 text-center">
                Nenhuma certificação técnica registada até ao momento.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="hr-premium-table w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[var(--hr-border)] text-[var(--hr-text-muted)]">
                      <th className="py-2.5 px-3">Colaborador</th>
                      <th className="py-2.5 px-3">Certificação</th>
                      <th className="py-2.5 px-3">Entidade Emissora</th>
                      <th className="py-2.5 px-3">N.º Licença / Registo</th>
                      <th className="py-2.5 px-3">Data Emissão</th>
                      <th className="py-2.5 px-3">Validade</th>
                      <th className="py-2.5 px-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--hr-border)]">
                    {certifications.map((cert) => (
                      <tr key={cert.id} className="hover:bg-[var(--hr-hover)]">
                        <td className="py-3 px-3 font-semibold text-[var(--hr-text)]">
                          {cert.employee?.fullName}
                        </td>
                        <td className="py-3 px-3 font-medium text-[var(--hr-text)]">{cert.title}</td>
                        <td className="py-3 px-3 text-[var(--hr-text-muted)]">{cert.issuingEntity}</td>
                        <td className="py-3 px-3 font-mono text-[var(--hr-text-muted)]">
                          {cert.licenseNumber || '—'}
                        </td>
                        <td className="py-3 px-3">
                          {new Date(cert.issueDate).toLocaleDateString('pt-AO')}
                        </td>
                        <td className="py-3 px-3">
                          {cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString('pt-AO') : 'Vitalícia'}
                        </td>
                        <td className="py-3 px-3">
                          <HrBadge variant={cert.status === 'VALIDA' ? 'success' : 'error'} size="sm">
                            {cert.status}
                          </HrBadge>
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

      {/* TAB 3: Cursos & Acções de Formação */}
      {activeTab === 'cursos' && (
        <div className="space-y-4">
          <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] p-5 shadow-[var(--hr-shadow-sm)]">
            <h3 className="text-sm font-bold text-[var(--hr-text)] mb-3">
              Catálogo de Formação Profissional & Capacitação
            </h3>
            {courses.length === 0 ? (
              <p className="text-xs text-[var(--hr-text-muted)] py-4 text-center">
                Nenhuma acção de formação registada.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="p-4 border border-[var(--hr-border)] rounded-[var(--hr-radius)] bg-[var(--hr-bg)] space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-sm text-[var(--hr-text)]">{course.title}</h4>
                      <HrBadge variant="info" size="sm">
                        {course.category}
                      </HrBadge>
                    </div>
                    <p className="text-xs text-[var(--hr-text-muted)]">
                      Entidade: <strong>{course.provider}</strong>
                    </p>
                    <div className="text-xs text-[var(--hr-text-muted)] flex items-center justify-between pt-2 border-t border-[var(--hr-border)]">
                      <span>Carga: <strong>{course.durationHours}h</strong></span>
                      <span>Local: <strong>{course.location}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Novo Ciclo */}
      <HrDialog
        isOpen={isNewCycleOpen}
        onClose={() => setIsNewCycleOpen(false)}
        title="Criar Novo Ciclo de Avaliação de Desempenho"
        description="Irá gerar automaticamente fichas de avaliação para todos os colaboradores activos da empresa."
        maxWidth="md"
      >
        <form onSubmit={handleCreateCycle} className="space-y-4 pt-2">
          <HrField label="Título do Ciclo" required>
            <HrInput
              type="text"
              required
              value={cycleForm.title}
              onChange={(e) => setCycleForm((p) => ({ ...p, title: e.target.value }))}
            />
          </HrField>

          <div className="grid grid-cols-3 gap-3">
            <HrField label="Ano" required>
              <HrInput
                type="number"
                required
                value={cycleForm.year}
                onChange={(e) => setCycleForm((p) => ({ ...p, year: Number(e.target.value) }))}
              />
            </HrField>
            <HrField label="Data Início" required>
              <HrInput
                type="date"
                required
                value={cycleForm.startDate}
                onChange={(e) => setCycleForm((p) => ({ ...p, startDate: e.target.value }))}
              />
            </HrField>
            <HrField label="Data Fim" required>
              <HrInput
                type="date"
                required
                value={cycleForm.endDate}
                onChange={(e) => setCycleForm((p) => ({ ...p, endDate: e.target.value }))}
              />
            </HrField>
          </div>

          <HrField label="Observações & Instruções aos Avaliadores">
            <HrInput
              type="text"
              value={cycleForm.notes}
              onChange={(e) => setCycleForm((p) => ({ ...p, notes: e.target.value }))}
            />
          </HrField>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--hr-border)]">
            <HrButton type="button" variant="outline" size="sm" onClick={() => setIsNewCycleOpen(false)}>
              Cancelar
            </HrButton>
            <HrButton type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Criar e Associar Colaboradores
            </HrButton>
          </div>
        </form>
      </HrDialog>

      {/* MODAL: Nova Certificação */}
      <HrDialog
        isOpen={isNewCertOpen}
        onClose={() => setIsNewCertOpen(false)}
        title="Registar Certificação Profissional"
        description="Associe uma certificação válida a um colaborador técnico ou operacional."
        maxWidth="md"
      >
        <form onSubmit={handleCreateCert} className="space-y-4 pt-2">
          <HrField label="Colaborador" required>
            <HrSelect
              value={certForm.employeeId}
              onChange={(e) => setCertForm((p) => ({ ...p, employeeId: e.target.value }))}
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeNumber})
                </option>
              ))}
            </HrSelect>
          </HrField>

          <HrField label="Designação da Certificação" required>
            <HrInput
              type="text"
              required
              placeholder="Ex: Trabalho em Altura - NR35, CCNA, Fibra Óptica"
              value={certForm.title}
              onChange={(e) => setCertForm((p) => ({ ...p, title: e.target.value }))}
            />
          </HrField>

          <div className="grid grid-cols-2 gap-3">
            <HrField label="Entidade Emissora" required>
              <HrInput
                type="text"
                required
                placeholder="Ex: Cisco, ISUTIC, Inspecção Geral"
                value={certForm.issuingEntity}
                onChange={(e) => setCertForm((p) => ({ ...p, issuingEntity: e.target.value }))}
              />
            </HrField>
            <HrField label="N.º de Registo / Licença">
              <HrInput
                type="text"
                value={certForm.licenseNumber}
                onChange={(e) => setCertForm((p) => ({ ...p, licenseNumber: e.target.value }))}
              />
            </HrField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <HrField label="Data de Emissão" required>
              <HrInput
                type="date"
                required
                value={certForm.issueDate}
                onChange={(e) => setCertForm((p) => ({ ...p, issueDate: e.target.value }))}
              />
            </HrField>
            <HrField label="Data de Caducidade">
              <HrInput
                type="date"
                value={certForm.expiryDate}
                onChange={(e) => setCertForm((p) => ({ ...p, expiryDate: e.target.value }))}
              />
            </HrField>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--hr-border)]">
            <HrButton type="button" variant="outline" size="sm" onClick={() => setIsNewCertOpen(false)}>
              Cancelar
            </HrButton>
            <HrButton type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Guardar Certificação
            </HrButton>
          </div>
        </form>
      </HrDialog>

      {/* MODAL: Novo Curso */}
      <HrDialog
        isOpen={isNewCourseOpen}
        onClose={() => setIsNewCourseOpen(false)}
        title="Registar Acção de Formação"
        description="Registe cursos e capacitações técnicas internas ou externas."
        maxWidth="md"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4 pt-2">
          <HrField label="Título da Formação" required>
            <HrInput
              type="text"
              required
              placeholder="Ex: Boas Práticas de Fusão e Lançamento de Fibra Óptica"
              value={courseForm.title}
              onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))}
            />
          </HrField>

          <div className="grid grid-cols-2 gap-3">
            <HrField label="Entidade Formadora" required>
              <HrInput
                type="text"
                required
                value={courseForm.provider}
                onChange={(e) => setCourseForm((p) => ({ ...p, provider: e.target.value }))}
              />
            </HrField>
            <HrField label="Carga Horária (Horas)" required>
              <HrInput
                type="number"
                required
                value={courseForm.durationHours}
                onChange={(e) => setCourseForm((p) => ({ ...p, durationHours: Number(e.target.value) }))}
              />
            </HrField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <HrField label="Categoria">
              <HrSelect
                value={courseForm.category}
                onChange={(e) => setCourseForm((p) => ({ ...p, category: e.target.value }))}
              >
                <option value="TECNICA">Técnica (Telecom / Redes)</option>
                <option value="SEGURANCA">Segurança e Higiene no Trabalho</option>
                <option value="GESTAO">Liderança & Gestão</option>
                <option value="COMPLIANCE">Qualidade & Compliance</option>
              </HrSelect>
            </HrField>
            <HrField label="Data Início" required>
              <HrInput
                type="date"
                required
                value={courseForm.startDate}
                onChange={(e) => setCourseForm((p) => ({ ...p, startDate: e.target.value }))}
              />
            </HrField>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--hr-border)]">
            <HrButton type="button" variant="outline" size="sm" onClick={() => setIsNewCourseOpen(false)}>
              Cancelar
            </HrButton>
            <HrButton type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Guardar Formação
            </HrButton>
          </div>
        </form>
      </HrDialog>

      {/* MODAL: Avaliar Ficha (Chefia / RH) */}
      <HrDialog
        isOpen={isReviewDetailOpen}
        onClose={() => setIsReviewDetailOpen(false)}
        title={`Avaliação de Desempenho — ${selectedReview?.employee?.fullName}`}
        description="Atribua as notas de objectivos e competências e registe o Plano de Desenvolvimento Individual (PDI)."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitEvaluation} className="space-y-4 pt-2">
          {selectedReview?.selfRating && (
            <div className="p-3 bg-[var(--hr-primary-soft)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] text-xs space-y-1">
              <div className="font-bold text-[var(--hr-primary)]">
                Auto-Avaliação do Colaborador: {Number(selectedReview.selfRating).toFixed(1)} / 5.0
              </div>
              <p className="italic text-[var(--hr-text)]">
                "{selectedReview.selfComments || 'Sem comentários adicionais.'}"
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <HrField label="Cumprimento de Objectivos (1 a 5)" required>
              <HrInput
                type="number"
                step="0.1"
                min="1"
                max="5"
                required
                value={evalForm.objectivesRating}
                onChange={(e) => setEvalForm((p) => ({ ...p, objectivesRating: Number(e.target.value) }))}
              />
            </HrField>
            <HrField label="Competências Técnicas & Comportamentais (1 a 5)" required>
              <HrInput
                type="number"
                step="0.1"
                min="1"
                max="5"
                required
                value={evalForm.competenciesRating}
                onChange={(e) => setEvalForm((p) => ({ ...p, competenciesRating: Number(e.target.value) }))}
              />
            </HrField>
          </div>

          <HrField label="Parecer Avaliativo da Chefia / Recursos Humanos" required>
            <HrInput
              type="text"
              required
              placeholder="Justificação da avaliação de desempenho..."
              value={evalForm.managerComments}
              onChange={(e) => setEvalForm((p) => ({ ...p, managerComments: e.target.value }))}
            />
          </HrField>

          <div className="grid grid-cols-2 gap-3">
            <HrField label="Pontos Fortes Identificados">
              <HrInput
                type="text"
                placeholder="Ex: Rigor técnico, assiduidade..."
                value={evalForm.strengths}
                onChange={(e) => setEvalForm((p) => ({ ...p, strengths: e.target.value }))}
              />
            </HrField>
            <HrField label="Áreas de Melhoria">
              <HrInput
                type="text"
                placeholder="Ex: Gestão de tempo, comunicação..."
                value={evalForm.areasToImprove}
                onChange={(e) => setEvalForm((p) => ({ ...p, areasToImprove: e.target.value }))}
              />
            </HrField>
          </div>

          <HrField label="Plano de Desenvolvimento Individual (PDI / Formação Futura)">
            <HrInput
              type="text"
              placeholder="Acções de formação recomendadas para o colaborador..."
              value={evalForm.developmentPlan}
              onChange={(e) => setEvalForm((p) => ({ ...p, developmentPlan: e.target.value }))}
            />
          </HrField>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--hr-border)]">
            <HrButton type="button" variant="outline" size="sm" onClick={() => setIsReviewDetailOpen(false)}>
              Cancelar
            </HrButton>
            <HrButton type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Concluir e Homologar Avaliação
            </HrButton>
          </div>
        </form>
      </HrDialog>
    </div>
  )
}
