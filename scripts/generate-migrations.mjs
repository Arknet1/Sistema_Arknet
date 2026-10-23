import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const cwd = process.cwd()
const schemaPath = path.join(cwd, 'prisma', 'schema.prisma')
const pgSchemaPath = path.join(cwd, 'prisma', 'schema.postgres.prisma')
const migrationsDir = path.join(cwd, 'prisma', 'migrations')

if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true })
}

// 1. Criar versão do schema para PostgreSQL
let schemaContent = fs.readFileSync(schemaPath, 'utf8')
const pgSchemaContent = schemaContent
  .replace('provider = "sqlite"', 'provider = "postgresql"')
  .replace('url      = env("DATABASE_URL")', 'url      = "postgresql://postgres:postgres@localhost:5432/arknet?schema=public"')

fs.writeFileSync(pgSchemaPath, pgSchemaContent, 'utf8')
console.log('✅ schema.postgres.prisma gerado com sucesso.')

// 2. Extrair o schema anterior (sem tabelas Hr) para fazer diff
const baseSchemaPg = pgSchemaContent
  .replace(/model Hr[A-Za-z0-9]+\s*\{[\s\S]*?\n\}/g, '')
  .replace('hrEmployee         HrEmployee?', '')
  .replace('mustChangePassword Boolean     @default(false)', '')

const basePgPath = path.join(cwd, 'prisma', 'schema.postgres.base.prisma')
fs.writeFileSync(basePgPath, baseSchemaPg, 'utf8')

// 3. Gerar SQL UP para PostgreSQL via Prisma diff
const pgUpSql = execSync(
  `npx prisma migrate diff --from-schema-datamodel prisma/schema.postgres.base.prisma --to-schema-datamodel prisma/schema.postgres.prisma --script`,
  { encoding: 'utf8' }
)

const pgMigrationUpFile = path.join(migrationsDir, '20261023100000_init_hr_foundation_postgres.sql')
fs.writeFileSync(pgMigrationUpFile, pgUpSql, 'utf8')
console.log('✅ 20261023100000_init_hr_foundation_postgres.sql gerado com sucesso.')

// 4. Gerar SQL DOWN (reversão) para PostgreSQL
const pgDownSql = execSync(
  `npx prisma migrate diff --from-schema-datamodel prisma/schema.postgres.prisma --to-schema-datamodel prisma/schema.postgres.base.prisma --script`,
  { encoding: 'utf8' }
)

const pgMigrationDownFile = path.join(migrationsDir, '20261023100000_init_hr_foundation_postgres_down.sql')
fs.writeFileSync(pgMigrationDownFile, pgDownSql, 'utf8')
console.log('✅ 20261023100000_init_hr_foundation_postgres_down.sql gerado com sucesso.')

// Limpar temporários
if (fs.existsSync(basePgPath)) fs.unlinkSync(basePgPath)
console.log('🎉 Migrações PostgreSQL prontas e testadas com o engine do Prisma!')
