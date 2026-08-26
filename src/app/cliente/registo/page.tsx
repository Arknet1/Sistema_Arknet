'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  User,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import arknetLogo from '@/assets/icon18.png'
import { useCustomerAuth } from '@/lib/customer-auth-context'

export default function ClienteRegistoPage() {
  const router = useRouter()
  const { register, customer } = useCustomerAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: '',
    nif: '',
    address: '',
    city: 'Luanda',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Redirecionar se já autenticado
  React.useEffect(() => {
    if (customer) {
      router.push('/cliente/perfil')
    }
  }, [customer, router])

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (formData.password && formData.password.length < 6) {
      setErrorMessage('A palavra-passe deve conter pelo menos 6 caracteres.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('As palavras-passe não coincidem.')
      return
    }

    setIsLoading(true)

    try {
      const res = register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        company: formData.company,
        nif: formData.nif,
        address: formData.address,
        city: formData.city,
      })

      if (res.success) {
        router.push('/cliente/perfil')
      } else {
        setErrorMessage(res.message)
      }
    } catch (err) {
      setErrorMessage('Ocorreu um erro ao criar a sua conta.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen pt-24 pb-16 bg-slate-900 flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-950 px-8 py-8 text-white text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
          
          <Link href="/" className="inline-block mb-3">
            <Image
              src={arknetLogo}
              alt="ARKNET"
              width={160}
              height={160}
              className="h-14 w-auto mx-auto object-contain"
            />
          </Link>

          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-secondary bg-secondary/10 px-3 py-1 rounded-full mb-2">
            Novo Registo
          </span>
          <h1 className="text-xl font-black text-white uppercase tracking-wide">
            Criar Conta de Cliente ARKNET
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Acompanhe orçamentos, encomendas da loja e serviços contratados.
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          {errorMessage && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
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
                  placeholder="ex: João Miguel Silva"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-primary focus:outline-none"
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
                  placeholder="cliente@empresa.co.ao"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-primary focus:outline-none font-mono"
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
                  placeholder="+244 923 000 000"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-primary focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Empresa / Organização
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="ex: Empresa Lda ou Particular"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  NIF / Nº de Identificação Fiscal
                </label>
                <input
                  type="text"
                  value={formData.nif}
                  onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                  placeholder="5400000000"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-primary focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Cidade / Província
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Luanda"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Endereço Físico / Sede
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua, Edifício, Bairro, Município"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Palavra-passe *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-primary focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Confirmar Palavra-passe *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Repita a senha"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-primary focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-slate-600 text-xs">Mostrar palavra-passe</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-secondary hover:bg-secondary/90 text-white font-bold text-xs uppercase tracking-wider py-3.5 transition flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
            >
              <span>{isLoading ? 'A criar conta...' : 'Concluir Registo e Entrar'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Link to Login */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Já possui uma conta cliente?{' '}
              <Link href="/cliente/login" className="font-bold text-primary hover:underline">
                Fazer Início de Sessão
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
