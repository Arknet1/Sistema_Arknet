'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  linkHref?: string
  linkText?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  linkHref,
  linkText = 'Ver detalhes',
}: StatCardProps) {
  return (
    <div className="flex flex-col justify-between border border-slate-200 border-l-2 border-l-primary bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-600">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className="shrink-0 bg-primary/10 p-2.5 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end border-t border-slate-100 pt-3 text-xs">
        {linkHref && (
          <Link
            href={linkHref}
            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            {linkText}
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  )
}
