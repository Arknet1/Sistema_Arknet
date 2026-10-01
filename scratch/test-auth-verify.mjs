import { createSessionToken, verifySessionToken as verifyServer } from '../src/lib/server-auth.ts'
import { verifySessionToken as verifyEdge } from '../src/lib/edge-auth.ts'

const token = createSessionToken({ userId: 'usr-admin-1', email: 'admin@arknet.ao', role: 'admin' })
console.log('Generated token:', token)

const serverPayload = verifyServer(token)
console.log('Server verify:', serverPayload)

const edgePayload = await verifyEdge(token)
console.log('Edge verify:', edgePayload)
