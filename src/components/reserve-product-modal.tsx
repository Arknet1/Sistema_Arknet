'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  Truck,
  CheckCircle2,
  Clock,
  MessageCircle,
  Building2,
  User,
  Mail,
  Phone,
  PackagePlus,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { StoreProduct, dataStore, ProductReservation } from '@/lib/data-store'
import { useCustomerAuth } from '@/lib/customer-auth-context'
import { formatProdutoPrice } from '@/lib/format-produto-price'
import { useToast } from '@/lib/toast-context'

interface ReserveProductModalProps {
  product: StoreProduct | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: (reservation: ProductReservation) => void
}

export default function ReserveProductModal({
  product,
  isOpen,
  onClose,
  onSuccess,
}: ReserveProductModalProps) {
  const { customer } = useCustomerAuth()
  const { success } = useToast()

  const [quantity, setQuantity] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdReservation, setCreatedReservation] = useState<ProductReservation | null>(null)

  // Pre-fill user data when opened or customer changes
  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      setCreatedReservation(null)
      setIsSubmitting(false)
      setFormData({
        name: customer?.name || '',
        email: customer?.email || '',
        phone: customer?.phone || '',
        company: customer?.company || '',
        notes: '',
      })
    }
  }, [isOpen, customer])

  if (!isOpen || !product) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      const reservation = dataStore.addReservation({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        productPrice: product.price,
        customerName: formData.name.trim(),
        customerEmail: formData.email.trim(),
        customerPhone: formData.phone.trim(),
        customerCompany: formData.company.trim() || undefined,
        quantity: Math.max(1, quantity),
        notes: formData.notes.trim() || undefined,
        status: 'pendente',
      })

      setIsSubmitting(false)
      setCreatedReservation(reservation)
      success(
        `Reserva #${reservation.reservationNumber} criada com sucesso para ${product.name}!`,
        'Reserva Efetuada'
      )
      if (onSuccess) {
        onSuccess(reservation)
      }
    }, 450)
  }

  const handleClose = () => {
    setCreatedReservation(null)
    onClose()
  }

  const getWhatsAppReservationLink = () => {
    if (!createdReservation) return '#'
    const text = encodeURIComponent(
      `Olá ARKNET! 📦 Efetuei a Reserva *#${createdReservation.reservationNumber}* no vosso site para o produto *"${product.name}"* (${createdReservation.quantity} un.). Gostaria de acompanhar a previsão de chegada ao vosso armazém em Luanda.`
    )
    return `https://wa.me/244935208449?text=${text}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-primary-950 p-5 sm:p-6 text-white shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full w-fit mb-2">
            <Truck className="h-3.5 w-3.5" />
            <span>Produto em Trânsito / Reposição</span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white">
            {createdReservation ? 'Reserva Confirmada!' : 'Reservar Produto em Trânsito'}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {createdReservation
              ? 'A sua reserva foi registada no nosso sistema com prioridade de entrega.'
              : 'Garanta prioridade de entrega e seja notificado assim que o lote der entrada na ARKNET.'}
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">

          {/* Product Summary Card */}
          <div className="flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="h-16 w-16 bg-white border border-slate-200 rounded-lg shrink-0 overflow-hidden flex items-center justify-center p-1">
              {product.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <Truck className="h-7 w-7 text-slate-300" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wide">
                {product.category}
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                {product.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-black text-primary">
                  {formatProdutoPrice(product.price)}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                  <Clock className="h-2.5 w-2.5" /> Em Trânsito
                </span>
              </div>
            </div>
          </div>

          {/* Confirmation View */}
          {createdReservation ? (
            <div className="space-y-5 text-center py-2">
              <div className="mx-auto w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div className="space-y-1.5">
                <p className="text-xs uppercase tracking-wider font-extrabold text-slate-400">
                  Número da Reserva
                </p>
                <div className="inline-block px-4 py-1.5 bg-slate-900 text-white rounded-lg font-mono text-base font-black tracking-wider shadow-sm">
                  {createdReservation.reservationNumber}
                </div>
                <p className="text-xs text-slate-600 max-w-sm mx-auto pt-2 leading-relaxed">
                  Obrigado, <strong>{createdReservation.customerName}</strong>! Reservámos <strong>{createdReservation.quantity} unidade(s)</strong> do produto. A equipa comercial da ARKNET entrará em contacto direto consigo através do <strong>{createdReservation.customerPhone}</strong> ou e-mail.
                </p>
              </div>

              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-left flex items-start gap-3 text-xs text-blue-950">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Garantia de Prioridade</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Os clientes com reserva têm prioridade máxima de atribuição do stock antes da disponibilização pública na loja.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={getWhatsAppReservationLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Acompanhar no WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition"
                >
                  Concluir
                </button>
              </div>
            </div>
          ) : (
            /* Reservation Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Quantity Selector */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <label className="text-xs font-bold text-slate-900 block">
                    Quantidade Pretendida:
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Indique quantas unidades deseja reservar
                  </span>
                </div>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-3 py-1 text-xs font-mono font-black text-slate-900 min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 text-slate-600 hover:bg-slate-100 transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Customer Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome Completo <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Eng. Manuel Silva"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      E-mail <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@empresa.co.ao"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Telefone / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+244 923 000 000"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Empresa / Instituição <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Ex: Banco Comercial / Empresa Lda"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Notas ou Requisitos Específicos <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ex: Urgência na receção, necessidade de acessórios adicionais..."
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase rounded-xl transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-5 bg-primary hover:bg-primary/90 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <PackagePlus className="h-4 w-4" />
                  )}
                  <span>Confirmar Reserva de Stock</span>
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  )
}
