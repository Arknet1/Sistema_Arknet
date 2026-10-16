/**
 * Informações institucionais da J.Matos Tecnologia ("Soluções Tecnológicas")
 * Utilizado exclusivamente na área /loja do portal, pertencente ao mesmo grupo da ARKNET.
 * Reutiliza os contactos, WhatsApp, email, morada e NIF da fonte de dados central (dataStore).
 */

import { dataStore, CompanySettings } from './data-store'

export interface EmpresaLojaConfig {
  nome: string
  slogan: string
  subtitulo: string
  rotuloVoltar: string
  logo: string
  cores: {
    primaria: string
    destaque: string
    destaqueTexto: string
  }
}

export const JMATOS_CONFIG: EmpresaLojaConfig = {
  nome: 'J.Matos Tecnologia',
  slogan: 'Soluções Tecnológicas',
  subtitulo: 'Loja J.Matos Tecnologia · Grupo ARKNET',
  rotuloVoltar: '← Voltar ao site ARKNET',
  logo: '/images/jmatos.png',
  cores: {
    primaria: '#1E78C2',
    destaque: '#F7941D',
    destaqueTexto: '#0f172a',
  },
}

/**
 * Retorna os dados completos da empresa para a loja, mesclando a identidade J.Matos
 * com os contactos oficiais (telefones, morada, email, NIF) obtidos do dataStore.
 */
export function getLojaCompanyInfo(): CompanySettings & {
  storeName: string
  storeTagline: string
  storeLogo: string
  groupAffiliation: string
  nifOficial: string
} {
  const settings = dataStore.getSettings()
  return {
    ...settings,
    storeName: JMATOS_CONFIG.nome,
    storeTagline: JMATOS_CONFIG.slogan,
    storeLogo: JMATOS_CONFIG.logo,
    groupAffiliation: JMATOS_CONFIG.subtitulo,
    nifOficial: '5412398760',
  }
}

/**
 * Cria a mensagem padronizada para o WhatsApp da Loja J.Matos Tecnologia.
 * Mantém o mesmo número oficial (+244 935 208 449) com prefixo identificador da loja.
 */
export function buildLojaWhatsappMessage(corpo: string): string {
  const prefix = `Loja J.Matos Tecnologia:`
  const trimmed = corpo.trim()
  if (trimmed.startsWith(prefix)) {
    return trimmed
  }
  return `${prefix} ${trimmed}`
}
