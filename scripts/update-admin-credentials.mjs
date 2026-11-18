import { randomBytes, scryptSync } from 'crypto'
import { readFileSync, writeFileSync } from 'fs'
import { DatabaseSync } from 'node:sqlite'

const NEW_EMAIL = 'arknet133@gmail.com'
const NEW_PASS  = 'Ark2026%2028!'

function hashPassword(pwd) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(pwd, salt, 64).toString('hex')
  return `$scrypt$${salt}$${hash}`
}

const newHash = hashPassword(NEW_PASS)

// ── dev.db ───────────────────────────────────────────────────────────────────
try {
  const db = new DatabaseSync('prisma/dev.db')
  const user = db.prepare("SELECT id FROM AdminUser WHERE email = ?").get(NEW_EMAIL)
  if (user) {
    db.prepare("UPDATE AdminUser SET passwordHash = ? WHERE id = ?").run(newHash, user.id)
    console.log(`✅ dev.db atualizado`)
  }
  db.close()
} catch (e) { console.error('❌ dev.db:', e.message) }

// ── arknet-db.json ───────────────────────────────────────────────────────────
try {
  const path = 'data/arknet-db.json'
  const db = JSON.parse(readFileSync(path, 'utf8'))
  const user = db.users.find(u => u.email === NEW_EMAIL)
  if (user) {
    user.passwordHash = newHash
    writeFileSync(path, JSON.stringify(db, null, 2), 'utf8')
    console.log(`✅ JSON atualizado`)
  }
} catch (e) { console.error('❌ JSON:', e.message) }

console.log(`\n🔑 Email   : ${NEW_EMAIL}`)
console.log(`   Password: ${NEW_PASS}`)
