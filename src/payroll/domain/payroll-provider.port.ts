import { CaregiverTimesheet } from './caregiver-timesheet';

/** PORT: what Payroll needs from "somewhere that knows timesheets". Nothing about the vendor leaks here. */
export abstract class PayrollProviderPort {
  abstract fetchTimesheet(caregiverId: string, weekStarting: Date): Promise<CaregiverTimesheet>;
}
