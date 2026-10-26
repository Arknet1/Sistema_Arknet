-- DropForeignKey
ALTER TABLE "HrPayslipItem" DROP CONSTRAINT "HrPayslipItem_payslipId_fkey";

-- DropForeignKey
ALTER TABLE "HrPayslip" DROP CONSTRAINT "HrPayslip_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "HrPayslip" DROP CONSTRAINT "HrPayslip_payrollPeriodId_fkey";

-- DropForeignKey
ALTER TABLE "HrPayrollPeriod" DROP CONSTRAINT "HrPayrollPeriod_timesheetPeriodId_fkey";

-- DropTable
DROP TABLE "HrPayslipItem";

-- DropTable
DROP TABLE "HrPayslip";

-- DropTable
DROP TABLE "HrPayrollPeriod";
