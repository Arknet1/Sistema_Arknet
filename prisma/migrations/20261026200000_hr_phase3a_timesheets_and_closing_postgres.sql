-- AlterTable
ALTER TABLE "HrConfig" ADD COLUMN     "timesheetSubmissionDeadlineDay" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "timesheetClosingDeadlineDay" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "closingAlertDays" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "unclassifiedAbsenceBlocksClosing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "timesheetSubmissionReminderHour" INTEGER NOT NULL DEFAULT 9;

-- CreateTable
CREATE TABLE "HrTimesheetPeriod" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ABERTO',
    "version" INTEGER NOT NULL DEFAULT 1,
    "closedAt" TIMESTAMP(3),
    "closedById" TEXT,
    "closedByName" TEXT,
    "closeNotes" TEXT,
    "reopenedAt" TIMESTAMP(3),
    "reopenedById" TEXT,
    "reopenReason" TEXT,
    "payrollLockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HrTimesheetPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrTimesheet" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ABERTA',
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "approvedByName" TEXT,
    "approvalNote" TEXT,
    "expectedWorkDays" INTEGER NOT NULL DEFAULT 0,
    "workedDays" INTEGER NOT NULL DEFAULT 0,
    "totalMinutesWorked" INTEGER NOT NULL DEFAULT 0,
    "delayCount" INTEGER NOT NULL DEFAULT 0,
    "delayMinutes" INTEGER NOT NULL DEFAULT 0,
    "earlyDepartureMinutes" INTEGER NOT NULL DEFAULT 0,
    "unjustifiedAbsenceDays" INTEGER NOT NULL DEFAULT 0,
    "justifiedAbsenceDays" INTEGER NOT NULL DEFAULT 0,
    "paidLeaveDays" INTEGER NOT NULL DEFAULT 0,
    "unpaidLeaveDays" INTEGER NOT NULL DEFAULT 0,
    "holidayDays" INTEGER NOT NULL DEFAULT 0,
    "approvedOvertimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "pendingOvertimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "rejectedOvertimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "missingExitDays" INTEGER NOT NULL DEFAULT 0,
    "outsideAreaDays" INTEGER NOT NULL DEFAULT 0,
    "rulesSnapshot" TEXT,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HrTimesheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrTimesheetDayDetail" (
    "id" TEXT NOT NULL,
    "timesheetId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "isExpectedWorkDay" BOOLEAN NOT NULL DEFAULT true,
    "scheduledDailyMinutes" INTEGER NOT NULL DEFAULT 480,
    "actualIn" TIMESTAMP(3),
    "actualOut" TIMESTAMP(3),
    "minutesWorked" INTEGER NOT NULL DEFAULT 0,
    "delayMinutes" INTEGER NOT NULL DEFAULT 0,
    "earlyDepartureMinutes" INTEGER NOT NULL DEFAULT 0,
    "overtimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "overtimeStatus" TEXT NOT NULL DEFAULT 'SEM_HORA_EXTRA',
    "status" TEXT NOT NULL,
    "absenceReason" TEXT,
    "absenceJustifiedById" TEXT,
    "absenceJustifiedByName" TEXT,
    "absenceJustifiedAt" TIMESTAMP(3),
    "leaveRequestId" TEXT,
    "isOutsideArea" BOOLEAN NOT NULL DEFAULT false,
    "hasMissingExit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HrTimesheetDayDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrTimesheetVersionSnapshot" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshotData" TEXT NOT NULL,
    "createdById" TEXT,
    "createdByName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HrTimesheetVersionSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HrTimesheetPeriod_code_key" ON "HrTimesheetPeriod"("code");

-- CreateIndex
CREATE INDEX "HrTimesheetPeriod_status_idx" ON "HrTimesheetPeriod"("status");

-- CreateIndex
CREATE UNIQUE INDEX "HrTimesheetPeriod_year_month_key" ON "HrTimesheetPeriod"("year", "month");

-- CreateIndex
CREATE INDEX "HrTimesheet_employeeId_idx" ON "HrTimesheet"("employeeId");

-- CreateIndex
CREATE INDEX "HrTimesheet_status_idx" ON "HrTimesheet"("status");

-- CreateIndex
CREATE UNIQUE INDEX "HrTimesheet_periodId_employeeId_key" ON "HrTimesheet"("periodId", "employeeId");

-- CreateIndex
CREATE INDEX "HrTimesheetDayDetail_date_idx" ON "HrTimesheetDayDetail"("date");

-- CreateIndex
CREATE INDEX "HrTimesheetDayDetail_status_idx" ON "HrTimesheetDayDetail"("status");

-- CreateIndex
CREATE UNIQUE INDEX "HrTimesheetDayDetail_timesheetId_date_key" ON "HrTimesheetDayDetail"("timesheetId", "date");

-- CreateIndex
CREATE INDEX "HrTimesheetVersionSnapshot_periodId_idx" ON "HrTimesheetVersionSnapshot"("periodId");

-- CreateIndex
CREATE UNIQUE INDEX "HrTimesheetVersionSnapshot_periodId_version_key" ON "HrTimesheetVersionSnapshot"("periodId", "version");

-- AddForeignKey
ALTER TABLE "HrTimesheet" ADD CONSTRAINT "HrTimesheet_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "HrTimesheetPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrTimesheet" ADD CONSTRAINT "HrTimesheet_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "HrEmployee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrTimesheetDayDetail" ADD CONSTRAINT "HrTimesheetDayDetail_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "HrTimesheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrTimesheetVersionSnapshot" ADD CONSTRAINT "HrTimesheetVersionSnapshot_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "HrTimesheetPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
