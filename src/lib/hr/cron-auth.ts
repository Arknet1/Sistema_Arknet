import { timingSafeEqual } from 'node:crypto'
import type { NextRequest } from 'next/server'

/** CRON_SECRET is mandatory. Never accept a source-code default in production. */
export function isAuthorizedCronRequest(request: NextRequest): boolean {
  const expectedSecret = process.env.CRON_SECRET
  if (!expectedSecret) return false

  const authorization = request.headers.get('authorization')
  const bearerToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null
  const providedSecret = bearerToken || request.headers.get('x-cron-secret')
  if (!providedSecret) return false

  const expected = Buffer.from(expectedSecret)
  const provided = Buffer.from(providedSecret)
  return expected.length === provided.length && timingSafeEqual(expected, provided)
}
