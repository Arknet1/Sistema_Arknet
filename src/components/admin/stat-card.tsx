'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: string
    isPositive: boolean
  }
  icon: React.ElementType
  colorScheme?: 'blue' | 'red' | 'emerald' | 'amber' | 'purple' | 'slate'
  linkHref?: string
  linkText?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  colorScheme = 'blue',
  linkHref,
  linkText = 'Ver detalhes',
}: StatCardProps) {
  const schemeStyles = {
    blue: {
      border: 'border-l-primary',
      iconBg: 'bg-primary/10 text-primary',
      badge: 'bg-blue-50 text-primary',
    },
    red: {
      border: 'border-l-secondary',
      iconBg: 'bg-secondary/10 text-secondary',
      badge: 'bg-red-50 text-secondary',
    },
    emerald: {
      border: 'border-l-emerald-600',
      iconBg: 'bg-emerald-500/10 text-emerald-600',
      badge: 'bg-emerald-50 text-emerald-700',
    },
    amber: {
      border: 'border-l-amber-600',
      iconBg: 'bg-amber-500/10 text-amber-600',
      badge: 'bg-amber-50 text-amber-700',
    },
    purple: {
      border: 'border-l-indigo-600',
      iconBg: 'bg-indigo-500/10 text-indigo-600',
      badge: 'bg-indigo-50 text-indigo-700',
    },
    slate: {
      border: 'border-l-slate-800',
      iconBg: 'bg-slate-100 text-slate-800',
      badge: 'bg-slate-100 text-slate-700',
    },
  }

  const currentScheme = schemeStyles[colorScheme]

  return (
    <div className={`relative bg-white border border-slate-200 border-l-4 ${currentScheme.border} p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3.5 rounded-lg ${currentScheme.iconBg} shrink-0`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        {trend ? (
          <div className="flex items-center gap-1 font-semibold">
            {trend.isPositive ? (
              <span className="flex items-center text-emerald-600">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                {trend.value}
              </span>
            ) : (
              <span className="flex items-center text-rose-600">
                <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
                {trend.value}
              </span>
            )}
            <span className="text-slate-400 font-normal">vs mês anterior</span>
          </div>
        ) : (
          <span className="text-slate-400">Em tempo real</span>
        )}

        {linkHref && (
          <Link
            href={linkHref}
            className="font-bold text-primary hover:text-secondary inline-flex items-center gap-1 transition"
          >
            {linkText}
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  )
}
