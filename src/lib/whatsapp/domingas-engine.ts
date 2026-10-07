/**
 * Motor de Inteligência e Atendimento WhatsApp - Domingas Manuel (ARKNET)
 * Assistente Comercial Oficial da ARKNET (arknet.co.ao)
 * 
 * Versão melhorada com:
 * - Compreensão semântica avançada de intenções do cliente
 * - Memória de sessão (nome, título, tópicos anteriores)
 * - Respostas contextualmente relevantes
 * - Melhor detecção de nomes próprios
 */

import { dataStore, StoreProduct, StoreOrder } from '../data-store'
import { formatProdutoPrice } from '../format-produto-price'
import { sessionStore } from './session-store'

export interface DomingasBotContext {
  senderPhone: string
  senderName?: string
  customerTitle?: string // "Sr." ou "Sra."
  knownName?: string
  lastTopic?: string
  order?: StoreOrder | null
}

export interface BotReplyResult {
  text: string
  suggestedAction?: 'show_catalog' | 'request_payment' | 'escalate_human' | 'order_registered'
  escalateToHuman?: boolean
  recognizedOrderNumber?: string
  extractedCustomerName?: string
  extractedCustomerTitle?: string
}

/**
 * Determina a saudação adequada ao fuso horário de Angola / Luanda (UTC+1)
 */
export function getAngolaGreeting(): string {
  const now = new Date()
  const hours = now.getHours()
  if (hours >= 5 && hours < 12) {
    return 'Bom dia'
  } else if (hours >= 12 && hours < 18) {
    return 'Boa tarde'
  } else {
    return 'Boa noite'
  }
}

/**
 * Verifica se o horário atual está dentro do horário de atendimento (08h às 17h)
 */
export function isWithinWorkingHours(): boolean {
  const now = new Date()
  const hours = now.getHours()
  const day = now.getDay() // 0 = Domingo, 6 = Sábado
  // Domingo fechado, Sábado meio período ou segunda a sexta 08h às 17h
  if (day === 0) return false
  return hours >= 8 && hours < 17
}

/**
 * Formata o tratamento do cliente respeitando a regra:
 * "Sr." ou "Sra." seguido do nome, ou "Exmo(a). Cliente" se o nome for desconhecido
 */
export function formatCustomerSalutation(name?: string, title: string = 'Sr.'): string {
  if (!name || name.trim() === '' || name.toLowerCase() === 'cliente' || name.toLowerCase() === 'desconhecido' || name.toLowerCase() === 'exmo(a). cliente') {
    return 'Exmo(a). Cliente'
  }
  const cleanName = name.trim().replace(/^(sr\.|sra\.|dr\.|dra\.|eng\.|engª\.)\s*/i, '').trim()
  const firstName = cleanName.split(' ')[0]
  if (!firstName) return 'Exmo(a). Cliente'
  return `${title} ${firstName}`
}

/**
 * Normaliza o texto para identificação semântica de intenções
 */
function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Verifica se o texto contém QUALQUER uma das palavras-chave (correspondência flexível)
 */
function matchesAny(norm: string, keywords: string[]): boolean {
  return keywords.some(kw => norm.includes(kw))
}

/**
 * Palavras proibidas como nomes (verbos, saudações, objetos comuns, etc.)
 */
const FORBIDDEN_NAME_WORDS = new Set([
  'ola', 'oi', 'bom', 'boa', 'dia', 'tarde', 'noite', 'ajuda', 'menu', 'inicio', 'sim', 'nao',
  'ok', 'preco', 'precos', 'valor', 'quanto', 'loja', 'produtos', 'equipamentos', 'switch',
  'roteador', 'router', 'cabo', 'obrigado', 'obrigada', 'tchau', 'pedido', 'encomenda',
  'transferencia', 'multicaixa', 'pagamento', 'comprovativo', 'morada', 'entrega', 'orcamento',
  'domingas', 'manuel', 'arknet', 'assistente', 'comercial', 'quero', 'preciso', 'posso',
  'como', 'onde', 'qual', 'que', 'por', 'favor', 'bem', 'mal', 'tudo', 'nada', 'muito',
  'pouco', 'mais', 'menos', 'rede', 'internet', 'wifi', 'servidor', 'camera', 'mikrotik',
  'ubiquiti', 'unifi', 'laptop', 'computador', 'impressora', 'cftv', 'software', 'hardware',
  'gostaria', 'queria', 'poderia', 'voce', 'voces', 'empresa', 'proposta', 'servico', 'servicos',
  'informacao', 'informacoes', 'saber', 'conhecer', 'ver', 'olhar', 'mostrar', 'enviar',
  'receber', 'comprar', 'vender', 'pagar', 'custar', 'dinheiro', 'disponivel', 'disponibilidade',
  'estoque', 'stock', 'modelo', 'marca', 'tipo', 'categoria', 'telefone', 'celular', 'numero',
  'email', 'site', 'pagina', 'web', 'contacto', 'contato', 'ligar', 'agora', 'hoje', 'amanha',
  'ontem', 'semana', 'mes', 'ano', 'hora', 'horas', 'minuto', 'segundo', 'teste', 'testar',
  'teste', 'hello', 'hi', 'hey', 'good', 'morning', 'afternoon', 'evening', 'please', 'thanks',
  'thank', 'you', 'sim', 'claro', 'certo', 'combinado', 'entendi', 'percebi', 'esta',
])

/**
 * Extrai o nome e título do cliente a partir da mensagem quando este se apresenta
 */
export function extractNameFromMessage(text: string): { name: string; title: string; remainderText: string } | null {
  if (!text) return null
  const raw = text.trim()
  const norm = normalizeText(raw)

  // Padrão 1: "sou o/a [Nome]" ou "aqui é o/a [Nome]"
  const souMatch = raw.match(/(?:sou|aqui\s+é|aqui\s+e|trata-se\s+d[oe])\s+(o|a|do|da)?\s*(sr\.|sra\.|dr\.|dra\.|eng\.|engª\.)?\s*([A-ZÀ-Úa-zà-ú]+(?:\s+[A-ZÀ-Úa-zà-ú]+)?)(.*)/i)
  if (souMatch) {
    const article = (souMatch[1] || '').toLowerCase()
    const prefix = souMatch[2] || ''
    const candidateName = souMatch[3]?.trim()
    const remainder = (souMatch[4] || '').trim()

    if (candidateName && !FORBIDDEN_NAME_WORDS.has(normalizeText(candidateName).split(' ')[0])) {
      const isFemale = article === 'a' || article === 'da' || prefix.toLowerCase().includes('sra') || prefix.toLowerCase().includes('dra')
      const title = prefix ? prefix : (isFemale ? 'Sra.' : 'Sr.')
      return { name: candidateName, title, remainderText: remainder }
    }
  }

  // Padrão 2: "me chamo [Nome]", "chamo-me [Nome]", "chamo me [Nome]", "meu nome é/e [Nome]"
  const chamoMatch = raw.match(/(?:me\s+chamo|chamo-me|chamo\s+me|meu\s+nome\s+(?:é|e)|o\s+meu\s+nome\s+(?:é|e)|nome\s+(?:é|e))\s+(sr\.|sra\.|dr\.|dra\.|eng\.)?\s*([A-ZÀ-Úa-zà-ú]+(?:\s+[A-ZÀ-Úa-zà-ú]+)?)(.*)/i)
  if (chamoMatch) {
    const prefix = chamoMatch[1] || ''
    const candidateName = chamoMatch[2]?.trim()
    const remainder = (chamoMatch[3] || '').trim()

    if (candidateName && !FORBIDDEN_NAME_WORDS.has(normalizeText(candidateName).split(' ')[0])) {
      const isFemale = prefix.toLowerCase().includes('sra') || prefix.toLowerCase().includes('dra')
      const title = prefix ? prefix : (isFemale ? 'Sra.' : 'Sr.')
      return { name: candidateName, title, remainderText: remainder }
    }
  }

  // Padrão 3: "pode me chamar de [Nome]" / "pode chamar-me de [Nome]" / "chama-me [Nome]"
  const chamarMatch = raw.match(/(?:pode\s+me\s+chamar|pode\s+chamar-me|chama-me|trata-me\s+por)\s+(?:de\s+)?([A-ZÀ-Úa-zà-ú]+(?:\s+[A-ZÀ-Úa-zà-ú]+)?)(.*)/i)
  if (chamarMatch) {
    const candidateName = chamarMatch[1]?.trim()
    const remainder = (chamarMatch[2] || '').trim()
    if (candidateName && !FORBIDDEN_NAME_WORDS.has(normalizeText(candidateName).split(' ')[0])) {
      return { name: candidateName, title: 'Sr.', remainderText: remainder }
    }
  }

  // Padrão 4: Mensagem curta que é apenas o próprio nome (1-3 palavras, começa com maiúscula)
  // Só usar este padrão se for contexto de apresentação (bot acabou de perguntar o nome)
  const words = raw.split(/\s+/).filter(Boolean)
  if (words.length >= 1 && words.length <= 3) {
    // Verificar se todas as palavras são potencialmente nomes próprios
    const allProperNames = words.every(w => {
      const clean = w.replace(/[^A-Za-zÀ-ÿ]/g, '')
      return clean.length >= 2 && /^[A-ZÀ-Ú]/.test(w) && !FORBIDDEN_NAME_WORDS.has(normalizeText(clean))
    })

    // Verificar caso especial: uma única palavra que pode ser nome
    const singleWord = words.length === 1
    const cleanWord = words[0].replace(/[^A-Za-zÀ-ÿ]/g, '')
    const isSingleProperName = singleWord && cleanWord.length >= 2 && !FORBIDDEN_NAME_WORDS.has(normalizeText(cleanWord))

    if (allProperNames || isSingleProperName) {
      // Verificar que não é uma pergunta ou pedido
      if (!norm.includes('quanto') && !norm.includes('quero') && !norm.includes('onde') && !norm.includes('como') && !norm.includes('?')) {
        const fullName = words.join(' ')
        return { name: fullName, title: 'Sr.', remainderText: '' }
      }
    }
  }

  return null
}

// =========================================================================
// DICIONÁRIO DE INTENÇÕES (Compreensão Semântica Melhorada)
// =========================================================================

type IntentId =
  | 'identity_question'
  | 'human_request'
  | 'complaint'
  | 'quote_request'
  | 'order_status'
  | 'payment_info'
  | 'delivery_info'
  | 'schedule_info'
  | 'product_search'
  | 'category_browse'
  | 'buy_intent'
  | 'gratitude'
  | 'greeting'
  | 'confirmation'
  | 'about_arknet'
  | 'warranty_support'
  | 'service_inquiry'

interface IntentPattern {
  id: IntentId
  keywords: string[]
  /** Se true, basta uma palavra-chave. Se false, precisa de 2+ correspondências para maior confiança */
  singleMatch?: boolean
}

const INTENT_PATTERNS: IntentPattern[] = [
  {
    id: 'identity_question',
    keywords: [
      'es um robo', 'e um robo', 'voce e um robo', 'e uma pessoa',
      'estou a falar com um robo', 'estou a falar com uma pessoa',
      'inteligencia artificial', 'bot ou humano', 'es real',
      'es humana', 'falo com maquina', 'isso e automatico',
    ],
    singleMatch: true,
  },
  {
    id: 'human_request',
    keywords: [
      'falar com uma pessoa', 'falar com atendente', 'falar com humano',
      'passar a um colega', 'operador', 'atendente humano',
      'falar com funcionario', 'quero falar com alguem',
      'atendimento humano', 'operador humano', 'pessoa real',
      'supervisor', 'gerente', 'responsavel',
    ],
    singleMatch: true,
  },
  {
    id: 'complaint',
    keywords: [
      'reclamacao', 'reclamar', 'insatisfeito', 'nao recebi',
      'veio com defeito', 'avaria', 'devolucao', 'reembolso',
      'pedido atrasado', 'problema no pagamento', 'nao funciona',
      'partido', 'danificado', 'estragado', 'errado', 'nao era este',
      'trocar', 'troca', 'devolver',
    ],
    singleMatch: true,
  },
  {
    id: 'quote_request',
    keywords: [
      'orcamento', 'proposta', 'proposta corporativa', 'para empresa',
      'para a minha empresa', 'para escola', 'para o colegio',
      'grandes quantidades', 'revenda', 'atacado', 'por grosso',
      'contrato', 'projeto empresarial', 'licitacao', 'fornecimento',
    ],
    singleMatch: true,
  },
  {
    id: 'order_status',
    keywords: [
      'estado do pedido', 'onde esta o meu pedido', 'como esta o meu pedido',
      'minha encomenda', 'verificar pedido', 'rastrear', 'rastreamento',
      'tracking', 'ja enviaram', 'quando chega', 'ja saiu',
    ],
    singleMatch: true,
  },
  {
    id: 'payment_info',
    keywords: [
      'como pagar', 'formas de pagamento', 'metodos de pagamento',
      'coordenadas bancarias', 'qual e o iban', 'iban', 'multicaixa',
      'mcx', 'transferencia', 'dados bancarios', 'conta bancaria',
      'pix', 'pagamento', 'como faco o pagamento', 'express',
      'referencia de pagamento',
    ],
    singleMatch: true,
  },
  {
    id: 'delivery_info',
    keywords: [
      'fazem entregas', 'onde entregam', 'prazo de entrega',
      'quanto tempo demora', 'onde fica a loja', 'ponto de levantamento',
      'localizacao', 'morada', 'posso levantar', 'entregam em',
      'recolha', 'envio', 'expedicao', 'frete', 'porte', 'custo de entrega',
      'entrega ao domicilio', 'entrega a porta',
    ],
    singleMatch: true,
  },
  {
    id: 'schedule_info',
    keywords: [
      'horario', 'horas de funcionamento', 'ate que horas',
      'estao abertos', 'quando abrem', 'quando fecham',
      'funciona aos sabados', 'domingo', 'feriado',
    ],
    singleMatch: true,
  },
  {
    id: 'buy_intent',
    keywords: [
      'quero comprar', 'como encomendar', 'quero encomendar',
      'fechar pedido', 'finalizar compra', 'quero fazer pedido',
      'adicionar ao carrinho', 'quero adquirir', 'pretendo comprar',
      'gostaria de comprar', 'gostaria de adquirir', 'quero este',
      'quero esse', 'vou levar', 'fico com', 'posso reservar',
    ],
    singleMatch: true,
  },
  {
    id: 'gratitude',
    keywords: [
      'obrigado', 'obrigada', 'muito obrigado', 'agradeco',
      'valeu', 'tchau', 'ate logo', 'adeus', 'ate breve',
      'ate amanha', 'ate ja', 'fique bem', 'bom trabalho',
    ],
    singleMatch: true,
  },
  {
    id: 'confirmation',
    keywords: [
      'sim', 'claro', 'certo', 'combinado', 'entendi', 'percebi',
      'perfeito', 'exato', 'exacto', 'correto', 'isso mesmo',
      'concordo', 'de acordo', 'afirmativo', 'pode ser',
      'tudo bem', 'esta bem', 'ta bem', 'positivo',
    ],
    singleMatch: true,
  },
  {
    id: 'about_arknet',
    keywords: [
      'o que e a arknet', 'quem e a arknet', 'o que fazem',
      'que servicos', 'sobre a empresa', 'sobre a arknet',
      'falar da empresa', 'apresentacao', 'quem sao voces',
      'que tipo de empresa',
    ],
    singleMatch: true,
  },
  {
    id: 'warranty_support',
    keywords: [
      'garantia', 'suporte tecnico', 'assistencia tecnica',
      'reparacao', 'reparar', 'consertar', 'conserto',
      'instalacao', 'configuracao', 'configurar', 'instalar',
      'manutencao',
    ],
    singleMatch: true,
  },
  {
    id: 'service_inquiry',
    keywords: [
      'servico de rede', 'instalacao de rede', 'projeto de rede',
      'ciberseguranca', 'seguranca informatica', 'auditoria',
      'consultoria', 'infraestrutura', 'data center', 'cloud',
      'nuvem', 'backup', 'firewall', 'vpn',
    ],
    singleMatch: true,
  },
  {
    id: 'category_browse',
    keywords: [
      'produtos', 'loja', 'catalogo', 'roteador', 'router',
      'switch', 'cabo', 'cftv', 'camera', 'servidor', 'computador',
      'laptop', 'impressora', 'access point', 'antena', 'rack',
      'ups', 'nobreak', 'poe', 'fibra', 'patch panel', 'conector',
      'mikrotik', 'ubiquiti', 'unifi', 'tp-link', 'hikvision',
      'dahua', 'cisco', 'dell', 'hp', 'lenovo', 'equipamento',
      'equipamentos', 'material', 'materiais', 'o que vendem',
      'o que tem', 'que vendem', 'que tipo de equipamento',
    ],
    singleMatch: true,
  },
  {
    id: 'product_search',
    keywords: [], // Detecção dinâmica via catálogo
    singleMatch: true,
  },
]

/**
 * Detecta a intenção principal do cliente com base no texto normalizado
 */
function detectIntent(norm: string): IntentId | null {
  for (const pattern of INTENT_PATTERNS) {
    if (pattern.id === 'product_search') continue // Tratar separadamente
    if (matchesAny(norm, pattern.keywords)) {
      return pattern.id
    }
  }
  return null
}

/**
 * Verifica se a mensagem é uma simples saudação
 */
function isGreeting(norm: string): boolean {
  const greetingPatterns = [
    /^ol[aá]$/, /^oi$/, /^ol[aá]\b/, /^bom dia\b/, /^boa tarde\b/, /^boa noite\b/,
    /^hey\b/, /^hello\b/, /^hi\b/, /^e ai\b/, /^alo\b/,
  ]
  return greetingPatterns.some(p => p.test(norm)) || norm === 'menu' || norm === 'inicio' || norm === 'ajuda'
}

/**
 * Motor central de processamento de mensagens de Domingas Manuel
 * Agora com memória de sessão e compreensão semântica melhorada
 */
export function generateDomingasResponse(
  message: string,
  context: DomingasBotContext
): BotReplyResult {
  const norm = normalizeText(message)
  const greeting = getAngolaGreeting()
  const phone = context.senderPhone

  // 1. Obter sessão existente ou criar nova
  const session = sessionStore.getSession(phone)

  // 2. Registar mensagem do cliente na sessão
  sessionStore.addMessage(phone, 'customer', message)

  // 3. Extração dinâmica de apresentação de nome do cliente
  const extracted = extractNameFromMessage(message)

  // 4. Usar nome da sessão se disponível, senão do contexto
  let activeName = session.clientName || context.senderName
  let activeTitle = session.clientTitle || context.customerTitle || 'Sr.'

  if (extracted) {
    activeName = extracted.name
    activeTitle = extracted.title
    // Persistir na sessão para lembrar nas próximas mensagens
    sessionStore.updateClient(phone, { name: extracted.name, title: extracted.title })
  }

  const salutation = formatCustomerSalutation(activeName, activeTitle)
  const isGenericClient = salutation === 'Exmo(a). Cliente'

  const products = dataStore.getProducts()
  const settings = dataStore.getSettings()

  // ---------- HELPER: Registar resposta no histórico ----------
  function makeReply(result: BotReplyResult): BotReplyResult {
    sessionStore.addMessage(phone, 'bot', result.text)
    if (extracted) {
      result.extractedCustomerName = activeName
      result.extractedCustomerTitle = activeTitle
    }
    return result
  }

  // =========================================================================
  // A. APRESENTAÇÃO DO CLIENTE (com ou sem pergunta adicional)
  // =========================================================================
  if (extracted && (!extracted.remainderText || extracted.remainderText.length < 5)) {
    const pronoun = activeTitle.toLowerCase().includes('sra') ? 'a' : 'o'
    return makeReply({
      text: `Muito prazer, ${salutation}! Chamo-me Domingas Manuel e sou Assistente Comercial da ARKNET. Em que ${pronoun} posso apoiar hoje?`,
      extractedCustomerName: activeName,
      extractedCustomerTitle: activeTitle,
    })
  }

  // Se o cliente se apresentou E fez uma pergunta, usar o texto restante como mensagem
  const effectiveMessage = extracted && extracted.remainderText.length >= 5
    ? extracted.remainderText
    : message
  const effectiveNorm = normalizeText(effectiveMessage)

  // =========================================================================
  // B. DETECÇÃO DE INTENÇÃO
  // =========================================================================
  const intent = detectIntent(effectiveNorm)

  // -------------------------------------------------------------------------
  // 1. VERIFICAÇÃO DE PERGUNTA DIRETA SOBRE HUMANO OU ROBÔ / IDENTIDADE
  // -------------------------------------------------------------------------
  if (intent === 'identity_question') {
    return makeReply({
      text: `Sou a Domingas Manuel, assistente virtual da ARKNET. Estou aqui para lhe prestar todo o apoio com rigor e rapidez, ${salutation}. Se preferir falar diretamente com um dos nossos colaboradores, posso transferir a conversa de imediato.`,
      escalateToHuman: false,
    })
  }

  // -------------------------------------------------------------------------
  // 2. PEDIDO EXPLÍCITO DE FALAR COM ATENDIMENTO HUMANO / OPERADOR
  // -------------------------------------------------------------------------
  if (intent === 'human_request') {
    sessionStore.setBotState(phone, 'needs_human')
    return makeReply({
      text: `Compreendo perfeitamente, ${salutation}. Vou encaminhar a conversa para um dos nossos colaboradores comerciais, que dará seguimento ao seu atendimento. Pedimos-lhe apenas que aguarde alguns instantes.`,
      escalateToHuman: true,
      suggestedAction: 'escalate_human',
    })
  }

  // -------------------------------------------------------------------------
  // 3. RECLAMAÇÃO OU PROBLEMA
  // -------------------------------------------------------------------------
  if (intent === 'complaint') {
    sessionStore.setBotState(phone, 'needs_human')
    sessionStore.setLastTopic(phone, 'reclamação')
    return makeReply({
      text: `Lamento sinceramente o transtorno, ${salutation}, e agradeço que nos tenha informado. Vou encaminhar o seu caso de imediato ao departamento responsável para que seja resolvido com a máxima brevidade. Será contactado(a) em breve pela nossa equipa.`,
      escalateToHuman: true,
      suggestedAction: 'escalate_human',
    })
  }

  // -------------------------------------------------------------------------
  // 4. ORÇAMENTO PARA EMPRESAS / REVENDA / GRANDES QUANTIDADES
  // -------------------------------------------------------------------------
  if (intent === 'quote_request') {
    sessionStore.setLastTopic(phone, 'orçamento')
    return makeReply({
      text: `Agradecemos o interesse em trabalhar com a ARKNET, ${salutation}. Para este tipo de solução preparamos uma proposta personalizada. Pode indicar-me o nome da sua instituição, os equipamentos pretendidos e as quantidades estimadas?`,
      suggestedAction: 'escalate_human',
    })
  }

  // -------------------------------------------------------------------------
  // 5. CONSULTA DE ESTADO DE PEDIDO (#PED-...)
  // -------------------------------------------------------------------------
  const orderRegex = /(?:ped[-\s]?\d{4}[-\s]?\d+|#?[a-z]{3,4}[-\s]?\d{4,}[-\s]?\d*|ped[-\s]?\d+|#\d{4,})/i
  const orderMatch = effectiveMessage.match(orderRegex)

  if (orderMatch || intent === 'order_status') {
    const rawNumber = orderMatch ? orderMatch[0].replace(/^#/, '').trim() : null
    let foundOrder = rawNumber ? dataStore.findOrderByNumberOrPhone(rawNumber) : context.order

    if (!foundOrder && context.senderPhone) {
      foundOrder = dataStore.findOrderByNumberOrPhone(context.senderPhone)
    }

    if (foundOrder) {
      const statusLabels: Record<string, string> = {
        novo: 'registado e aguarda validação de comprovativo',
        em_contacto: 'em conferência bancária pela equipa financeira',
        fechado: 'pago e confirmado, pronto para entrega/levantamento',
        cancelado: 'cancelado',
      }
      const statusDesc = statusLabels[foundOrder.status] || foundOrder.status
      sessionStore.setLastTopic(phone, 'estado do pedido')
      sessionStore.setActiveOrder(phone, foundOrder.orderNumber)
      return makeReply({
        text: `O seu pedido #${foundOrder.orderNumber} encontra-se ${statusDesc}, ${salutation}. Caso necessite de agilizar a entrega ou alterar algum detalhe, terei todo o gosto em ajudar.`,
        recognizedOrderNumber: foundOrder.orderNumber,
      })
    } else if (rawNumber) {
      return makeReply({
        text: `Não consegui localizar um pedido ativo com o número #${rawNumber}, ${salutation}. Peço a gentileza de confirmar os dígitos do número de encomenda ou o nome utilizado na compra.`,
      })
    } else {
      return makeReply({
        text: `Com todo o gosto verifico o estado do seu pedido, ${salutation}. Pode indicar-me o número que lhe foi atribuído no momento do registo (ex.: #PED-2026-0001)?`,
      })
    }
  }

  // -------------------------------------------------------------------------
  // 6. DADOS BANCÁRIOS E FORMAS DE PAGAMENTO
  // -------------------------------------------------------------------------
  if (intent === 'payment_info') {
    sessionStore.setLastTopic(phone, 'pagamento')
    return makeReply({
      text: `O pagamento pode ser efetuado por Multicaixa Express (935 208 449) ou Transferência Bancária para a conta da ARKNET TECNOLOGIA LDA, ${salutation}. Após a operação, agradeço que me envie o comprovativo por aqui para darmos seguimento imediato.`,
      suggestedAction: 'request_payment',
    })
  }

  // -------------------------------------------------------------------------
  // 7. ZONAS E PRAZOS DE ENTREGA
  // -------------------------------------------------------------------------
  if (intent === 'delivery_info') {
    sessionStore.setLastTopic(phone, 'entrega')
    return makeReply({
      text: `Realizamos entregas em toda a província de Luanda no prazo de 24h a 48h úteis e enviamos para as restantes províncias, ${salutation}. Dispomos também de ponto de levantamento em Luanda, no Kilamba KK5000. Deseja receber no seu endereço ou prefere efetuar o levantamento presencial?`,
    })
  }

  // -------------------------------------------------------------------------
  // 8. HORÁRIO DE ATENDIMENTO
  // -------------------------------------------------------------------------
  if (intent === 'schedule_info') {
    return makeReply({
      text: `O nosso horário de atendimento comercial é de segunda a sexta-feira, das 08h às 17h, ${salutation}. Estamos à sua disposição para o apoiar na escolha e aquisição dos seus equipamentos.`,
    })
  }

  // -------------------------------------------------------------------------
  // 9. SOBRE A ARKNET
  // -------------------------------------------------------------------------
  if (intent === 'about_arknet') {
    sessionStore.setLastTopic(phone, 'empresa')
    return makeReply({
      text: `A ARKNET é uma empresa angolana especializada em telecomunicações e tecnologia, ${salutation}. Oferecemos soluções completas de redes, cibersegurança, infraestrutura de TI, CFTV, e dispomos de uma Loja Online com equipamentos de marcas de referência como MikroTik, Ubiquiti, Cisco, entre outras. Posso apresentar-lhe os nossos produtos ou serviços em detalhe!`,
    })
  }

  // -------------------------------------------------------------------------
  // 10. GARANTIA / SUPORTE TÉCNICO
  // -------------------------------------------------------------------------
  if (intent === 'warranty_support') {
    sessionStore.setLastTopic(phone, 'suporte')
    return makeReply({
      text: `A ARKNET oferece garantia nos equipamentos comercializados e dispomos de uma equipa técnica para instalação, configuração e suporte, ${salutation}. Para agilizar o seu pedido de assistência, pode indicar-me o equipamento em questão e o tipo de apoio necessário?`,
    })
  }

  // -------------------------------------------------------------------------
  // 11. SERVIÇOS DE REDE / INFRAESTRUTURA / CONSULTORIA
  // -------------------------------------------------------------------------
  if (intent === 'service_inquiry') {
    sessionStore.setLastTopic(phone, 'serviços')
    return makeReply({
      text: `Temos uma equipa especializada em projetos de rede, cibersegurança, data centers e infraestrutura de TI, ${salutation}. Pode consultar todos os nossos serviços em https://arknet.co.ao/servicos. Gostaria que lhe apresentasse uma solução específica ou pretende um orçamento personalizado?`,
    })
  }

  // -------------------------------------------------------------------------
  // 12. PESQUISA ESPECÍFICA DE PRODUTOS NO CATÁLOGO
  // -------------------------------------------------------------------------
  const matchingProduct = findRelevantProduct(effectiveNorm, products)

  if (matchingProduct) {
    const formattedPrice = matchingProduct.price !== null && matchingProduct.price !== undefined
      ? `${matchingProduct.price.toLocaleString('pt-AO')} Kz`
      : 'sob consulta'

    sessionStore.setLastTopic(phone, `produto: ${matchingProduct.name}`)

    // Se perguntou explicitamente pelo preço
    if (effectiveNorm.includes('preco') || effectiveNorm.includes('quanto custa') || effectiveNorm.includes('valor') || effectiveNorm.includes('quanto e')) {
      return makeReply({
        text: `O produto "${matchingProduct.name}" tem o valor de ${formattedPrice}, ${salutation}. Se desejar, posso enviar-lhe a ligação com as fotografias, especificações técnicas completas e cores disponíveis.`,
        suggestedAction: 'show_catalog',
      })
    }

    // Se perguntou por disponibilidade / características
    return makeReply({
      text: `${salutation}, temos o "${matchingProduct.name}" disponível na nossa loja por ${formattedPrice}. Para lhe sugerir a configuração mais adequada, o equipamento destina-se a uso pessoal, profissional ou empresarial?`,
      suggestedAction: 'show_catalog',
    })
  }

  // -------------------------------------------------------------------------
  // 13. CATEGORIAS GERAIS DE PRODUTOS
  // -------------------------------------------------------------------------
  if (intent === 'category_browse') {
    sessionStore.setLastTopic(phone, 'catálogo')
    return makeReply({
      text: `Dispomos de uma linha completa de equipamentos de rede, servidores, cibersegurança e informática na nossa Loja Online (https://arknet.co.ao/loja), ${salutation}. Procura algum modelo em específico ou gostaria que lhe apresentasse as opções mais recomendadas?`,
      suggestedAction: 'show_catalog',
    })
  }

  // -------------------------------------------------------------------------
  // 14. INTENÇÃO DE COMPRA / FINALIZAÇÃO DE PEDIDO
  // -------------------------------------------------------------------------
  if (intent === 'buy_intent') {
    sessionStore.setLastTopic(phone, 'compra')
    sessionStore.setBotState(phone, 'ordering')
    return makeReply({
      text: `Excelente escolha, ${salutation}! Para avançarmos com o registo do seu pedido, agradeço que me confirme o seu nome completo e o bairro ou município para a entrega.`,
      suggestedAction: 'order_registered',
    })
  }

  // -------------------------------------------------------------------------
  // 15. CONFIRMAÇÃO (sim, ok, certo, etc.) - RESPOSTA CONTEXTUAL
  // -------------------------------------------------------------------------
  if (intent === 'confirmation') {
    const lastTopic = session.lastTopic
    if (lastTopic) {
      if (lastTopic.startsWith('produto:')) {
        const productName = lastTopic.replace('produto: ', '')
        return makeReply({
          text: `Perfeito, ${salutation}! Posso então avançar com o registo do pedido do "${productName}". Para isso, preciso do seu nome completo, contacto telefónico e endereço de entrega.`,
          suggestedAction: 'order_registered',
        })
      }
      if (lastTopic === 'catálogo') {
        return makeReply({
          text: `Ótimo, ${salutation}! Pode consultar todos os nossos produtos em https://arknet.co.ao/loja. Indique-me a categoria ou tipo de equipamento que procura e apresento-lhe as melhores opções.`,
          suggestedAction: 'show_catalog',
        })
      }
      if (lastTopic === 'pagamento') {
        return makeReply({
          text: `Perfeito, ${salutation}! Assim que efetuar o pagamento, envie-nos o comprovativo (foto ou PDF) por aqui e daremos seguimento imediato ao processamento.`,
        })
      }
      if (lastTopic === 'entrega') {
        return makeReply({
          text: `Muito bem, ${salutation}! Para agendar a entrega, indique-me o bairro ou município de destino e o período mais conveniente (manhã ou tarde).`,
        })
      }
    }
    // Confirmação genérica
    return makeReply({
      text: `Entendido, ${salutation}! Posso ajudar com mais alguma questão sobre os nossos produtos, serviços ou encomendas?`,
    })
  }

  // -------------------------------------------------------------------------
  // 16. AGRADECIMENTOS E DESPEDIDAS
  // -------------------------------------------------------------------------
  if (intent === 'gratitude') {
    const periodName = greeting === 'Bom dia' ? 'manhã' : greeting === 'Boa tarde' ? 'tarde' : 'noite'
    return makeReply({
      text: `Agradeço o seu contacto, ${salutation}. Fico à sua total disposição para qualquer esclarecimento adicional. Tenha uma excelente ${periodName}! 😊`,
    })
  }

  // -------------------------------------------------------------------------
  // 17. SAUDAÇÃO INICIAL
  // -------------------------------------------------------------------------
  if (isGreeting(effectiveNorm) || effectiveNorm.length < 8) {
    if (isGenericClient) {
      return makeReply({
        text: `${greeting}! Chamo-me Domingas Manuel e sou Assistente Comercial da ARKNET. Será um prazer ajudá-lo(a). Pode indicar-me o seu nome e em que assunto o posso apoiar hoje?`,
      })
    } else {
      return makeReply({
        text: `${greeting}, ${salutation}! Que bom receber a sua mensagem. Como posso ser útil no seu pedido ou esclarecimento hoje?`,
      })
    }
  }

  // -------------------------------------------------------------------------
  // 18. TENTATIVA FINAL: Compreensão com base no último tópico da sessão
  // -------------------------------------------------------------------------
  const lastTopic = session.lastTopic
  if (lastTopic && effectiveNorm.length > 5) {
    // Se o último tópico foi sobre um produto e o cliente está a dar mais detalhes
    if (lastTopic.startsWith('produto:') || lastTopic === 'catálogo') {
      // Tentar encontrar um novo produto mencionado
      const newProduct = findRelevantProduct(effectiveNorm, products)
      if (newProduct) {
        const formattedPrice = newProduct.price !== null && newProduct.price !== undefined
          ? `${newProduct.price.toLocaleString('pt-AO')} Kz`
          : 'sob consulta'
        sessionStore.setLastTopic(phone, `produto: ${newProduct.name}`)
        return makeReply({
          text: `Temos o "${newProduct.name}" disponível por ${formattedPrice}, ${salutation}. Deseja saber mais detalhes técnicos ou avançar com a encomenda?`,
          suggestedAction: 'show_catalog',
        })
      }

      // Assume que está a detalhar a necessidade
      return makeReply({
        text: `Obrigada pela informação, ${salutation}. Para lhe indicar o equipamento mais adequado, pode precisar-me o tipo de utilização pretendida (doméstica, empresarial, escritório)? Desta forma consigo recomendar a solução ideal.`,
        suggestedAction: 'show_catalog',
      })
    }

    // Se o último tópico foi sobre pagamento ou entrega
    if (lastTopic === 'pagamento' || lastTopic === 'entrega' || lastTopic === 'estado do pedido' || lastTopic === 'compra') {
      return makeReply({
        text: `Obrigada pela informação, ${salutation}. Vou registar os detalhes e encaminho para a equipa responsável dar seguimento. Há mais alguma questão em que o possa ajudar?`,
      })
    }
  }

  // -------------------------------------------------------------------------
  // 19. MENSAGEM POUCO CLARA / RESPOSTA PADRÃO POLIDA E ÚTIL
  // -------------------------------------------------------------------------
  // Resposta mais inteligente que oferece opções concretas
  return makeReply({
    text: `${salutation}, agradeço a sua mensagem. Posso ajudá-lo(a) com:\n\n` +
      `📦 *Produtos e Preços* — Consultar o nosso catálogo de equipamentos\n` +
      `📋 *Estado de Pedido* — Verificar o andamento da sua encomenda\n` +
      `💳 *Pagamento* — Dados bancários e formas de pagamento\n` +
      `🚚 *Entrega* — Zonas e prazos de entrega\n` +
      `🛠️ *Suporte Técnico* — Assistência e garantia\n\n` +
      `Indique o assunto pretendido e terei todo o gosto em apoiar!`,
  })
}

/**
 * Procura um produto no catálogo com base nas palavras-chave do utilizador
 */
function findRelevantProduct(norm: string, products: StoreProduct[]): StoreProduct | null {
  if (!products || products.length === 0) return null

  // Palavras muito comuns que não devem ser usadas para match de produto
  const tooCommon = new Set(['para', 'com', 'mais', 'portas', 'rede', 'tipo', 'este', 'esse', 'aquele', 'algum', 'outro'])

  let bestMatch: StoreProduct | null = null
  let bestScore = 0

  for (const p of products) {
    const pNorm = normalizeText(p.name)

    // 1. Nome exato contido na mensagem
    if (norm.includes(pNorm)) {
      return p // Match perfeito
    }

    // 2. Pontuação por palavras-chave do produto presentes na mensagem
    const words = pNorm.split(/\s+/).filter((w) => w.length > 3 && !tooCommon.has(w))
    let score = 0
    for (const w of words) {
      if (norm.includes(w)) {
        score += w.length // Palavras maiores valem mais
      }
    }

    // 3. Verificar modelo/código (ex: "ccr2004", "hap ac3", "usw-24")
    const modelWords = pNorm.split(/\s+/).filter((w) => /\d/.test(w) && w.length > 2)
    for (const m of modelWords) {
      if (norm.includes(m)) {
        score += 20 // Modelos específicos têm peso alto
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestMatch = p
    }
  }

  // Requerer pontuação mínima para evitar falsos positivos
  if (bestScore >= 4) {
    return bestMatch
  }

  // 3. Procura por categoria como fallback
  for (const p of products) {
    const catNorm = normalizeText(p.category)
    if (catNorm.length > 3 && norm.includes(catNorm)) {
      return p
    }
  }

  return null
}
