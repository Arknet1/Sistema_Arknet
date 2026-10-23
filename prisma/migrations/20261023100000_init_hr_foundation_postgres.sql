-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "HrDepartment" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "managerId" TEXT,
    "parentId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HrDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrPosition" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "salaryCategory" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HrPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrEmployee" (
    "id" TEXT NOT NULL,
    "employeeNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "biNumber" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "gender" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Luanda',
    "province" TEXT NOT NULL DEFAULT 'Luanda',
    "bankName" TEXT,
    "bankIban" TEXT,
    "bankAccountNumber" TEXT,
    "admissionDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVO',
    "departmentId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "directSupervisorId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HrEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrCareerHistory" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "salary" DECIMAL(65,30) NOT NULL,
    "changeReason" TEXT NOT NULL,
    "changeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registeredBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HrCareerHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrContract" (
    "id" TEXT NOT NULL,
    "contractNumber" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "baseSalary" DECIMAL(65,30) NOT NULL,
    "workDays" TEXT NOT NULL DEFAULT 'SEG-SEX',
    "dailyHours" DECIMAL(65,30) NOT NULL DEFAULT 8.0,
    "weeklyHours" DECIMAL(65,30) NOT NULL DEFAULT 40.0,
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HrContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrDocument" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVO',
    "uploadedById" TEXT,
    "uploadedByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HrDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrAuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "details" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HrAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrAlertLog" (
    "id" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "sentTo" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT,

    CONSTRAINT "HrAlertLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrConfig" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "contractAlertDays" INTEGER NOT NULL DEFAULT 30,
    "documentAlertDays" INTEGER NOT NULL DEFAULT 30,
    "notifyEmail" TEXT NOT NULL DEFAULT 'rh@arknet.co.ao',
    "notifyWhatsapp" TEXT,
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HrConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HrDepartment_code_key" ON "HrDepartment"("code");

-- CreateIndex
CREATE INDEX "HrDepartment_parentId_idx" ON "HrDepartment"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "HrPosition_code_key" ON "HrPosition"("code");

-- CreateIndex
CREATE UNIQUE INDEX "HrEmployee_employeeNumber_key" ON "HrEmployee"("employeeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "HrEmployee_biNumber_key" ON "HrEmployee"("biNumber");

-- CreateIndex
CREATE UNIQUE INDEX "HrEmployee_email_key" ON "HrEmployee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "HrEmployee_userId_key" ON "HrEmployee"("userId");

-- CreateIndex
CREATE INDEX "HrEmployee_departmentId_idx" ON "HrEmployee"("departmentId");

-- CreateIndex
CREATE INDEX "HrEmployee_positionId_idx" ON "HrEmployee"("positionId");

-- CreateIndex
CREATE INDEX "HrEmployee_status_idx" ON "HrEmployee"("status");

-- CreateIndex
CREATE INDEX "HrCareerHistory_employeeId_idx" ON "HrCareerHistory"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "HrContract_contractNumber_key" ON "HrContract"("contractNumber");

-- CreateIndex
CREATE INDEX "HrContract_employeeId_idx" ON "HrContract"("employeeId");

-- CreateIndex
CREATE INDEX "HrContract_status_idx" ON "HrContract"("status");

-- CreateIndex
CREATE INDEX "HrDocument_employeeId_idx" ON "HrDocument"("employeeId");

-- CreateIndex
CREATE INDEX "HrDocument_type_idx" ON "HrDocument"("type");

-- CreateIndex
CREATE INDEX "HrDocument_status_idx" ON "HrDocument"("status");

-- CreateIndex
CREATE INDEX "HrAuditLog_resource_resourceId_idx" ON "HrAuditLog"("resource", "resourceId");

-- CreateIndex
CREATE INDEX "HrAuditLog_createdAt_idx" ON "HrAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "HrAlertLog_alertType_targetId_idx" ON "HrAlertLog"("alertType", "targetId");

-- CreateIndex
CREATE INDEX "HrAlertLog_sentAt_idx" ON "HrAlertLog"("sentAt");

-- AddForeignKey
ALTER TABLE "HrDepartment" ADD CONSTRAINT "HrDepartment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "HrDepartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrEmployee" ADD CONSTRAINT "HrEmployee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "HrDepartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrEmployee" ADD CONSTRAINT "HrEmployee_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "HrPosition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrEmployee" ADD CONSTRAINT "HrEmployee_directSupervisorId_fkey" FOREIGN KEY ("directSupervisorId") REFERENCES "HrEmployee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrEmployee" ADD CONSTRAINT "HrEmployee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrCareerHistory" ADD CONSTRAINT "HrCareerHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "HrEmployee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrContract" ADD CONSTRAINT "HrContract_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "HrEmployee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrDocument" ADD CONSTRAINT "HrDocument_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "HrEmployee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

