import React from 'react'
import Link from 'next/link'
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft, Building2, Mail, Phone } from 'lucide-react'

export const metadata = {
  title: 'Política de Privacidade e Proteção de Dados | ARKNET Tecnologia',
  description: 'Conheça os termos de recolha, tratamento e segurança dos seus dados pessoais na ARKNET Tecnologia, LDA.',
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar à Página Principal
        </Link>

        {/* Header Banner */}
        <div className="bg-[#080e1e] text-white p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary-200 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Conformidade Legal & Segurança
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Política de Privacidade e Proteção de Dados
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              A <strong>ARKNET TECNOLOGIA, LDA.</strong> assume o compromisso rigoroso com a privacidade, confidencialidade e proteção dos dados pessoais dos seus clientes, parceiros e visitantes.
            </p>
            <p className="text-xs text-slate-400 mt-4">
              Última atualização: Outubro de 2026 | Luanda, República de Angola
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8 text-sm text-slate-700 leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              1. Entidade Responsável pelo Tratamento
            </h2>
            <p>
              A entidade responsável pela recolha e tratamento dos dados pessoais através desta plataforma é a <strong>ARKNET TECNOLOGIA, LDA.</strong>, sociedade comercial com sede em Luanda, Angola, NIF 5001239840.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
              <p><strong>Correio Eletrónico de Privacidade:</strong> privacidade@arknet.ao / comercial@arknet.ao</p>
              <p><strong>Linha de Apoio:</strong> +244 935 208 449 / +244 947 500 000</p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              2. Dados Recolhidos e Finalidades
            </h2>
            <p>
              Recolhemos exclusivamente os dados estritamente necessários para prestar os nossos serviços e responder a solicitações dos utilizadores:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Formulário de Reclamações e Pedidos de Informação:</strong> Nome, endereço de e-mail, número de telefone (opcional), número de encomenda (opcional) e conteúdo da mensagem, com a finalidade exclusiva de prestar assistência técnica, responder a pedidos e auditar a qualidade do serviço.
              </li>
              <li>
                <strong>Loja Online e Encomendas:</strong> Nome, dados de contacto, NIF (opcional) e morada de entrega para processamento e faturação legal de pedidos.
              </li>
              <li>
                <strong>Segurança & Prevenção de Abusos:</strong> Registo de identificadores criptográficos (hash de IP) para prevenção de ataques automatizados (spam e bots).
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              3. Armazenamento, Sigilo e Não-Transmissão a Terceiros
            </h2>
            <p>
              A ARKNET não comercializa, não aluga e não partilha os seus dados pessoais com entidades terceiras para fins de publicidade. Os dados submetidos no canal de reclamações são de acesso reservado e restrito aos operadores e administradores devidamente autorizados.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              4. Direitos dos Titulares dos Dados (Acesso, Retificação e Anonimização)
            </h2>
            <p>
              Nos termos da legislação em vigor, o utilizador tem o direito de solicitar a qualquer momento:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Confirmação da existência de tratamento dos seus dados;</li>
              <li>Acesso aos seus dados pessoais arquivados;</li>
              <li>Retificação de dados incorretos ou desatualizados;</li>
              <li>Anonimização ou eliminação definitiva dos seus registos no sistema.</li>
            </ul>
            <p className="mt-2">
              Para exercer qualquer destes direitos, basta contactar-nos através do e-mail <strong>privacidade@arknet.ao</strong> ou submeter um pedido através do nosso canal de <Link href="/reclamacoes" className="text-primary font-bold hover:underline">Reclamações e Apoio</Link>.
            </p>
          </section>

        </div>

      </div>
    </div>
  )
}
