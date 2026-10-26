-- CreateTable
CREATE TABLE "HrPayrollPeriod" (
    "id" TEXT NOT NULL,
    "timesheetPeriodId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "totalGross" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalNet" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalInssWorker" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalInssCompany" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalIrt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalEmployees" INTEGER NOT NULL DEFAULT 0,
    "processedAt" TIMESTAMP(3),
    "processedById" TEXT,
    "processedByName" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "approvedByName" TEXT,
    "paidAt" TIMESTAMP(3),
    "paidById" TEXT,
    "paidByName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HrPayrollPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrPayslip" (
    "id" TEXT NOT NULL,
    "payrollPeriodId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "timesheetId" TEXT,
    "contractId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "payslipNumber" TEXT NOT NULL,
    "baseSalary" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "dailyHours" DECIMAL(65,30) NOT NULL DEFAULT 8.0,
    "hourlyRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "expectedWorkDays" INTEGER NOT NULL DEFAULT 22,
    "workedDays" INTEGER NOT NULL DEFAULT 0,
    "unjustifiedAbsences" INTEGER NOT NULL DEFAULT 0,
    "absenceDeduction" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "overtimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "overtimePay" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "foodAllowance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "transportAllowance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "holidayAllowance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "christmasAllowance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "familyAllowance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "otherAllowances" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "grossSalary" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "taxableBaseInss" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "inssWorker" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "inssCompany" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "taxableBaseIrt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "irtTax" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "otherDeductions" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalDeductions" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "netSalary" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "paymentMethod" TEXT NOT NULL DEFAULT 'TRANSFERENCIA',
    "bankName" TEXT,
    "bankIban" TEXT,
    "bankAccountNumber" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HrPayslip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrPayslipItem" (
    "id" TEXT NOT NULL,
    "payslipId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isTaxableIrt" BOOLEAN NOT NULL DEFAULT true,
    "isTaxableInss" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HrPayslipItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HrPayrollPeriod_timesheetPeriodId_key" ON "HrPayrollPeriod"("timesheetPeriodId");

-- CreateIndex
CREATE UNIQUE INDEX "HrPayrollPeriod_code_key" ON "HrPayrollPeriod"("code");

-- CreateIndex
CREATE UNIQUE INDEX "HrPayrollPeriod_year_month_key" ON "HrPayrollPeriod"("year", "month");

-- CreateIndex
CREATE INDEX "HrPayrollPeriod_status_idx" ON "HrPayrollPeriod"("status");

-- CreateIndex
CREATE UNIQUE INDEX "HrPayslip_payslipNumber_key" ON "HrPayslip"("payslipNumber");

-- CreateIndex
CREATE UNIQUE INDEX "HrPayslip_payrollPeriodId_employeeId_key" ON "HrPayslip"("payrollPeriodId", "employeeId");

-- CreateIndex
CREATE INDEX "HrPayslip_employeeId_idx" ON "HrPayslip"("employeeId");

-- CreateIndex
CREATE INDEX "HrPayslip_status_idx" ON "HrPayslip"("status");

-- CreateIndex
CREATE INDEX "HrPayslipItem_payslipId_idx" ON "HrPayslipItem"("payslipId");

-- AddForeignKey
ALTER TABLE "HrPayrollPeriod" ADD CONSTRAINT "HrPayrollPeriod_timesheetPeriodId_fkey" FOREIGN KEY ("timesheetPeriodId") REFERENCES "HrTimesheetPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrPayslip" ADD CONSTRAINT "HrPayslip_payrollPeriodId_fkey" FOREIGN KEY ("payrollPeriodId") REFERENCES "HrPayrollPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrPayslip" ADD CONSTRAINT "HrPayslip_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "HrEmployee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrPayslipItem" ADD CONSTRAINT "HrPayslipItem_payslipId_fkey" FOREIGN KEY ("payslipId") REFERENCES "HrPayslip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
