import type { Metadata } from 'next'
import EmpresaClient from './empresa-client'

export const metadata: Metadata = {
  title: 'Sobre a ARKNET | Inovação, Conectividade e Transformação Digital',
  description: 'Conheça a história, a missão, a visão e o compromisso da ARKNET com a excelência em telecomunicações e serviços de TI em Angola.',
}

export default function Page() {
  return <EmpresaClient />
}
