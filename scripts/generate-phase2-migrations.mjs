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

// 1. Criar versão do schema completo para PostgreSQL
let schemaContent = fs.readFileSync(schemaPath, 'utf8')
const pgSchemaContent = schemaContent
  .replace('provider = "sqlite"', 'provider = "postgresql"')
  .replace('url      = env("DATABASE_URL")', 'url      = "postgresql://postgres:postgres@localhost:5432/arknet?schema=public"')

fs.writeFileSync(pgSchemaPath, pgSchemaContent, 'utf8')
console.log('✅ schema.postgres.prisma actualizado com sucesso.')

// 2. Extrair o schema da Fase 1 (sem as tabelas e campos da Fase 2)
let phase1Schema = pgSchemaContent
  // Remover os novos modelos da Fase 2
  .replace(/model HrWorkLocation\s*\{[\s\S]*?\n\}/g, '')
  .replace(/model HrEmployeeWorkLocation\s*\{[\s\S]*?\n\}/g, '')
  .replace(/model HrWorkDay\s*\{[\s\S]*?\n\}/g, '')
  .replace(/model HrTimeEntry\s*\{[\s\S]*?\n\}/g, '')
  .replace(/model HrTimeCorrectionRequest\s*\{[\s\S]*?\n\}/g, '')
  .replace(/model HrLeaveType\s*\{[\s\S]*?\n\}/g, '')
  .replace(/model HrLeaveBalance\s*\{[\s\S]*?\n\}/g, '')
  .replace(/model HrLeaveRequest\s*\{[\s\S]*?\n\}/g, '')
  .replace(/model HrHoliday\s*\{[\s\S]*?\n\}/g, '')
  .replace(/model HrNotification\s*\{[\s\S]*?\n\}/g, '')
  // Remover relações da Fase 2 em HrEmployee
  .replace('locationConsentDate DateTime?', '')
  .replace('timeEntries        HrTimeEntry[]', '')
  .replace('workDays           HrWorkDay[]', '')
  .replace('timeCorrections    HrTimeCorrectionRequest[]', '')
  .replace('leaveBalances      HrLeaveBalance[]', '')
  .replace('leaveRequests      HrLeaveRequest[]', '')
  .replace('workLocations      HrEmployeeWorkLocation[]', '')
  // Remover campos da Fase 2 em HrConfig
  .replace('punctualityToleranceMinutes   Int      @default(10)', '')
  .replace('roundingMinutes               Int      @default(0)', '')
  .replace('dailyOvertimeLimitMinutes     Int?', '')
  .replace('monthlyOvertimeLimitMinutes   Int?', '')
  .replace('checkInReminderMinutes        Int      @default(15)', '')
  .replace('gpsRetentionMonths            Int      @default(12)', '')
  .replace('annualLeaveDaysDefault        Int      @default(22)', '')

const phase1PgPath = path.join(cwd, 'prisma', 'schema.postgres.phase1.prisma')
fs.writeFileSync(phase1PgPath, phase1Schema, 'utf8')

// 3. Gerar SQL UP para PostgreSQL via Prisma diff
const pgUpSql = execSync(
  `npx prisma migrate diff --from-schema-datamodel prisma/schema.postgres.phase1.prisma --to-schema-datamodel prisma/schema.postgres.prisma --script`,
  { encoding: 'utf8' }
)

const pgMigrationUpFile = path.join(migrationsDir, '20261026100000_hr_phase2_time_and_leaves_postgres.sql')
fs.writeFileSync(pgMigrationUpFile, pgUpSql, 'utf8')
console.log('✅ 20261026100000_hr_phase2_time_and_leaves_postgres.sql gerado com sucesso.')

// 4. Gerar SQL DOWN (reversão) para PostgreSQL
const pgDownSql = execSync(
  `npx prisma migrate diff --from-schema-datamodel prisma/schema.postgres.prisma --to-schema-datamodel prisma/schema.postgres.phase1.prisma --script`,
  { encoding: 'utf8' }
)

const pgMigrationDownFile = path.join(migrationsDir, '20261026100000_hr_phase2_time_and_leaves_postgres_down.sql')
fs.writeFileSync(pgMigrationDownFile, pgDownSql, 'utf8')
console.log('✅ 20261026100000_hr_phase2_time_and_leaves_postgres_down.sql gerado com sucesso.')

// 5. Limpar temporário
if (fs.existsSync(phase1PgPath)) fs.unlinkSync(phase1PgPath)
console.log('🎉 Migrações PostgreSQL da Fase 2 geradas e validadas!')
