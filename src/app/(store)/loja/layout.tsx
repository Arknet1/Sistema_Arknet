import type { ReactNode } from "react"
import { Suspense } from "react"
import LojaHeader from "@/components/loja/loja-header"
import LojaFooter from "@/components/loja/loja-footer"

export default function LojaLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="tema-jmatos min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      <Suspense fallback={<div className="h-28 bg-white border-b border-slate-100" />}>
        <LojaHeader />
      </Suspense>

      <div className="flex-1 flex flex-col">
        {children}
      </div>

      <LojaFooter />
    </div>
  )
}
