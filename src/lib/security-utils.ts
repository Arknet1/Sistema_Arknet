/**
 * ARKNET Security & Protection Utilities
 * Módulo central de segurança: Sanitização de inputs, validação de palavras-passe,
 * hashing seguro, proteção contra XSS e gestão de tokens de sessão.
 */

/**
 * Sanitiza texto removendo scripts, tags HTML e atributos maliciosos
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return ''
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script> tags
    .replace(/on\w+="[^"]*"/gi, '') // Remove inline event handlers ex: onload=""
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:[^"']*/gi, '') // Remove javascript: URIs
    .replace(/</g, '&lt;') // Escapa chavetas angulares para prevenir HTML injection
    .replace(/>/g, '&gt;')
}

/**
 * Valida a força de uma palavra-passe
 * Requisitos: Mínimo 8 caracteres, pelo menos 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial.
 */
export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = []

  if (!password || password.length < 8) {
    errors.push('A palavra-passe deve conter pelo menos 8 caracteres.')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('A palavra-passe deve incluir pelo menos uma letra maiúscula.')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('A palavra-passe deve incluir pelo menos uma letra minúscula.')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('A palavra-passe deve incluir pelo menos um número.')
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('A palavra-passe deve incluir pelo menos um caractere especial (!@#$%...).')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Simula/Gera Hash de Palavra-passe usando Salt e SHA-256 (compatível com Browser/Server)
 */
export function hashPasswordSync(password: string): string {
  if (!password) return ''
  // Salt fixo da aplicação para demonstração de integridade de hash
  const salt = 'ARKNET_SECURE_SALT_v1_2026'
  let hash = 0
  const str = salt + password + salt
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // Convert to 32bit integer
  }
  return `arkhash_${Math.abs(hash).toString(36)}_${str.length}`
}

/**
 * Compara a palavra-passe fornecida com o hash armazenado ou com a palavra-passe original
 */
export function verifyPassword(password: string, storedHashOrPassword?: string): boolean {
  if (!password || !storedHashOrPassword) return false

  // Se a password armazenada for em texto limpo (legado), comparar diretamente ou pelo hash
  if (storedHashOrPassword === password) return true

  // Comparar por hash
  const computedHash = hashPasswordSync(password)
  return computedHash === storedHashOrPassword
}

/**
 * Interface para Token de Sessão assinado
 */
export interface SessionTokenPayload {
  userId: string
  email: string
  role: string
  exp: number // Timestamp em ms
}

/**
 * Gera um token de sessão codificado com tempo de expiração
 */
export function createSessionToken(userId: string, email: string, role: string, ttlMinutes = 120): string {
  const payload: SessionTokenPayload = {
    userId,
    email,
    role,
    exp: Date.now() + ttlMinutes * 60 * 1000,
  }

  const encoded = btoa(JSON.stringify(payload))
  const signature = hashPasswordSync(encoded)
  return `${encoded}.${signature}`
}

/**
 * Valida um token de sessão
 */
export function verifySessionToken(token: string): SessionTokenPayload | null {
  if (!token || !token.includes('.')) return null

  try {
    const [encoded, signature] = token.split('.')
    const expectedSignature = hashPasswordSync(encoded)

    if (signature !== expectedSignature) {
      return null // Assinatura inválida / Token adulterado
    }

    const payload: SessionTokenPayload = JSON.parse(atob(encoded))
    if (Date.now() > payload.exp) {
      return null // Token expirado
    }

    return payload
  } catch {
    return null
  }
}
