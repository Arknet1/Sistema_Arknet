import { NextRequest, NextResponse } from 'next/server'

interface RateLimitRecord {
  count: number
  resetTime: number
}

// Armazenamento em memória com limpeza automática de itens expirados
const rateLimitStore = new Map<string, RateLimitRecord>()

// Limpeza periódica de memória a cada 10 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }, 10 * 60 * 1000)
}

export interface RateLimitOptions {
  /** Quantidade máxima de pedidos permitidos na janela de tempo */
  limit: number
  /** Duração da janela em segundos */
  windowSeconds: number
  /** Prefixo do tipo de rota para evitar colisões entre endpoints */
  prefix?: string
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetInSeconds: number
}

/**
 * Obtém o IP do cliente a partir dos cabeçalhos da requisição
 */
export function getClientIp(request: NextRequest | Request): string {
  const headers = request.headers
  const xForwardedFor = headers.get('x-forwarded-for')
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }
  const xRealIp = headers.get('x-real-ip')
  if (xRealIp) {
    return xRealIp.trim()
  }
  const cfConnectingIp = headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp.trim()
  }
  return '127.0.0.1'
}

/**
 * Verifica e aplica o limite de requisições
 */
export function checkRateLimit(
  request: NextRequest | Request,
  options: RateLimitOptions
): RateLimitResult {
  const ip = getClientIp(request)
  const prefix = options.prefix || 'global'
  const key = `${prefix}:${ip}`
  const now = Date.now()
  const windowMs = options.windowSeconds * 1000

  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    // Nova janela
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    })
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      resetInSeconds: options.windowSeconds,
    }
  }

  if (record.count >= options.limit) {
    const resetInSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000))
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      resetInSeconds,
    }
  }

  record.count += 1
  const resetInSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000))
  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - record.count,
    resetInSeconds,
  }
}

/**
 * Gera uma resposta HTTP 429 Too Many Requests padronizada em português
 */
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message: `Limite de tentativas excedido. Por favor, aguarde ${result.resetInSeconds} segundos antes de tentar novamente.`,
      retryAfter: result.resetInSeconds,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.resetInSeconds),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': '0',
      },
    }
  )
}
