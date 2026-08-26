'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  Building2,
  ShoppingBag,
  FileText,
  KeyRound,
  X,
  ExternalLink,
  Download,
} from 'lucide-react'
import { dataStore, CustomerAccount, StoreOrder, ServiceLead } from '@/lib/data-store'
import { useToast } from '@/lib/toast-context'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import { ExportButton } from '@/components/admin/export-button'
import { exportToCSV } from '@/lib/export-utils'
import { formatProdutoPrice, formatLinhaPreco } from '@/lib/format-produto-price'

export default function AdminClientesPage() {
  const { success, error, info } = useToast()

  const [customers, setCustomers] = useState<CustomerAccount[]>([])
  const [orders, setOrders] = useState<StoreOrder[]>([])
  const [leads, setLeads] = useState<ServiceLead[]>([])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all')

  // Modal Criar/Editar
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<CustomerAccount | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    email: string
    password?: string
    phone: string
    company: string
    nif: string
    address: string
    city: string
    status: CustomerAccount['status']
    notes: string
  }>({
    name: '',
    email: '',
    password: '',
    phone: '',
    company: '',
    nif: '',
    address: '',
    city: 'Luanda',
    status: 'active',
    notes: '',
  })

  // Modal Detalhes do Cliente
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerAccount | null>(null)

  // Modal Reset Password
  const [resettingCustomer, setResettingCustomer] = useState<CustomerAccount | null>(null)
  const [newPassword, setNewPassword] = useState('Password123!')

  // Delete Modal
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      setCustomers([...(db.customers || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      setOrders(db.orders || [])
      setLeads(db.leads || [])
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.phone && c.phone.includes(searchTerm)) ||
        (c.nif && c.nif.includes(searchTerm))

      const matchStatus = statusFilter === 'all' || c.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [customers, searchTerm, statusFilter])

  const handleOpenCreate = () => {
    setEditingCustomer(null)
    setFormData({
      name: '',
      email: '',
      password: 'Password123!',
      phone: '',
      company: '',
      nif: '',
      address: '',
      city: 'Luanda',
      status: 'active',
      notes: '',
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (c: CustomerAccount) => {
    setEditingCustomer(c)
    setFormData({
      name: c.name,
      email: c.email,
      password: '',
      phone: c.phone,
      company: c.company || '',
      nif: c.nif || '',
      address: c.address || '',
      city: c.city || 'Luanda',
      status: c.status,
      notes: c.notes || '',
    })
    setIsModalOpen(true)
  }

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      error('Nome, email e telefone são obrigatórios.')
      return
    }

    if (editingCustomer) {
      dataStore.updateCustomer(editingCustomer.id, {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        nif: formData.nif.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        status: formData.status,
        notes: formData.notes.trim(),
        ...(formData.password ? { password: formData.password } : {}),
      })
      success(`Cliente "${formData.name}" atualizado com sucesso!`)
    } else {
      const existing = customers.find((c) => c.email.toLowerCase() === formData.email.trim().toLowerCase())
      if (existing) {
        error('Já existe um cliente registado com este endereço de email.')
        return
      }

      dataStore.addCustomer({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password || 'Password123!',
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        nif: formData.nif.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        status: formData.status,
        notes: formData.notes.trim(),
      })
      success(`Cliente "${formData.name}" registado com sucesso!`)
    }

    setIsModalOpen(false)
  }

  const handleToggleStatus = (c: CustomerAccount) => {
    const nextStatus = c.status === 'active' ? 'inactive' : 'active'
    dataStore.updateCustomer(c.id, { status: nextStatus })
    info(`Conta de "${c.name}" ${nextStatus === 'active' ? 'ativada' : 'desativada'}.`)
  }

  const handleConfirmResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (resettingCustomer && newPassword.length >= 6) {
      dataStore.updateCustomer(resettingCustomer.id, { password: newPassword })
      success(`Palavra-passe de ${resettingCustomer.name} redefinida para "${newPassword}"!`)
      setResettingCustomer(null)
    }
  }

  const handleDeleteConfirm = () => {
    if (deletingId) {
      dataStore.deleteCustomer(deletingId)
      success('Conta de cliente eliminada com sucesso.')
      setIsDeleteModalOpen(false)
      if (selectedCustomer?.id === deletingId) setSelectedCustomer(null)
      setDeletingId(null)
    }
  }

  const handleExportCSV = () => {
    exportToCSV(
      filteredCustomers,
      'ARKNET_Base_Clientes',
      [
        { key: 'name', header: 'Nome do Cliente' },
        { key: 'email', header: 'Email' },
        { key: 'phone', header: 'Telefone' },
        { key: 'company', header: 'Empresa' },
        { key: 'nif', header: 'NIF' },
        { key: 'city', header: 'Cidade' },
        { key: 'address', header: 'Endereço' },
        { key: 'status', header: 'Estado' },
        { key: 'notes', header: 'Notas Internas' },
        {
          key: 'createdAt',
          header: 'Data de Registo',
          format: (val) => new Date(val).toLocaleDateString('pt-PT'),
        },
      ]
    )
  }

  const getCustomerOrders = (email: string) => {
    return orders.filter((o) => o.customerEmail.toLowerCase().trim() === email.toLowerCase().trim())
  }

  const getCustomerLeads = (email: string) => {
    return leads.filter((l) => l.email.toLowerCase().trim() === email.toLowerCase().trim())
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-extrabold text-slate-900">Gestão de Clientes</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Base de dados de contas de clientes, empresas, histórico de compras e cotações.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButton onExport={handleExportCSV} label="Exportar Clientes (CSV)" />
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-white text-xs font-bold uppercase tracking-wider hover:bg-secondary/90 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Novo Cliente
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome, empresa, email, NIF ou telefone..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:bg-white focus:border-primary focus:outline-none"
          >
            <option value="all">Todos os Estados ({customers.length})</option>
            <option value="active">Apenas Ativos ({customers.filter((c) => c.status === 'active').length})</option>
            <option value="inactive">Inativos ({customers.filter((c) => c.status === 'inactive').length})</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="py-3.5 px-6">Cliente & Empresa</th>
                <th className="py-3.5 px-4">Contactos</th>
                <th className="py-3.5 px-4 text-center">Pedidos Loja</th>
                <th className="py-3.5 px-4 text-center">Cotações</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4">Registo</th>
                <th className="py-3.5 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Nenhum cliente encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const clientOrders = getCustomerOrders(c.email)
                  const clientLeads = getCustomerLeads(c.email)

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition group">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20 shrink-0">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-primary transition">
                              {c.name}
                            </p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                              {c.company ? (
                                <>
                                  <Building2 className="h-3 w-3 text-slate-400" />
                                  <span>{c.company}</span>
                                </>
                              ) : (
                                <span className="italic text-slate-400">Particular</span>
                              )}
                              {c.nif && <span className="font-mono text-slate-400">• NIF: {c.nif}</span>}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono text-[11px]">
                          <p className="text-slate-700">{c.email}</p>
                          <p className="text-slate-500">{c.phone}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 font-bold font-mono rounded">
                          <ShoppingBag className="h-3 w-3 text-primary" />
                          {clientOrders.length}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 font-bold font-mono rounded">
                          <FileText className="h-3 w-3 text-secondary" />
                          {clientLeads.length}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(c)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full transition ${
                            c.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {c.status === 'active' ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              Ativo
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 text-slate-400" />
                              Inativo
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(c.createdAt).toLocaleDateString('pt-PT')}
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(c)}
                            className="p-1.5 text-slate-600 hover:text-primary hover:bg-slate-100 rounded transition"
                            title="Ver detalhes & histórico"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setResettingCustomer(c)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition"
                            title="Redefinir palavra-passe"
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 text-slate-600 hover:text-primary hover:bg-slate-100 rounded transition"
                            title="Editar dados"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingId(c.id)
                              setIsDeleteModalOpen(true)
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                            title="Eliminar cliente"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar / Editar Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-xl bg-white border border-slate-200 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 text-primary rounded">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingCustomer ? 'Editar Cliente' : 'Novo Cliente / Registo'}
                </h3>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nome Completo / Representante *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Endereço de Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Telefone de Contacto *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Empresa / Instituição
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    NIF
                  </label>
                  <input
                    type="text"
                    value={formData.nif}
                    onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Estado da Conta
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none bg-white font-bold"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Endereço Físico de Entrega / Sede
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-3 text-sm border border-slate-300 focus:border-primary focus:outline-none resize-none"
                />
              </div>

              {!editingCustomer && (
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Palavra-passe Inicial
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Password123!"
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Notas Internas de Acompanhamento (Admin)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ex: Cliente corporativo prioritário; acordado desconto em routers..."
                  className="w-full p-3 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary/90 uppercase shadow-sm"
                >
                  {editingCustomer ? 'Guardar' : 'Criar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhes & Histórico do Cliente */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)} />

          <div className="relative w-full max-w-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-primary uppercase">Ficha do Cliente</span>
                <h3 className="text-lg font-extrabold text-slate-900">{selectedCustomer.name}</h3>
              </div>
              <button type="button" onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Informações Gerais */}
              <div className="grid sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Dados de Contacto</p>
                  <p className="font-bold text-slate-900 text-sm">{selectedCustomer.name}</p>
                  <p className="font-mono text-slate-600 mt-1">{selectedCustomer.email}</p>
                  <p className="font-mono text-slate-600">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Empresa & Localização</p>
                  <p className="font-bold text-slate-900">{selectedCustomer.company || 'Particular'}</p>
                  {selectedCustomer.nif && <p className="font-mono text-slate-600">NIF: {selectedCustomer.nif}</p>}
                  <p className="text-slate-600 mt-1">{selectedCustomer.address || 'Sem morada'}, {selectedCustomer.city || 'Luanda'}</p>
                </div>
              </div>

              {/* Histórico de Encomendas */}
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-2 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  Encomendas na Loja ({getCustomerOrders(selectedCustomer.email).length})
                </h4>

                {getCustomerOrders(selectedCustomer.email).length === 0 ? (
                  <p className="text-slate-400 italic p-3 bg-slate-50 border border-slate-100">Nenhuma encomenda registada.</p>
                ) : (
                  <div className="space-y-3">
                    {getCustomerOrders(selectedCustomer.email).map((order) => (
                      <div key={order.id} className="p-4 border border-slate-200 bg-white">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-mono font-bold text-primary">#{order.orderNumber}</span>
                          <span className="font-mono font-bold text-slate-900">{order.total ? formatProdutoPrice(order.total) : 'Sob Consulta'}</span>
                        </div>
                        <ul className="text-slate-600 space-y-1">
                          {order.items.map((it, i) => (
                            <li key={i} className="flex justify-between">
                              <span>{it.productName} x{it.quantity}</span>
                              <span className="font-mono">{formatLinhaPreco(it.price, it.quantity)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Histórico de Cotações */}
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-secondary" />
                  Cotações Solicitadas ({getCustomerLeads(selectedCustomer.email).length})
                </h4>

                {getCustomerLeads(selectedCustomer.email).length === 0 ? (
                  <p className="text-slate-400 italic p-3 bg-slate-50 border border-slate-100">Nenhum pedido de cotação registado.</p>
                ) : (
                  <div className="space-y-3">
                    {getCustomerLeads(selectedCustomer.email).map((lead) => (
                      <div key={lead.id} className="p-4 border border-slate-200 bg-white">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-900">{lead.service}</span>
                          <span className="text-[10px] text-slate-400">{new Date(lead.createdAt).toLocaleDateString('pt-PT')}</span>
                        </div>
                        <p className="text-slate-600 italic">&ldquo;{lead.message}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Redefinir Password */}
      {resettingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setResettingCustomer(null)} />

          <div className="relative w-full max-w-md bg-white border border-slate-200 shadow-2xl overflow-hidden z-10 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-amber-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Redefinir Palavra-passe do Cliente</h3>
              </div>
              <button onClick={() => setResettingCustomer(null)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmResetPassword} className="space-y-4 pt-4 text-xs">
              <p className="text-slate-600">
                A definir nova palavra-passe para o cliente <strong>{resettingCustomer.name}</strong> ({resettingCustomer.email}):
              </p>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nova Palavra-passe Provisória
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResettingCustomer(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 uppercase shadow-sm"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Conta de Cliente"
        message="Tem a certeza que deseja remover esta conta de cliente? O histórico de encomendas continuará preservado."
        confirmText="Sim, Eliminar"
        cancelText="Cancelar"
      />
    </div>
  )
}
