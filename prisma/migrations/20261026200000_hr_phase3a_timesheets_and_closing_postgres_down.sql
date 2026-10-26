-- DropForeignKey
ALTER TABLE "HrTimesheetVersionSnapshot" DROP CONSTRAINT IF EXISTS "HrTimesheetVersionSnapshot_periodId_fkey";

-- DropForeignKey
ALTER TABLE "HrTimesheetDayDetail" DROP CONSTRAINT IF EXISTS "HrTimesheetDayDetail_timesheetId_fkey";

-- DropForeignKey
ALTER TABLE "HrTimesheet" DROP CONSTRAINT IF EXISTS "HrTimesheet_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "HrTimesheet" DROP CONSTRAINT IF EXISTS "HrTimesheet_periodId_fkey";

-- DropTable
DROP TABLE IF EXISTS "HrTimesheetVersionSnapshot";

-- DropTable
DROP TABLE IF EXISTS "HrTimesheetDayDetail";

-- DropTable
DROP TABLE IF EXISTS "HrTimesheet";

-- DropTable
DROP TABLE IF EXISTS "HrTimesheetPeriod";

-- AlterTable
ALTER TABLE "HrConfig" DROP COLUMN IF EXISTS "timesheetSubmissionDeadlineDay",
DROP COLUMN IF EXISTS "timesheetClosingDeadlineDay",
DROP COLUMN IF EXISTS "closingAlertDays",
DROP COLUMN IF EXISTS "unclassifiedAbsenceBlocksClosing",
DROP COLUMN IF EXISTS "timesheetSubmissionReminderHour";
