'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft,
  ShoppingCart,
  CheckCircle2,
  Lock,
  UserCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  Building,
  Truck,
  Printer,
  ShieldCheck,
  ArrowRight,
  Download,
  Receipt,
  HelpCircle,
  ExternalLink,
  MessageCircle,
} from 'lucide-react'
import { useCart } from '@/lib/cart'
import { useCustomerAuth } from '@/lib/customer-auth-context'
import { dataStore, StoreOrderItem } from '@/lib/data-store'
import { formatLinhaPreco, formatProdutoPrice } from '@/lib/format-produto-price'
import arknetLogo from '@/assets/icon18.png'

function CheckoutContent() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const { customer } = useCustomerAuth()

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    nif: '',
    city: 'Luanda',
    address: '',
    deliveryMethod: 'entrega_luanda' as 'entrega_luanda' | 'levantamento_sede' | 'interprovincial',
    paymentMethod: 'transferencia' as 'transferencia' | 'referencia_mc' | 'proforma_30d' | 'levantamento_tpa',
    notes: '',
  })

  const [submittedOrder, setSubmittedOrder] = useState<any | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Preencher dados automaticamente quando o cliente estiver autenticado
  useEffect(() => {
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        company: customer.company || '',
        nif: customer.nif || '',
        city: customer.city || 'Luanda',
        address: customer.address || '',
      }))
    }
  }, [customer])

  // Se o carrinho estiver vazio e não foi submetido, redirecionar para a loja
  useEffect(() => {
    if (!isAuthLoading && items.length === 0 && !submittedOrder) {
      router.push('/loja/carrinho')
    }
  }, [items.length, submittedOrder, isAuthLoading, router])

  // 1. BLOQUEIO: Se o cliente não estiver autenticado
  if (!isAuthLoading && !customer && !submittedOrder) {
    return (
      <main className="min-h-screen pt-32 pb-20 bg-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-amber-200">
            <Lock className="h-8 w-8" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full inline-block mb-3">
            Acesso Restrito a Clientes
          </span>

          <h1 className="text-2xl font-black text-slate-900 uppercase">
            Identificação de Cliente Obrigatória
          </h1>

          <p className="text-xs text-slate-600 mt-3 leading-relaxed">
            Para finalizar a encomenda, emitir fatura proforma institucional e garantir a assistência técnica dos equipamentos, é necessário ter uma conta de cliente ARKNET ativa.
          </p>

          <div className="mt-8 space-y-3">
            <Link
              href="/login?redirect=/loja/checkout"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider py-3.5 transition flex items-center justify-center gap-2 shadow-md"
            >
              <span>Iniciar Sessão para Comprar</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/login?tab=registo&redirect=/loja/checkout"
              className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold text-xs uppercase tracking-wider py-3.5 transition flex items-center justify-center gap-2 shadow-md"
            >
              <span>Criar Conta Cliente Gratuita</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/loja/carrinho"
              className="inline-block text-xs text-slate-500 hover:text-slate-800 font-semibold pt-2"
            >
              &larr; Voltar ao Carrinho de Compras
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // 2. TELA DE SUCESSO & FATURA PROFORMA
  if (submittedOrder) {
    return (
      <main className="min-h-screen pt-24 pb-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          {/* Printable Invoice Container */}
          <div className="bg-white border border-slate-200 shadow-2xl p-8 sm:p-12 print:p-0 print:border-none print:shadow-none">
            
            {/* Header Documento Fiscal */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-8 gap-6">
              <div>
                <Image
                  src={arknetLogo}
                  alt="ARKNET"
                  width={180}
                  height={60}
                  className="h-12 w-auto object-contain mb-3"
                />
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  ARKNET — Soluções Tecnológicas & Telecomunicações Lda.
                </p>
                <p className="text-xs text-slate-500">NIF: 5412398760 • Kilamba, Luanda - Angola</p>
                <p className="text-xs text-slate-500">Email: comercial@arknet.co.ao • Tel: +244 923 000 000</p>
              </div>

              <div className="sm:text-right bg-slate-50 p-4 border border-slate-200 rounded sm:min-w-[240px]">
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded mb-1">
                  Pedido Registado
                </span>
                <h2 className="text-xl font-black text-slate-900 font-mono">
                  {submittedOrder.orderNumber}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Data: {new Date(submittedOrder.createdAt).toLocaleDateString('pt-AO', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-xs font-semibold text-slate-700 mt-1">
                  Estado: <span className="text-primary uppercase">Aguardando Pagamento</span>
                </p>
              </div>
            </div>

            {/* Dados do Cliente & Entrega */}
            <div className="grid sm:grid-cols-2 gap-6 my-8 p-6 bg-slate-50 border border-slate-200 text-xs">
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-2 text-[11px] text-primary">
                  Dados de Faturação:
                </h3>
                <p className="font-bold text-slate-800 text-sm">{submittedOrder.customerName}</p>
                {submittedOrder.customerCompany && (
                  <p className="text-slate-600">Empresa: {submittedOrder.customerCompany}</p>
                )}
                {submittedOrder.customerNif && (
                  <p className="text-slate-600">NIF: {submittedOrder.customerNif}</p>
                )}
                <p className="text-slate-600">Email: {submittedOrder.customerEmail}</p>
                <p className="text-slate-600">Telefone: {submittedOrder.customerPhone}</p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-2 text-[11px] text-primary">
                  Local de Entrega & Método:
                </h3>
                <p className="text-slate-800 font-semibold">{submittedOrder.customerAddress || 'A combinar com o cliente'}</p>
                <p className="text-slate-600">{submittedOrder.customerCity || 'Luanda'}, Angola</p>
                <p className="text-slate-600 mt-1">
                  Método de Pagamento:{' '}
                  <strong className="text-slate-800 uppercase">
                    {submittedOrder.paymentMethod === 'transferencia'
                      ? 'Transferência Bancária / MCX'
                      : submittedOrder.paymentMethod === 'referencia_mc'
                      ? 'Referência Multicaixa GPO'
                      : submittedOrder.paymentMethod === 'proforma_30d'
                      ? 'Fatura Proforma a 30 dias'
                      : 'Pagamento no Levantamento (TPA)'}
                  </strong>
                </p>
              </div>
            </div>

            {/* Tabela de Itens */}
            <div className="my-8 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 bg-slate-100 text-slate-800 uppercase tracking-wider">
                    <th className="py-3 px-3">Item / Equipamento</th>
                    <th className="py-3 px-3 text-center">Qtd</th>
                    <th className="py-3 px-3 text-right">Preço Unitário</th>
                    <th className="py-3 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {submittedOrder.items.map((item: StoreOrderItem, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-slate-900">{item.productName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">ID: {item.productId}</p>
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold">{item.quantity}</td>
                      <td className="py-3.5 px-3 text-right font-mono">
                        {item.price === null ? 'Sob consulta' : formatProdutoPrice(item.price)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-slate-900 font-mono">
                        {formatLinhaPreco(item.price, item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totais */}
            <div className="flex justify-end my-6 border-t border-slate-200 pt-4">
              <div className="w-full sm:w-72 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold font-mono">
                    {submittedOrder.total === null ? 'Sob consulta' : formatProdutoPrice(submittedOrder.total)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>IVA (14% Incluído):</span>
                  <span>Regime Geral</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Custo de Envio:</span>
                  <span className="text-emerald-700 font-bold">Grátis</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 border-t-2 border-slate-900 pt-2">
                  <span>Total Final:</span>
                  <span className="font-mono">
                    {submittedOrder.total === null ? 'Sob consulta' : formatProdutoPrice(submittedOrder.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Coordenadas Bancárias para Pagamento */}
            <div className="p-6 bg-blue-50 border border-blue-200 rounded my-8 text-xs text-blue-900">
              <h4 className="font-bold uppercase tracking-wider mb-2 flex items-center gap-2 text-primary">
                <CreditCard className="h-4 w-4" />
                Coordenadas Bancárias ARKNET (Transferência / Multicaixa Express):
              </h4>
              <div className="grid sm:grid-cols-3 gap-3 font-mono text-[11px] mt-3">
                <div className="p-2.5 bg-white border border-blue-100 rounded">
                  <p className="font-bold text-slate-900">Banco BAI</p>
                  <p className="text-slate-600 select-all">IBAN: AO06 0040 0000 1234 5678 9012 3</p>
                </div>
                <div className="p-2.5 bg-white border border-blue-100 rounded">
                  <p className="font-bold text-slate-900">Banco BFA</p>
                  <p className="text-slate-600 select-all">IBAN: AO06 0006 0000 9876 5432 1098 7</p>
                </div>
                <div className="p-2.5 bg-white border border-blue-100 rounded">
                  <p className="font-bold text-slate-900">Banco BIC</p>
                  <p className="text-slate-600 select-all">IBAN: AO06 0051 0000 5544 3322 1100 9</p>
                </div>
              </div>
              <p className="text-[11px] text-blue-800 mt-2">
                * Titular: <strong>ARKNET TECNOLOGIA LDA</strong> • NIF: <strong>5412398760</strong>. Por favor, indique o nº da encomenda <strong>{submittedOrder.orderNumber}</strong> no descritivo.
              </p>
            </div>

            {/* Ações / Botões */}
            <div className="flex flex-wrap gap-3 justify-between items-center pt-6 border-t border-slate-200 print:hidden">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir / Guardar Proforma PDF
                </button>

                <a
                  href={`https://wa.me/244923000000?text=Ol%C3%A1%20ARKNET,%20acabei%20de%20registar%20a%20encomenda%20${submittedOrder.orderNumber}%20no%20valor%20de%20${submittedOrder.total}%20Kz%20e%20gostaria%20de%20enviar%20o%20comprovativo.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition"
                >
                  <MessageCircle className="h-4 w-4" />
                  Enviar Comprovativo no WhatsApp
                </a>
              </div>

              <div className="flex gap-2">
                <Link
                  href="/cliente/perfil"
                  className="px-5 py-3 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-md"
                >
                  <UserCheck className="h-4 w-4" />
                  Acompanhar no Meu Perfil
                </Link>
                <Link
                  href="/loja"
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition"
                >
                  Voltar à Loja
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // 3. FORMULÁRIO DE CHECKOUT COMPLETO
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Registar pedido na base de dados central ARKNET
      const newOrder = dataStore.addOrder({
        customerName: formData.name.trim(),
        customerEmail: formData.email.trim(),
        customerPhone: formData.phone.trim(),
        customerAddress: `${formData.address.trim()} - ${formData.city}`,
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
        })),
        total: total,
        status: 'novo',
      })

      // Guardar objeto da encomenda com métodos de pagamento
      const fullOrder = {
        ...newOrder,
        customerCompany: formData.company,
        customerNif: formData.nif,
        customerCity: formData.city,
        paymentMethod: formData.paymentMethod,
        deliveryMethod: formData.deliveryMethod,
        notes: formData.notes,
      }

      setSubmittedOrder(fullOrder)
      clearCart()
    } catch (err) {
      alert('Erro ao registar encomenda. Por favor, tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen pt-24 pb-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/loja/carrinho"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-primary transition mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Carrinho
          </Link>
          <h1 className="text-3xl font-black text-slate-900 uppercase">
            Finalização de Compra & Faturação
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete os detalhes para registar a sua encomenda e emitir a fatura proforma.
          </p>
        </div>

        <form onSubmit={handleCheckoutSubmit}>
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Left Column: Form Steps */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* STEP 1: DADOS DO CLIENTE & FATURAÇÃO */}
              <div className="bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-black">
                      1
                    </span>
                    <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                      Dados do Cliente & Faturação
                    </h2>
                  </div>
                  {customer && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 border border-emerald-200 rounded flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5" />
                      Conta Verificada
                    </span>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1.5">
                      Nome Completo / Representante *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nome do cliente ou gestor"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1.5">
                      Endereço de Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@empresa.co.ao"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1.5">
                      Telefone de Contacto *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+244 923 000 000"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1.5">
                      Empresa / Instituição (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Nome da Empresa Lda"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1.5">
                      NIF para Faturação (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.nif}
                      onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                      placeholder="5400000000"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1.5">
                      Cidade / Província *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Luanda"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-4 text-xs">
                  <label className="block font-bold uppercase text-slate-700 mb-1.5">
                    Endereço de Entrega / Sede *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Rua, Edifício, Bairro, Ponto de Referência"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* STEP 2: MODALIDADE DE ENTREGA */}
              <div className="bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-2 pb-4 mb-6 border-b border-slate-100">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-black">
                    2
                  </span>
                  <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                    Modalidade de Entrega / Envio
                  </h2>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <label
                    className={`p-4 border cursor-pointer transition flex flex-col justify-between ${
                      formData.deliveryMethod === 'entrega_luanda'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Truck className="h-5 w-5" />
                        <input
                          type="radio"
                          name="delivery"
                          checked={formData.deliveryMethod === 'entrega_luanda'}
                          onChange={() => setFormData({ ...formData, deliveryMethod: 'entrega_luanda' })}
                          className="text-primary"
                        />
                      </div>
                      <p className="font-bold text-sm text-slate-900">Entrega em Luanda</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Talatona, Kilamba, Maianga, Viana, Belas (24h - 48h).
                      </p>
                    </div>
                    <span className="mt-3 font-bold text-emerald-600 text-xs">Grátis</span>
                  </label>

                  <label
                    className={`p-4 border cursor-pointer transition flex flex-col justify-between ${
                      formData.deliveryMethod === 'levantamento_sede'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Building className="h-5 w-5" />
                        <input
                          type="radio"
                          name="delivery"
                          checked={formData.deliveryMethod === 'levantamento_sede'}
                          onChange={() => setFormData({ ...formData, deliveryMethod: 'levantamento_sede' })}
                          className="text-primary"
                        />
                      </div>
                      <p className="font-bold text-sm text-slate-900">Levantamento na Sede</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Sede ARKNET no Kilamba (Rua Directa do Kero).
                      </p>
                    </div>
                    <span className="mt-3 font-bold text-slate-700 text-xs">Imediato</span>
                  </label>

                  <label
                    className={`p-4 border cursor-pointer transition flex flex-col justify-between ${
                      formData.deliveryMethod === 'interprovincial'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <MapPin className="h-5 w-5" />
                        <input
                          type="radio"
                          name="delivery"
                          checked={formData.deliveryMethod === 'interprovincial'}
                          onChange={() => setFormData({ ...formData, deliveryMethod: 'interprovincial' })}
                          className="text-primary"
                        />
                      </div>
                      <p className="font-bold text-sm text-slate-900">Outras Províncias</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Benguela, Huambo, Cabinda, Lubango, Soyo, etc.
                      </p>
                    </div>
                    <span className="mt-3 font-bold text-slate-700 text-xs">Via Transportadora</span>
                  </label>
                </div>
              </div>

              {/* STEP 3: FORMA DE PAGAMENTO EM ANGOLA */}
              <div className="bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-2 pb-4 mb-6 border-b border-slate-100">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-black">
                    3
                  </span>
                  <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                    Forma de Pagamento
                  </h2>
                </div>

                <div className="space-y-3 text-xs">
                  <label
                    className={`p-4 border cursor-pointer block transition ${
                      formData.paymentMethod === 'transferencia'
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            Transferência Bancária / Multicaixa Express
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Pague via BAI Directo, BFA Net, Multicaixa Express para o IBAN oficial da ARKNET.
                          </p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="payment"
                        checked={formData.paymentMethod === 'transferencia'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'transferencia' })}
                        className="text-primary"
                      />
                    </div>
                  </label>

                  <label
                    className={`p-4 border cursor-pointer block transition ${
                      formData.paymentMethod === 'referencia_mc'
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Receipt className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            Pagamento por Referência Multicaixa (GPO)
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Entidade e Referência geradas automaticamente no ecrã e na fatura proforma.
                          </p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="payment"
                        checked={formData.paymentMethod === 'referencia_mc'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'referencia_mc' })}
                        className="text-primary"
                      />
                    </div>
                  </label>

                  <label
                    className={`p-4 border cursor-pointer block transition ${
                      formData.paymentMethod === 'proforma_30d'
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            Fatura Proforma a 30 dias (Empresas Aprovadas)
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Emissão de fatura comercial B2B para processamento pelo departamento financeiro.
                          </p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="payment"
                        checked={formData.paymentMethod === 'proforma_30d'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'proforma_30d' })}
                        className="text-primary"
                      />
                    </div>
                  </label>

                  <label
                    className={`p-4 border cursor-pointer block transition ${
                      formData.paymentMethod === 'levantamento_tpa'
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Building className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            Pagamento por TPA no Levantamento
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Pague com cartão de débito no balcão da ARKNET ao retirar o equipamento.
                          </p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="payment"
                        checked={formData.paymentMethod === 'levantamento_tpa'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'levantamento_tpa' })}
                        className="text-primary"
                      />
                    </div>
                  </label>
                </div>
              </div>

              {/* STEP 4: NOTAS / OBSERVAÇÕES */}
              <div className="bg-white border border-slate-200 p-6 sm:p-8 shadow-xs text-xs">
                <label className="block font-bold uppercase text-slate-700 mb-2">
                  Observações ou Requisitos Técnicos Especiais (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ex: Horário preferencial de entrega, configuração prévia de IP, contacto do rececionista..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Right Column: Order Summary & Action */}
            <div className="lg:col-span-4">
              <div className="bg-white border border-slate-200 p-7 sticky top-24 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-5 pb-3 border-b border-slate-100">
                  Resumo da Encomenda
                </h2>

                <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1 divide-y divide-slate-100">
                  {items.map((item) => (
                    <div key={item.product.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                      <div className="pr-3">
                        <p className="font-bold text-slate-800 line-clamp-1">{item.product.name}</p>
                        <p className="text-slate-500 text-[11px]">Qtd: <strong>{item.quantity}</strong></p>
                      </div>
                      <span className="font-mono font-bold text-slate-900 shrink-0">
                        {formatLinhaPreco(item.product.price, item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Equipamentos:</span>
                    <span className="font-semibold font-mono">
                      {total === null ? 'Sob consulta' : formatProdutoPrice(total)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Taxa IVA (14%):</span>
                    <span>Incluso</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Envio / Entrega:</span>
                    <span className="font-bold text-emerald-600">Grátis</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t-2 border-slate-900 flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 uppercase text-xs tracking-wider">Total a Pagar</span>
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {total === null ? 'Sob consulta' : formatProdutoPrice(total)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 w-full bg-secondary hover:bg-secondary/90 text-white font-bold text-xs uppercase tracking-wider py-4 transition flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>{isSubmitting ? 'A registar encomenda...' : 'Confirmar e Emitir Proforma'}</span>
                </button>

                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-snug">
                  Ao confirmar, será gerada a fatura proforma com as coordenadas bancárias ARKNET para pagamento e validação.
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-32 pb-20 bg-slate-900 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
