import type { Metadata } from 'next'
import { AuthProvider } from '@/lib/auth-context'
import { ToastProvider } from '@/lib/toast-context'
import { AdminLayoutWrapper } from '@/components/admin/admin-layout'

export const metadata: Metadata = {
  title: 'Painel de Administração | ARKNET',
  description: 'Painel de Gestão Central ARKNET: Produtos, Pedidos de Serviço, Encomendas, Eventos e Clientes',
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
    </ToastProvider>
  )
}
