import React from 'react'
import { Metadata } from 'next'
import ReclamacoesClient from './reclamacoes-client'

export const metadata: Metadata = {
  title: 'Canal de Reclamações e Pedidos de Informação | ARKNET Tecnologia',
  description:
    'Submeta a sua reclamação ou pedido de informação de forma oficial à equipa da ARKNET. Acompanhamento rigoroso e resposta em 24h a 48h úteis.',
}

export default function ReclamacoesPage() {
  return <ReclamacoesClient />
}
