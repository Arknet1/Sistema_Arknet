'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface TicketsSectionProps {
  id?: string
  className?: string
}

export default function TicketsSection({
  id = 'reclamacoes-e-informacoes',
  className = '',
}: TicketsSectionProps) {
  return (
    <section id={id} className={`border-y border-slate-200 bg-white py-5 text-slate-800 ${className}`}>
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">Reclamações, Dúvidas &amp; Sugestões</h2>
          <p className="mt-1 text-sm text-slate-600">
            Envie uma solicitação à equipa de apoio da ARKNET.
          </p>
        </div>
        <Link
          href="/reclamacoes"
          className="inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          Enviar solicitação
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}