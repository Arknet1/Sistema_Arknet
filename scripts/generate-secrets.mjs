import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const envPath = path.join(rootDir, '.env')

console.log('========================================================')
console.log('   ARKNET / J.MATOS - GERADOR DE SEGREDOS CRIPTOGRÁFICOS')
console.log('========================================================\n')

const newSecret = crypto.randomBytes(32).toString('hex')
console.log('✓ Nova chave AUTH_SECRET gerada (64 caracteres):')
console.log(`  ${newSecret}\n`)

let envContent = ''
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf-8')
  if (envContent.includes('AUTH_SECRET=')) {
    envContent = envContent.replace(/AUTH_SECRET=.*(\r?\n|$)/g, `AUTH_SECRET="${newSecret}"$1`)
  } else {
    envContent += `\nAUTH_SECRET="${newSecret}"\n`
  }
} else {
  envContent = `# Configuração de Produção ARKNET / J.Matos\nDATABASE_URL="file:./dev.db"\nAUTH_SECRET="${newSecret}"\nNEXT_PUBLIC_SITE_URL="https://arknet.co.ao"\nNEXT_PUBLIC_WHATSAPP_NUMBER="+244935208449"\n`
}

fs.writeFileSync(envPath, envContent, 'utf-8')
console.log(`✓ Ficheiro .env atualizado com sucesso em: ${envPath}\n`)
console.log('O seu sistema agora tem uma chave de assinatura de sessão criptográfica segura.')
