-- DropForeignKey
ALTER TABLE "HrEmployeeWorkLocation" DROP CONSTRAINT "HrEmployeeWorkLocation_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "HrEmployeeWorkLocation" DROP CONSTRAINT "HrEmployeeWorkLocation_workLocationId_fkey";

-- DropForeignKey
ALTER TABLE "HrWorkDay" DROP CONSTRAINT "HrWorkDay_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "HrTimeEntry" DROP CONSTRAINT "HrTimeEntry_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "HrTimeEntry" DROP CONSTRAINT "HrTimeEntry_workDayId_fkey";

-- DropForeignKey
ALTER TABLE "HrTimeEntry" DROP CONSTRAINT "HrTimeEntry_locationId_fkey";

-- DropForeignKey
ALTER TABLE "HrTimeCorrectionRequest" DROP CONSTRAINT "HrTimeCorrectionRequest_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "HrTimeCorrectionRequest" DROP CONSTRAINT "HrTimeCorrectionRequest_workDayId_fkey";

-- DropForeignKey
ALTER TABLE "HrTimeCorrectionRequest" DROP CONSTRAINT "HrTimeCorrectionRequest_createdEntryId_fkey";

-- DropForeignKey
ALTER TABLE "HrLeaveBalance" DROP CONSTRAINT "HrLeaveBalance_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "HrLeaveRequest" DROP CONSTRAINT "HrLeaveRequest_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "HrLeaveRequest" DROP CONSTRAINT "HrLeaveRequest_leaveTypeId_fkey";

-- AlterTable
ALTER TABLE "HrEmployee" DROP COLUMN "locationConsentDate";

-- AlterTable
ALTER TABLE "HrConfig" DROP COLUMN "annualLeaveDaysDefault",
DROP COLUMN "checkInReminderMinutes",
DROP COLUMN "dailyOvertimeLimitMinutes",
DROP COLUMN "gpsRetentionMonths",
DROP COLUMN "monthlyOvertimeLimitMinutes",
DROP COLUMN "punctualityToleranceMinutes",
DROP COLUMN "roundingMinutes";

-- DropTable
DROP TABLE "HrWorkLocation";

-- DropTable
DROP TABLE "HrEmployeeWorkLocation";

-- DropTable
DROP TABLE "HrWorkDay";

-- DropTable
DROP TABLE "HrTimeEntry";

-- DropTable
DROP TABLE "HrTimeCorrectionRequest";

-- DropTable
DROP TABLE "HrLeaveType";

-- DropTable
DROP TABLE "HrLeaveBalance";

-- DropTable
DROP TABLE "HrLeaveRequest";

-- DropTable
DROP TABLE "HrHoliday";

-- DropTable
DROP TABLE "HrNotification";

