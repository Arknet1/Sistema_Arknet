'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ClienteLoginRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login')
  }, [router])

  return (
    <main className="min-h-screen pt-32 pb-20 bg-slate-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">A aceder ao Centro de Autenticação...</p>
      </div>
    </main>
  )
}
