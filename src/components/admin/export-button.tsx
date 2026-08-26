'use client'

import React, { useState } from 'react'
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react'

interface ExportButtonProps {
  onExport: () => void | Promise<void>
  label?: string
  variant?: 'primary' | 'secondary' | 'outline'
  className?: string
}

export function ExportButton({
  onExport,
  label = 'Exportar CSV',
  variant = 'outline',
  className = '',
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      await onExport()
    } catch (e) {
      console.error('Export failed', e)
    } finally {
      setIsExporting(false)
    }
  }

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-secondary text-white hover:bg-secondary/90',
    outline: 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400',
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition shadow-sm ${
        variantStyles[variant]
      } ${isExporting ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
      )}
      {label}
    </button>
  )
}
