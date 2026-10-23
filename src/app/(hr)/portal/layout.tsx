import type { Metadata } from 'next'
import { ToastProvider } from '@/lib/toast-context'

export const metadata: Metadata = {
  title: 'Portal do Colaborador | ARKNET Angola',
  description: 'Área Pessoal e Portal do Funcionário ARKNET Telecom',
}

export default function PortalRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
        {children}
      </div>
    </ToastProvider>
  )
}
