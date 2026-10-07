/**
 * Armazém de sessões de conversa do Bot WhatsApp ARKNET
 * Mantém o contexto do cliente (nome, título, tópicos, histórico) por número de telefone
 * para que o bot recorde informações entre mensagens na mesma conversa.
 */

export interface ConversationSession {
  /** Número de telefone do cliente (chave da sessão) */
  phone: string
  /** Nome do cliente (extraído da conversa ou fornecido) */
  clientName?: string
  /** Tratamento: "Sr." ou "Sra." */
  clientTitle?: string
  /** Último tópico abordado */
  lastTopic?: string
  /** Número do pedido em contexto, se houver */
  activeOrderNumber?: string
  /** Histórico de mensagens da sessão (últimas N mensagens) */
  messages: SessionMessage[]
  /** Data/hora de criação */
  createdAt: string
  /** Data/hora da última mensagem */
  updatedAt: string
  /** Estado do bot nesta sessão */
  botState?: 'greeting' | 'identified' | 'browsing' | 'ordering' | 'waiting_receipt' | 'needs_human'
}

export interface SessionMessage {
  role: 'customer' | 'bot'
  text: string
  timestamp: string
}

const MAX_SESSION_MESSAGES = 30
const SESSION_TIMEOUT_MS = 4 * 60 * 60 * 1000 // 4 horas

/**
 * Armazém de sessões em memória (em produção, usar Redis ou similar)
 */
class WhatsAppSessionStore {
  private sessions: Map<string, ConversationSession> = new Map()

  /**
   * Normaliza o número de telefone para usar como chave de sessão
   */
  private normalizePhone(phone: string): string {
    return (phone || '').replace(/\D/g, '')
  }

  /**
   * Obtém ou cria uma sessão para o número de telefone indicado
   */
  getSession(phone: string): ConversationSession {
    const key = this.normalizePhone(phone)
    const existing = this.sessions.get(key)

    // Se existe e não expirou, devolver
    if (existing) {
      const elapsed = Date.now() - new Date(existing.updatedAt).getTime()
      if (elapsed < SESSION_TIMEOUT_MS) {
        return existing
      }
      // Sessão expirada: limpar
      this.sessions.delete(key)
    }

    // Criar nova sessão
    const now = new Date().toISOString()
    const session: ConversationSession = {
      phone: key,
      messages: [],
      createdAt: now,
      updatedAt: now,
      botState: 'greeting',
    }
    this.sessions.set(key, session)
    return session
  }

  /**
   * Atualiza os dados do cliente na sessão
   */
  updateClient(phone: string, data: { name?: string; title?: string }): void {
    const session = this.getSession(phone)
    if (data.name) session.clientName = data.name
    if (data.title) session.clientTitle = data.title
    if (data.name) session.botState = 'identified'
    session.updatedAt = new Date().toISOString()
  }

  /**
   * Adiciona uma mensagem ao histórico da sessão
   */
  addMessage(phone: string, role: 'customer' | 'bot', text: string): void {
    const session = this.getSession(phone)
    session.messages.push({
      role,
      text,
      timestamp: new Date().toISOString(),
    })
    // Limitar tamanho do histórico
    if (session.messages.length > MAX_SESSION_MESSAGES) {
      session.messages = session.messages.slice(-MAX_SESSION_MESSAGES)
    }
    session.updatedAt = new Date().toISOString()
  }

  /**
   * Atualiza o último tópico discutido
   */
  setLastTopic(phone: string, topic: string): void {
    const session = this.getSession(phone)
    session.lastTopic = topic
    session.updatedAt = new Date().toISOString()
  }

  /**
   * Define o pedido ativo na sessão
   */
  setActiveOrder(phone: string, orderNumber: string): void {
    const session = this.getSession(phone)
    session.activeOrderNumber = orderNumber
    session.botState = 'ordering'
    session.updatedAt = new Date().toISOString()
  }

  /**
   * Define o estado do bot na sessão
   */
  setBotState(phone: string, state: ConversationSession['botState']): void {
    const session = this.getSession(phone)
    session.botState = state
    session.updatedAt = new Date().toISOString()
  }

  /**
   * Verifica se é a primeira mensagem do cliente nesta sessão
   */
  isFirstMessage(phone: string): boolean {
    const session = this.getSession(phone)
    return session.messages.filter(m => m.role === 'customer').length === 0
  }

  /**
   * Limpa a sessão (ex.: após escalar para humano)
   */
  clearSession(phone: string): void {
    const key = this.normalizePhone(phone)
    this.sessions.delete(key)
  }

  /**
   * Obtém o resumo do histórico recente para contexto
   */
  getRecentContext(phone: string, lastN: number = 6): string {
    const session = this.getSession(phone)
    const recent = session.messages.slice(-lastN)
    return recent
      .map(m => `${m.role === 'customer' ? 'Cliente' : 'Domingas'}: ${m.text}`)
      .join('\n')
  }
}

// Exportar instância singleton
export const sessionStore = new WhatsAppSessionStore()
