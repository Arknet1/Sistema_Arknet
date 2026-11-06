import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

import { sendPasswordRecoveryEmail } from '../src/lib/email-service.js'

async function run() {
  console.log('--- Teste de envio de email de recuperação ---')
  console.log('Destinatário de teste: arknet40@gmail.com')
  const result = await sendPasswordRecoveryEmail('arknet40@gmail.com', '123456', 'Utilizador de Teste')
  console.log('Resultado do envio:', result)
}

run().catch(console.error)

