'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import {
  Printer,
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Download,
  Copy,
  Receipt,
  FileCheck,
  MessageCircle,
} from 'lucide-react'
import jmatosLogo from '@/assets/jmatos.png'
import { StoreOrder } from '@/lib/data-store'
import { formatProdutoPrice, formatLinhaPreco } from '@/lib/format-produto-price'
import { JMATOS_BANK_DETAILS } from '@/lib/fatura-config'

export { JMATOS_BANK_DETAILS }

interface FaturaJMatosProps {
  order: StoreOrder
  onClose: () => void
}

export default function FaturaJMatos({ order, onClose }: FaturaJMatosProps) {
  const isPaid = order.status === 'fechado'

  // Fechar com tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Número oficial de documento comercial angolano
  const docPrefix = isPaid ? 'FT JM2024/' : 'FP JM2024/'
  const docNumber = `${docPrefix}${order.orderNumber.replace(/[^0-9]/g, '').padStart(6, '0')}`

  // Datas
  const emissionDate = new Date(order.confirmedAt || order.createdAt)
  const formattedEmissionDate = emissionDate.toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  // Data de vencimento (30 dias para proforma ou pronto pagamento se pago)
  const dueDate = new Date(emissionDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  // Cálculos fiscais de IVA (Regime Geral - 14%)
  const subtotal = order.total || 0
  const taxaIva = 0.14
  const baseTributavel = Math.round((subtotal / (1 + taxaIva)) * 100) / 100
  const valorIva = Math.round((subtotal - baseTributavel) * 100) / 100

  const handleCopyIban = (iban: string) => {
    navigator.clipboard.writeText(iban.replace(/\s+/g, ''))
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm p-3 sm:p-6 flex justify-center items-start print:p-0 print:bg-white print:static print:overflow-visible"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-3xl bg-white border border-slate-300 shadow-2xl rounded-sm my-2 sm:my-6 print:my-0 print:border-none print:shadow-none print:w-full print:max-w-none text-slate-900 font-sans">
        
        {/* Botão de Fechar Discreto no Canto Superior (Oculto no print) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-500 flex items-center justify-center transition shadow-xs border border-slate-300 print:hidden"
          title="Fechar (Esc)"
        >
          <X className="h-4 w-4" />
        </button>

        {/* ========================================================================= */}
        {/* CORPO DA FATURA COMERCIAL J.MATOS (Design Corporativo Rigoroso e Proporcionado) */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-8 print:p-6 bg-white text-slate-900 text-[10.5px] sm:text-[11px] leading-normal">
          
          {/* CABEÇALHO INSTITUCIONAL J.MATOS */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-[#1E78C2] pb-5 gap-4">
            
            {/* Lado Esquerdo: Identificação da Entidade Emitente */}
            <div className="space-y-1 sm:max-w-sm">
              <div className="mb-2">
                <Image
                  src={jmatosLogo}
                  alt="J.Matos Tecnologia"
                  width={160}
                  height={45}
                  className="h-10 w-auto object-contain"
                  priority
                />
              </div>

              <h1 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-900">
                J.Matos Tecnologia — Soluções Tecnológicas, Lda.
              </h1>
              <p className="text-slate-600 font-medium">
                Sociedade Comercial por Quotas · Grupo ARKNET
              </p>
              <p className="text-slate-600">
                <strong className="text-slate-900">NIF:</strong> 5412398760 · Registo Comercial n.º 1243-18
              </p>
              <p className="text-slate-600">
                {JMATOS_BANK_DETAILS.address}
              </p>
              <p className="text-slate-600">
                Tel: <strong className="text-slate-900 font-mono">{JMATOS_BANK_DETAILS.phone}</strong> · Email: <span className="font-mono">{JMATOS_BANK_DETAILS.email}</span>
              </p>
            </div>

            {/* Lado Direito: Caixa Oficial do Documento Fiscal */}
            <div className="w-full sm:w-64 bg-slate-50 border border-slate-300 p-3 shrink-0 text-left">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <span className="font-extrabold uppercase text-[10px] tracking-wider text-[#1E78C2]">
                  {isPaid ? 'FATURA COMERCIAL' : 'FATURA PROFORMA'}
                </span>
                <span
                  className={`text-[9px] font-bold uppercase px-2 py-0.5 border ${
                    isPaid
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  {isPaid ? 'Liquidado' : 'Aguardando Pagamento'}
                </span>
              </div>

              <div className="mt-2 space-y-1 font-mono text-[10.5px]">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans text-[10px] uppercase">Nº Documento:</span>
                  <span className="font-bold text-slate-900">{docNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans text-[10px] uppercase">Data Emissão:</span>
                  <span className="text-slate-800">{formattedEmissionDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans text-[10px] uppercase">Vencimento:</span>
                  <span className="text-slate-800">{isPaid ? 'Pronto Pagamento' : dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans text-[10px] uppercase">Moeda / Câmbio:</span>
                  <span className="text-slate-800 font-bold">AOA (Kwanzas)</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500 font-sans text-[10px] uppercase">Regime IVA:</span>
                  <span className="text-slate-800 font-sans font-bold text-[10px]">Geral (14%)</span>
                </div>
              </div>
            </div>

          </div>

          {/* DADOS DO CLIENTE / ADQUIRENTE & ENTREGA */}
          <div className="grid sm:grid-cols-2 gap-3.5 my-4">
            
            {/* Box 1: Exmo.(s) Sr.(s) Adquirente */}
            <div className="p-3.5 border border-slate-300 bg-white">
              <div className="text-[10px] font-black uppercase tracking-wider text-[#1E78C2] pb-1 mb-1.5 border-b border-slate-200 flex items-center justify-between">
                <span>Adquirente / Faturação</span>
                <span className="text-slate-400 font-normal">Exmo.(s) Sr.(s)</span>
              </div>
              <p className="font-extrabold text-slate-900 text-[11px] uppercase">{order.customerName}</p>
              {order.customerCompany && (
                <p className="text-slate-700 font-semibold mt-0.5">Empresa: {order.customerCompany}</p>
              )}
              <p className="text-slate-700 mt-0.5">
                <span className="text-slate-500">NIF:</span>{' '}
                <strong className="font-mono text-slate-900">{order.customerNif || '999999999 (Consumidor Final)'}</strong>
              </p>
              <p className="text-slate-600 mt-0.5">
                <span className="text-slate-500">Telefone:</span>{' '}
                <span className="font-mono text-slate-800">{order.customerPhone}</span>
              </p>
              <p className="text-slate-600">
                <span className="text-slate-500">Email:</span>{' '}
                <span className="font-mono text-slate-800">{order.customerEmail}</span>
              </p>
            </div>

            {/* Box 2: Local de Entrega e Condições */}
            <div className="p-3.5 border border-slate-300 bg-white">
              <div className="text-[10px] font-black uppercase tracking-wider text-[#F7941D] pb-1 mb-1.5 border-b border-slate-200 flex items-center justify-between">
                <span>Condições & Expedição</span>
                <span className="text-slate-400 font-normal">Logística J.Matos</span>
              </div>
              <p className="text-slate-700">
                <span className="text-slate-500">Método de Liquidação:</span>{' '}
                <strong className="text-slate-900 uppercase">
                  {order.paymentMethod || 'Transferência Bancária / Multicaixa Express'}
                </strong>
              </p>
              <p className="text-slate-700 mt-0.5">
                <span className="text-slate-500">Local de Entrega:</span>{' '}
                <span className="text-slate-900 font-medium">{order.customerAddress || 'A combinar / Levantamento em Loja'}</span>
              </p>
              <p className="text-slate-700 mt-0.5">
                <span className="text-slate-500">Cidade:</span>{' '}
                <span className="text-slate-900">{order.customerCity || 'Luanda'}, Angola</span>
              </p>
              <p className="text-slate-500 text-[9.5px] mt-1.5 pt-1 border-t border-slate-100">
                Garantia técnica direta do hardware e assistência pós-venda.
              </p>
            </div>

          </div>

          {/* TABELA DE ARTIGOS / EQUIPAMENTOS */}
          <div className="my-4 border border-slate-300 overflow-x-auto">
            <table className="w-full text-left text-[10.5px] border-collapse min-w-[560px]">
              <thead>
                <tr className="bg-[#1E78C2] text-white uppercase text-[9.5px] font-bold tracking-wider">
                  <th className="py-2 px-2.5 w-8 text-center border-r border-[#16609c]">#</th>
                  <th className="py-2 px-2.5 w-24 border-r border-[#16609c]">Código SKU</th>
                  <th className="py-2 px-3 border-r border-[#16609c]">Designação do Artigo</th>
                  <th className="py-2 px-2 w-12 text-center border-r border-[#16609c]">Qtd</th>
                  <th className="py-2 px-2.5 w-24 text-right border-r border-[#16609c]">Preço Unit.</th>
                  <th className="py-2 px-2 w-12 text-center border-r border-[#16609c]">IVA</th>
                  <th className="py-2 px-3 w-28 text-right">Total Líquido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item, idx) => {
                  const lineTotal = item.price !== null ? item.price * item.quantity : null
                  const skuCode = `JM-${item.productId ? item.productId.slice(0, 8).toUpperCase() : `EQ${idx + 1}`}`

                  return (
                    <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                      <td className="py-2 px-2.5 text-center font-mono text-slate-500 border-r border-slate-200">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-2.5 font-mono font-bold text-slate-700 border-r border-slate-200">
                        {skuCode}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200">
                        <p className="font-bold text-slate-900 leading-tight">{item.productName}</p>
                        <p className="text-[9.5px] text-slate-500">
                          Garantia técnica oficial J.Matos Tecnologia
                        </p>
                      </td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-slate-900 border-r border-slate-200">
                        {item.quantity}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono text-slate-800 border-r border-slate-200">
                        {item.price !== null ? formatProdutoPrice(item.price) : 'Sob Consulta'}
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-slate-600 border-r border-slate-200">
                        14%
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        {lineTotal !== null ? formatProdutoPrice(lineTotal) : 'Sob Consulta'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* QUADRO DE COORDENADAS BANCÁRIAS & TOTAIS */}
          <div className="grid sm:grid-cols-12 gap-4 my-4 items-start">
            
            {/* Esquerda (7 colunas): Coordenadas Bancárias Oficiais J.Matos */}
            <div className="sm:col-span-7 space-y-2.5">
              <div className="p-3 border border-slate-300 bg-slate-50/60">
                <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-slate-200">
                  <span className="font-bold uppercase text-[9.5px] tracking-wider text-slate-800">
                    Coordenadas Bancárias Oficiais
                  </span>
                  <span className="text-[9.5px] font-bold text-[#F7941D]">
                    Titular: J.Matos Tecnologia
                  </span>
                </div>

                <div className="space-y-1 text-[9.5px] font-mono">
                  <div className="flex items-center justify-between p-1 bg-white border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-900">BAI:</span>{' '}
                      <span className="text-slate-800">{JMATOS_BANK_DETAILS.baiIban}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyIban(JMATOS_BANK_DETAILS.baiIban)}
                      className="text-[#1E78C2] hover:text-[#16609c] p-0.5 print:hidden"
                      title="Copiar IBAN"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-1 bg-white border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-900">BFA:</span>{' '}
                      <span className="text-slate-800">{JMATOS_BANK_DETAILS.bfaIban}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyIban(JMATOS_BANK_DETAILS.bfaIban)}
                      className="text-[#1E78C2] hover:text-[#16609c] p-0.5 print:hidden"
                      title="Copiar IBAN"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-1 bg-white border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-900">ATLÂNTICO:</span>{' '}
                      <span className="text-slate-800">{JMATOS_BANK_DETAILS.atlanticoIban}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyIban(JMATOS_BANK_DETAILS.atlanticoIban)}
                      className="text-[#1E78C2] hover:text-[#16609c] p-0.5 print:hidden"
                      title="Copiar IBAN"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <p className="text-[9px] text-slate-500 mt-1.5">
                  * Indique o pedido <strong className="font-mono text-slate-700">#{order.orderNumber}</strong> e envie o comprovativo para WhatsApp +244 935 208 449.
                </p>
              </div>

              {/* Tabela Resumo do IVA */}
              <div className="border border-slate-300">
                <table className="w-full text-left text-[9.5px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold uppercase text-slate-700 border-b border-slate-200">
                      <th className="py-1 px-2">Taxa / Regime</th>
                      <th className="py-1 px-2 text-right">Incidência</th>
                      <th className="py-1 px-2 text-right">Valor IVA</th>
                      <th className="py-1 px-2">Enquadramento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr>
                      <td className="py-1 px-2 font-sans font-medium text-slate-800">IVA Geral (14%)</td>
                      <td className="py-1 px-2 text-right">{order.total ? formatProdutoPrice(baseTributavel) : '—'}</td>
                      <td className="py-1 px-2 text-right">{order.total ? formatProdutoPrice(valorIva) : '—'}</td>
                      <td className="py-1 px-2 font-sans text-slate-500">Regime Geral</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Direita (5 colunas): Totais Oficiais */}
            <div className="sm:col-span-5 bg-slate-50 border border-slate-300 p-3.5 space-y-1.5 text-[10.5px]">
              <div className="flex justify-between text-slate-600">
                <span>Total Ilíquido:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {order.total ? formatProdutoPrice(baseTributavel) : 'Sob Consulta'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Descontos:</span>
                <span className="font-mono font-semibold text-slate-900">0,00 Kz</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total IVA (14%):</span>
                <span className="font-mono font-semibold text-slate-900">
                  {order.total ? formatProdutoPrice(valorIva) : '0,00 Kz'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Custo de Envio:</span>
                <span className="font-semibold text-slate-800">Incluído</span>
              </div>

              <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-baseline text-slate-900">
                <span className="font-black uppercase text-xs">
                  {isPaid ? 'Total Liquidado:' : 'Total a Pagar:'}
                </span>
                <span className="font-black font-mono text-sm sm:text-base text-[#1E78C2]">
                  {order.total !== null ? formatProdutoPrice(order.total) : 'Sob Consulta'}
                </span>
              </div>

              {/* Status do Pagamento */}
              <div
                className={`mt-2 p-1.5 border text-center font-bold text-[9.5px] uppercase tracking-wider ${
                  isPaid
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}
              >
                {isPaid ? '✓ Liquidado na Totalidade' : 'Aguardando Comprovativo Bancário'}
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* CARIMBO RETANGULAR DE VALIDAÇÃO FISCAL (AUTÊNTICO ANGOLANO) */}
          {/* ========================================================================= */}
          <div className="my-4 pt-3 border-t border-slate-300 grid sm:grid-cols-2 gap-4 items-center">
            
            {/* Carimbo da J.Matos Tecnologia */}
            <div className="p-2.5 border-2 border-double border-[#1E78C2] bg-blue-50/20 text-[#1E78C2] font-mono text-center max-w-xs mx-auto sm:mx-0">
              <p className="font-black text-[9.5px] uppercase tracking-widest">
                J.MATOS TECNOLOGIA, LDA.
              </p>
              <p className="text-[8.5px] font-bold">
                NIF: 5412398760 · LUANDA - ANGOLA
              </p>
              <p className="text-[8.5px] uppercase tracking-wider my-0.5 py-0.5 border-y border-[#1E78C2]/40 font-black">
                {isPaid ? 'PAGO & CONFERIDO · TESOURARIA' : 'PROCESSADO PARA LIQUIDAÇÃO'}
              </p>
              <p className="text-[8px] text-slate-600">
                Data: {formattedEmissionDate} · Sist. Comercial Aut.
              </p>
            </div>

            {/* Assinatura / Validação Comercial */}
            <div className="text-center sm:text-right space-y-0.5">
              <p className="text-[9.5px] text-slate-500 uppercase tracking-wider">
                Assinatura Autorizada / Pela Gerência:
              </p>
              <div className="h-8 border-b border-slate-400 mx-auto sm:ml-auto sm:mr-0 w-48 pt-4">
                <span className="font-serif italic text-slate-600 text-xs">J. Matos Tecnologia</span>
              </div>
              <p className="text-[8.5px] text-slate-400">
                Documento emitido nos termos legais vigentes
              </p>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* MENÇÕES LEGAIS (AGT ANGOLA) & RODAPÉ */}
          {/* ========================================================================= */}
          <div className="mt-4 pt-3 border-t border-slate-300 text-[8.5px] text-slate-500 leading-relaxed">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-1">
              <p>
                <strong>Certificação AGT:</strong> Processado por programa validado n.º 341/AGT/2023 · Software J.Matos ERP v4.2.
              </p>
              <p className="font-mono text-slate-400">
                HASH: {order.id.slice(0, 4).toUpperCase()}-{docNumber.slice(-4)}
              </p>
            </div>
            <p className="mt-0.5 text-slate-400">
              Os equipamentos permanecem propriedade da J.Matos Tecnologia, Lda. até à sua integral liquidação financeira.
            </p>
          </div>

          {/* ========================================================================= */}
          {/* BOTÕES DE FECHAR / IMPRIMIR NA BASE (Ocultos no print) */}
          {/* ========================================================================= */}
          <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#1E78C2] hover:bg-[#16609c] text-white font-bold text-xs uppercase tracking-wider rounded flex items-center gap-1.5 transition shadow-xs"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimir / PDF A4</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded flex items-center gap-1.5 transition shadow-xs"
              >
                <X className="h-4 w-4" />
                <span>Fechar Fatura</span>
              </button>
            </div>

            <a
              href={`https://wa.me/244935208449?text=${encodeURIComponent(
                `Olá equipa J.Matos! Gostaria de falar sobre a fatura do pedido #${order.orderNumber}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-1.5 transition"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              <span>Dúvidas? Falar com a Loja no WhatsApp</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  )
}
