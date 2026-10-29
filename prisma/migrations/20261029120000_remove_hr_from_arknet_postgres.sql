-- Remoção segura do módulo RH do banco ARKNET.
-- Executar apenas manualmente após validar o novo sistema RH e confirmar backup.
-- IF EXISTS permite aplicar mesmo quando o RH nunca foi instalado em produção.
DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'HrCandidate', 'HrJobOpening', 'HrTrainingCourse', 'HrCertification',
    'HrPerformanceReview', 'HrPerformanceCycle', 'HrPayslipItem', 'HrPayslip',
    'HrPayrollPeriod', 'HrTimesheetVersionSnapshot', 'HrTimesheetDayDetail',
    'HrTimesheet', 'HrTimesheetPeriod', 'HrNotification', 'HrHoliday',
    'HrLeaveRequest', 'HrLeaveBalance', 'HrLeaveType', 'HrTimeCorrectionRequest',
    'HrTimeEntry', 'HrWorkDay', 'HrEmployeeWorkLocation', 'HrWorkLocation',
    'HrConfig', 'HrAlertLog', 'HrAuditLog', 'HrDocument', 'HrContract',
    'HrCareerHistory', 'HrEmployee', 'HrPosition', 'HrDepartment'
  ]
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', table_name);
  END LOOP;
END $$;

ALTER TABLE IF EXISTS "AdminUser" DROP COLUMN IF EXISTS "mustChangePassword";
