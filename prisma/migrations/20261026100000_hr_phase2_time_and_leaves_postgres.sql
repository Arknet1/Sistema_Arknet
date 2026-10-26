-- AlterTable
ALTER TABLE "HrEmployee" ADD COLUMN     "locationConsentDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "HrConfig" ADD COLUMN     "annualLeaveDaysDefault" INTEGER NOT NULL DEFAULT 22,
ADD COLUMN     "checkInReminderMinutes" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "dailyOvertimeLimitMinutes" INTEGER,
ADD COLUMN     "gpsRetentionMonths" INTEGER NOT NULL DEFAULT 12,
ADD COLUMN     "monthlyOvertimeLimitMinutes" INTEGER,
ADD COLUMN     "punctualityToleranceMinutes" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "roundingMinutes" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "HrWorkLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radiusMeters" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "verificationMode" TEXT NOT NULL DEFAULT 'INFORMATIVO',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HrWorkLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrEmployeeWorkLocation" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "workLocationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HrEmployeeWorkLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrWorkDay" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "actualIn" TIMESTAMP(3),
    "actualOut" TIMESTAMP(3),
    "totalMinutesWorked" INTEGER NOT NULL DEFAULT 0,
    "delayMinutes" INTEGER NOT NULL DEFAULT 0,
    "earlyDepartureMinutes" INTEGER NOT NULL DEFAULT 0,
    "overtimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "overtimeStatus" TEXT NOT NULL DEFAULT 'SEM_HORA_EXTRA',
    "overtimeApprovedMinutes" INTEGER NOT NULL DEFAULT 0,
    "overtimeReviewedById" TEXT,
    "overtimeReviewedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'NORMAL',
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HrWorkDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrTimeEntry" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "workDayId" TEXT,
    "type" TEXT NOT NULL,
    "serverTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "origin" TEXT NOT NULL DEFAULT 'PORTAL',
    "authorId" TEXT,
    "authorName" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "accuracyMeters" DOUBLE PRECISION,
    "isWithinRadius" BOOLEAN NOT NULL DEFAULT true,
    "locationId" TEXT,
    "clientRequestId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HrTimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrTimeCorrectionRequest" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "workDayId" TEXT,
    "date" TEXT NOT NULL,
    "targetEntryType" TEXT NOT NULL,
    "requestedTime" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "reviewedById" TEXT,
    "reviewedByName" TEXT,
    "reviewComment" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdEntryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HrTimeCorrectionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrLeaveType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT true,
    "deductsFromBalance" BOOLEAN NOT NULL DEFAULT false,
    "requiresDocument" BOOLEAN NOT NULL DEFAULT false,
    "maxDays" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HrLeaveType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrLeaveBalance" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "entitledDays" INTEGER NOT NULL DEFAULT 22,
    "carriedOverDays" INTEGER NOT NULL DEFAULT 0,
    "usedDays" INTEGER NOT NULL DEFAULT 0,
    "pendingDays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HrLeaveBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrLeaveRequest" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "leaveTypeId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "workingDaysCount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "attachmentPath" TEXT,
    "attachmentName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "reviewedById" TEXT,
    "reviewedByName" TEXT,
    "reviewComment" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HrLeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrHoliday" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'A_CONFIRMAR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HrHoliday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrNotification" (
    "id" TEXT NOT NULL,
    "recipientUserId" TEXT,
    "employeeId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HrNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HrEmployeeWorkLocation_employeeId_idx" ON "HrEmployeeWorkLocation"("employeeId");

-- CreateIndex
CREATE INDEX "HrEmployeeWorkLocation_workLocationId_idx" ON "HrEmployeeWorkLocation"("workLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "HrEmployeeWorkLocation_employeeId_workLocationId_key" ON "HrEmployeeWorkLocation"("employeeId", "workLocationId");

-- CreateIndex
CREATE INDEX "HrWorkDay_employeeId_idx" ON "HrWorkDay"("employeeId");

-- CreateIndex
CREATE INDEX "HrWorkDay_date_idx" ON "HrWorkDay"("date");

-- CreateIndex
CREATE INDEX "HrWorkDay_status_idx" ON "HrWorkDay"("status");

-- CreateIndex
CREATE UNIQUE INDEX "HrWorkDay_employeeId_date_key" ON "HrWorkDay"("employeeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "HrTimeEntry_clientRequestId_key" ON "HrTimeEntry"("clientRequestId");

-- CreateIndex
CREATE INDEX "HrTimeEntry_employeeId_idx" ON "HrTimeEntry"("employeeId");

-- CreateIndex
CREATE INDEX "HrTimeEntry_workDayId_idx" ON "HrTimeEntry"("workDayId");

-- CreateIndex
CREATE INDEX "HrTimeEntry_serverTime_idx" ON "HrTimeEntry"("serverTime");

-- CreateIndex
CREATE INDEX "HrTimeCorrectionRequest_employeeId_idx" ON "HrTimeCorrectionRequest"("employeeId");

-- CreateIndex
CREATE INDEX "HrTimeCorrectionRequest_status_idx" ON "HrTimeCorrectionRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "HrLeaveType_code_key" ON "HrLeaveType"("code");

-- CreateIndex
CREATE INDEX "HrLeaveBalance_employeeId_idx" ON "HrLeaveBalance"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "HrLeaveBalance_employeeId_year_key" ON "HrLeaveBalance"("employeeId", "year");

-- CreateIndex
CREATE INDEX "HrLeaveRequest_employeeId_idx" ON "HrLeaveRequest"("employeeId");

-- CreateIndex
CREATE INDEX "HrLeaveRequest_leaveTypeId_idx" ON "HrLeaveRequest"("leaveTypeId");

-- CreateIndex
CREATE INDEX "HrLeaveRequest_status_idx" ON "HrLeaveRequest"("status");

-- CreateIndex
CREATE INDEX "HrLeaveRequest_startDate_endDate_idx" ON "HrLeaveRequest"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "HrHoliday_date_key" ON "HrHoliday"("date");

-- CreateIndex
CREATE INDEX "HrNotification_recipientUserId_isRead_idx" ON "HrNotification"("recipientUserId", "isRead");

-- CreateIndex
CREATE INDEX "HrNotification_employeeId_idx" ON "HrNotification"("employeeId");

-- AddForeignKey
ALTER TABLE "HrEmployeeWorkLocation" ADD CONSTRAINT "HrEmployeeWorkLocation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "HrEmployee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrEmployeeWorkLocation" ADD CONSTRAINT "HrEmployeeWorkLocation_workLocationId_fkey" FOREIGN KEY ("workLocationId") REFERENCES "HrWorkLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrWorkDay" ADD CONSTRAINT "HrWorkDay_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "HrEmployee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrTimeEntry" ADD CONSTRAINT "HrTimeEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "HrEmployee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrTimeEntry" ADD CONSTRAINT "HrTimeEntry_workDayId_fkey" FOREIGN KEY ("workDayId") REFERENCES "HrWorkDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrTimeEntry" ADD CONSTRAINT "HrTimeEntry_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "HrWorkLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrTimeCorrectionRequest" ADD CONSTRAINT "HrTimeCorrectionRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "HrEmployee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrTimeCorrectionRequest" ADD CONSTRAINT "HrTimeCorrectionRequest_workDayId_fkey" FOREIGN KEY ("workDayId") REFERENCES "HrWorkDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrTimeCorrectionRequest" ADD CONSTRAINT "HrTimeCorrectionRequest_createdEntryId_fkey" FOREIGN KEY ("createdEntryId") REFERENCES "HrTimeEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrLeaveBalance" ADD CONSTRAINT "HrLeaveBalance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "HrEmployee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrLeaveRequest" ADD CONSTRAINT "HrLeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "HrEmployee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrLeaveRequest" ADD CONSTRAINT "HrLeaveRequest_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "HrLeaveType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

