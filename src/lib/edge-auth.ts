export interface EdgeSessionPayload {
  userId: string
  email: string
  role: string
  exp: number
}

let _authSecretWarned = false

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    if (!_authSecretWarned) {
      _authSecretWarned = true
      console.warn('[ARKNET SEGURANÇA] AUTH_SECRET não definido! A usar chave de fallback (inseguro em produção).')
    }
    return 'arknet-telecom-secure-auth-secret-key-2026-production-ao'
  }
  return secret
}

function base64UrlToBytes(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export async function verifySessionToken(token: string): Promise<EdgeSessionPayload | null> {
  try {
    const [body, encodedSignature] = token.split('.')
    if (!body || !encodedSignature) return null
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(getSessionSecret()),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    const signatureBytes = base64UrlToBytes(encodedSignature)
    const valid = await crypto.subtle.verify('HMAC', key, signatureBytes as BufferSource, new TextEncoder().encode(body))
    if (!valid) return null
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(body))) as EdgeSessionPayload
    if (!payload.userId || !payload.email || !payload.role || !Number.isFinite(payload.exp) || Date.now() >= payload.exp) return null
    return payload
  } catch {
    return null
  }
}