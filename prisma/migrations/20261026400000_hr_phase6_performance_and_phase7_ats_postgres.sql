-- ==============================================================================
-- ARKNET / J.MATOS SISTEMA DE RECURSOS HUMANOS - MIGRAÇÃO POSTGRESQL (UP & DOWN)
-- Fase 6: Avaliação de Desempenho & Gestão de Formação e Certificações
-- Fase 7: Recrutamento & Admissão Integrada (ATS)
-- Data: 26 de Outubro de 2026
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- UP MIGRATION
-- ------------------------------------------------------------------------------

-- 1. FASE 6: CICLOS DE AVALIAÇÃO DE DESEMPENHO
CREATE TABLE IF NOT EXISTS "HrPerformanceCycle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANEADO',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HrPerformanceCycle_pkey" PRIMARY KEY ("id")
);

-- 2. FASE 6: AVALIAÇÕES INDIVIDUAIS DE DESEMPENHO
CREATE TABLE IF NOT EXISTS "HrPerformanceReview" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "reviewerId" TEXT,
    "reviewerName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE_AUTO',
    "selfRating" DECIMAL(65,30) DEFAULT 0,
    "selfComments" TEXT,
    "selfSubmittedAt" TIMESTAMP(3),
    "managerRating" DECIMAL(65,30) DEFAULT 0,
    "managerComments" TEXT,
    "managerSubmittedAt" TIMESTAMP(3),
    "objectivesRating" DECIMAL(65,30) DEFAULT 0,
    "competenciesRating" DECIMAL(65,30) DEFAULT 0,
    "finalScore" DECIMAL(65,30) DEFAULT 0,
    "performanceBand" TEXT,
    "strengths" TEXT,
    "areasToImprove" TEXT,
    "developmentPlan" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HrPerformanceReview_pkey" PRIMARY KEY ("id")
);

-- 3. FASE 6: CERTIFICAÇÕES E HABILITAÇÕES TÉCNICAS
CREATE TABLE IF NOT EXISTS "HrCertification" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuingEntity" TEXT NOT NULL,
    "licenseNumber" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'VALIDA',
    "attachmentUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HrCertification_pkey" PRIMARY KEY ("id")
);

-- 4. FASE 6: CURSOS E ACÇÕES DE FORMAÇÃO PROFISSIONAL
CREATE TABLE IF NOT EXISTS "HrTrainingCourse" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "durationHours" INTEGER NOT NULL DEFAULT 8,
    "category" TEXT NOT NULL DEFAULT 'TECNICA',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PLANEADO',
    "participantsCount" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT DEFAULT 'Sede ARKNET Luanda',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HrTrainingCourse_pkey" PRIMARY KEY ("id")
);

-- 5. FASE 7: VAGAS DE EMPREGO (ATS)
CREATE TABLE IF NOT EXISTS "HrJobOpening" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "departmentId" TEXT,
    "positionId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'FULL_TIME',
    "location" TEXT NOT NULL DEFAULT 'Luanda',
    "openingsCount" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'ABERTA',
    "requirements" TEXT,
    "salaryRangeMin" DECIMAL(65,30),
    "salaryRangeMax" DECIMAL(65,30),
    "closingDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HrJobOpening_pkey" PRIMARY KEY ("id")
);

-- 6. FASE 7: CANDIDATOS E CURRÍCULOS
CREATE TABLE IF NOT EXISTS "HrCandidate" (
    "id" TEXT NOT NULL,
    "jobOpeningId" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "biNumber" TEXT,
    "experienceYears" INTEGER DEFAULT 0,
    "resumeUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOVO',
    "admittedAsId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HrCandidate_pkey" PRIMARY KEY ("id")
);

-- ÍNDICES E UNICIDADES
CREATE UNIQUE INDEX IF NOT EXISTS "HrPerformanceCycle_year_title_key" ON "HrPerformanceCycle"("year", "title");
CREATE INDEX IF NOT EXISTS "HrPerformanceCycle_status_idx" ON "HrPerformanceCycle"("status");

CREATE UNIQUE INDEX IF NOT EXISTS "HrPerformanceReview_cycleId_employeeId_key" ON "HrPerformanceReview"("cycleId", "employeeId");
CREATE INDEX IF NOT EXISTS "HrPerformanceReview_employeeId_idx" ON "HrPerformanceReview"("employeeId");
CREATE INDEX IF NOT EXISTS "HrPerformanceReview_status_idx" ON "HrPerformanceReview"("status");

CREATE INDEX IF NOT EXISTS "HrCertification_employeeId_idx" ON "HrCertification"("employeeId");
CREATE INDEX IF NOT EXISTS "HrCertification_status_idx" ON "HrCertification"("status");

CREATE INDEX IF NOT EXISTS "HrTrainingCourse_category_idx" ON "HrTrainingCourse"("category");
CREATE INDEX IF NOT EXISTS "HrTrainingCourse_status_idx" ON "HrTrainingCourse"("status");

CREATE INDEX IF NOT EXISTS "HrJobOpening_departmentId_idx" ON "HrJobOpening"("departmentId");
CREATE INDEX IF NOT EXISTS "HrJobOpening_positionId_idx" ON "HrJobOpening"("positionId");
CREATE INDEX IF NOT EXISTS "HrJobOpening_status_idx" ON "HrJobOpening"("status");

CREATE INDEX IF NOT EXISTS "HrCandidate_jobOpeningId_idx" ON "HrCandidate"("jobOpeningId");
CREATE INDEX IF NOT EXISTS "HrCandidate_status_idx" ON "HrCandidate"("status");

-- CHAVES ESTRANGEIRAS
ALTER TABLE "HrPerformanceReview" ADD CONSTRAINT "HrPerformanceReview_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "HrPerformanceCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HrPerformanceReview" ADD CONSTRAINT "HrPerformanceReview_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "HrEmployee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HrCertification" ADD CONSTRAINT "HrCertification_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "HrEmployee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HrJobOpening" ADD CONSTRAINT "HrJobOpening_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "HrDepartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HrJobOpening" ADD CONSTRAINT "HrJobOpening_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "HrPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "HrCandidate" ADD CONSTRAINT "HrCandidate_jobOpeningId_fkey" FOREIGN KEY ("jobOpeningId") REFERENCES "HrJobOpening"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ------------------------------------------------------------------------------
-- DOWN MIGRATION (ROLLBACK SEGURO)
-- ------------------------------------------------------------------------------
/*
ALTER TABLE "HrCandidate" DROP CONSTRAINT IF EXISTS "HrCandidate_jobOpeningId_fkey";
ALTER TABLE "HrJobOpening" DROP CONSTRAINT IF EXISTS "HrJobOpening_positionId_fkey";
ALTER TABLE "HrJobOpening" DROP CONSTRAINT IF EXISTS "HrJobOpening_departmentId_fkey";
ALTER TABLE "HrCertification" DROP CONSTRAINT IF EXISTS "HrCertification_employeeId_fkey";
ALTER TABLE "HrPerformanceReview" DROP CONSTRAINT IF EXISTS "HrPerformanceReview_employeeId_fkey";
ALTER TABLE "HrPerformanceReview" DROP CONSTRAINT IF EXISTS "HrPerformanceReview_cycleId_fkey";

DROP TABLE IF EXISTS "HrCandidate";
DROP TABLE IF EXISTS "HrJobOpening";
DROP TABLE IF EXISTS "HrTrainingCourse";
DROP TABLE IF EXISTS "HrCertification";
DROP TABLE IF EXISTS "HrPerformanceReview";
DROP TABLE IF EXISTS "HrPerformanceCycle";
*/
