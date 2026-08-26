'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  toast: (options: { type?: ToastType; title?: string; message: string; duration?: number }) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ type = 'info', title, message, duration = 4500 }: { type?: ToastType; title?: string; message: string; duration?: number }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      const newToast: Toast = { id, type, title, message, duration }

      setToasts((prev) => [newToast, ...prev].slice(0, 5))

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  const success = useCallback((message: string, title?: string) => toast({ type: 'success', message, title }), [toast])
  const error = useCallback((message: string, title?: string) => toast({ type: 'error', message, title }), [toast])
  const info = useCallback((message: string, title?: string) => toast({ type: 'info', message, title }), [toast])
  const warning = useCallback((message: string, title?: string) => toast({ type: 'warning', message, title }), [toast])

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, info, warning, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((t) => {
            const icons = {
              success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
              error: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />,
              warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
              info: <Info className="h-5 w-5 text-sky-500 shrink-0" />,
            }

            const borderColors = {
              success: 'border-emerald-500/30 bg-emerald-950/90 text-emerald-100',
              error: 'border-rose-500/30 bg-rose-950/90 text-rose-100',
              warning: 'border-amber-500/30 bg-amber-950/90 text-amber-100',
              info: 'border-sky-500/30 bg-slate-900/95 text-slate-100',
            }

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur-md ${borderColors[t.type]}`}
              >
                <div className="mt-0.5">{icons[t.type]}</div>
                <div className="flex-1 min-w-0">
                  {t.title && <h5 className="font-semibold text-sm leading-tight text-white mb-0.5">{t.title}</h5>}
                  <p className="text-xs sm:text-sm leading-relaxed opacity-90 break-words">{t.message}</p>
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-white/60 hover:text-white transition p-1 -mr-1 -mt-1 rounded-lg"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
