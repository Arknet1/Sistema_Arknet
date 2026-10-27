 -- DropForeignKey
ALTER TABLE "HrDepartment" DROP CONSTRAINT "HrDepartment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "HrEmployee" DROP CONSTRAINT "HrEmployee_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "HrEmployee" DROP CONSTRAINT "HrEmployee_positionId_fkey";

-- DropForeignKey
ALTER TABLE "HrEmployee" DROP CONSTRAINT "HrEmployee_directSupervisorId_fkey";

-- DropForeignKey
ALTER TABLE "HrEmployee" DROP CONSTRAINT "HrEmployee_userId_fkey";

-- DropForeignKey
ALTER TABLE "HrCareerHistory" DROP CONSTRAINT "HrCareerHistory_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "HrContract" DROP CONSTRAINT "HrContract_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "HrDocument" DROP CONSTRAINT "HrDocument_employeeId_fkey";

-- AlterTable
ALTER TABLE "AdminUser" DROP COLUMN "mustChangePassword";

-- DropTable
DROP TABLE "HrDepartment";

-- DropTable
DROP TABLE "HrPosition";

-- DropTable
DROP TABLE "HrEmployee";

-- DropTable
DROP TABLE "HrCareerHistory";

-- DropTable
DROP TABLE "HrContract";

-- DropTable
DROP TABLE "HrDocument";

-- DropTable
DROP TABLE "HrAuditLog";

-- DropTable
DROP TABLE "HrAlertLog";

-- DropTable
DROP TABLE "HrConfig";

