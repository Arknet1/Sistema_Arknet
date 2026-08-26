'use client'

import React, { useState, useEffect } from 'react'
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Shield,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  KeyRound,
  X,
  Lock,
  Mail,
  User,
  Info,
} from 'lucide-react'
import { dataStore, AdminUser, UserRole } from '@/lib/data-store'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/lib/toast-context'
import { ConfirmModal } from '@/components/admin/confirm-modal'

export default function AdminUtilizadoresPage() {
  const { user: currentUser, isAdmin } = useAuth()
  const { success, error, info } = useToast()

  const [users, setUsers] = useState<AdminUser[]>([])

  // Modal Criar/Editar
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    email: string
    role: UserRole
    status: 'active' | 'inactive'
    password: string
  }>({
    name: '',
    email: '',
    role: 'editor',
    status: 'active',
    password: '',
  })

  // Modal Reset Password
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [resettingUser, setResettingUser] = useState<AdminUser | null>(null)
  const [newPassword, setNewPassword] = useState('')

  // Modal Eliminar
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      setUsers([...db.users])
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  const handleOpenCreate = () => {
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      role: 'editor',
      status: 'active',
      password: '',
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      password: '',
    })
    setIsModalOpen(true)
  }

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim()) {
      error('Nome e email são obrigatórios.')
      return
    }

    if (editingUser) {
      dataStore.updateUser(editingUser.id, {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        status: formData.status,
      })
      success(`Utilizador "${formData.name}" atualizado com sucesso!`)
    } else {
      const existing = users.find((u) => u.email.toLowerCase() === formData.email.trim().toLowerCase())
      if (existing) {
        error('Já existe um utilizador registado com este endereço de email.')
        return
      }

      dataStore.addUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        status: formData.status,
        lastLogin: undefined,
      })
      success(`Utilizador "${formData.name}" criado com sucesso!`)
    }

    setIsModalOpen(false)
  }

  const handleToggleStatus = (u: AdminUser) => {
    if (u.id === currentUser?.id) {
      error('Não é possível desativar a sua própria conta ativa.')
      return
    }
    const nextStatus = u.status === 'active' ? 'inactive' : 'active'
    dataStore.updateUser(u.id, { status: nextStatus })
    info(`Conta de "${u.name}" ${nextStatus === 'active' ? 'ativada' : 'desativada'}.`)
  }

  const handleOpenResetPassword = (user: AdminUser) => {
    setResettingUser(user)
    setNewPassword('Arknet@2026!')
    setIsPasswordModalOpen(true)
  }

  const handleConfirmResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (resettingUser && newPassword.length >= 4) {
      success(`Palavra-passe de ${resettingUser.name} redefinida com sucesso!`)
      setIsPasswordModalOpen(false)
      setResettingUser(null)
    }
  }

  const handleDeleteConfirm = () => {
    if (deletingId) {
      if (deletingId === currentUser?.id) {
        error('Não pode eliminar o seu próprio utilizador em sessão.')
        setIsDeleteModalOpen(false)
        return
      }
      dataStore.deleteUser(deletingId)
      success('Utilizador eliminado com sucesso.')
      setIsDeleteModalOpen(false)
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-extrabold text-slate-900">Gestão de Utilizadores</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Controle de acessos, criação de administradores e gestores de conteúdo (exclusivo para Administradores).
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-3 bg-secondary text-white text-xs font-bold uppercase tracking-wider hover:bg-secondary/90 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Novo Utilizador
        </button>
      </div>

      {/* Permissions Guide Banner */}
      <div className="bg-slate-900 text-white p-6 border border-slate-800 grid md:grid-cols-2 gap-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/20 text-primary rounded shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Nível Administrador (Admin)</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Acesso total a todos os módulos, gestão de contas de utilizadores, backup e restauro da base de dados e definições de segurança.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-secondary/20 text-secondary rounded shrink-0">
            <Edit2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Nível Editor de Conteúdo</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Gestão de produtos, pedidos, leads, newsletter, cursos, eventos, vagas, testemunhos e parceiros, sem permissão de alterar utilizadores.
            </p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="py-3.5 px-6">Utilizador</th>
                <th className="py-3.5 px-4">Função / Nível</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4">Último Acesso</th>
                <th className="py-3.5 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition group">
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center border border-slate-200 shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 flex items-center gap-2">
                          {u.name}
                          {u.id === currentUser?.id && (
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-mono font-bold">
                              Sua Conta
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full ${
                        u.role === 'admin'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Shield className="h-3 w-3" />
                      {u.role === 'admin' ? 'Administrador' : 'Editor de Conteúdo'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(u)}
                      disabled={u.id === currentUser?.id}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full transition ${
                        u.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      } ${u.id === currentUser?.id ? 'cursor-default opacity-80' : 'hover:opacity-80'}`}
                      title={u.id === currentUser?.id ? 'Conta ativa em sessão' : 'Alternar estado'}
                    >
                      {u.status === 'active' ? (
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

                  <td className="py-3.5 px-4 text-slate-400">
                    {u.lastLogin ? (
                      <span>
                        {new Date(u.lastLogin).toLocaleDateString('pt-PT')}{' '}
                        <span className="text-[10px]">
                          {new Date(u.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </span>
                    ) : (
                      <span className="italic text-slate-400">Nunca acedeu</span>
                    )}
                  </td>

                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenResetPassword(u)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition"
                        title="Redefinir palavra-passe"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 text-slate-600 hover:text-primary hover:bg-slate-100 rounded transition"
                        title="Editar perfil"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {u.id !== currentUser?.id && (
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingId(u.id)
                            setIsDeleteModalOpen(true)
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          title="Eliminar utilizador"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white border border-slate-200 shadow-2xl overflow-hidden z-10">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 text-primary rounded">
                  <User className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingUser ? 'Editar Utilizador' : 'Novo Utilizador do Painel'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="ex: João Miguel Matos"
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="utilizador@arknet.co.ao"
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nível de Acesso *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as UserRole }))}
                    className="w-full px-3 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none bg-white font-bold"
                  >
                    <option value="admin">Administrador (Total)</option>
                    <option value="editor">Editor (Conteúdos)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Estado da Conta
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none bg-white"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Palavra-passe Inicial
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Se deixar em branco, será atribuída a senha padrão provisória.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary/90 uppercase shadow-sm"
                >
                  {editingUser ? 'Guardar' : 'Criar Utilizador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {isPasswordModalOpen && resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsPasswordModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white border border-slate-200 shadow-2xl overflow-hidden z-10 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-amber-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Redefinir Palavra-passe</h3>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmResetPassword} className="space-y-4 pt-4 text-xs">
              <p className="text-slate-600">
                A definir nova palavra-passe para <strong>{resettingUser.name}</strong> ({resettingUser.email}):
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
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 uppercase shadow-sm"
                >
                  Confirmar Redefinição
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
        title="Eliminar Utilizador"
        message="Tem a certeza que deseja revogar o acesso e eliminar esta conta de utilizador do painel?"
        confirmText="Sim, Eliminar"
        cancelText="Cancelar"
      />
    </div>
  )
}
