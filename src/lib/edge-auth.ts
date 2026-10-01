export interface EdgeSessionPayload {
  userId: string
  email: string
  role: string
  exp: number
}

function getSessionSecret() {
  return process.env.AUTH_SECRET || 'arknet-telecom-secure-auth-secret-key-2026-production-ao'
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
    const signatureBytes = Uint8Array.from(atob(encodedSignature.replace(/-/g, '+').replace(/_/g, '/')), (char) => char.charCodeAt(0))
    const valid = await crypto.subtle.verify('HMAC', key, signatureBytes, new TextEncoder().encode(body))
    if (!valid) return null
    const payload = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(body.replace(/-/g, '+').replace(/_/g, '/')), (char) => char.charCodeAt(0)))) as EdgeSessionPayload
    if (!payload.userId || !payload.email || !payload.role || !Number.isFinite(payload.exp) || Date.now() >= payload.exp) return null
    return payload
  } catch {
    return null
  }
}