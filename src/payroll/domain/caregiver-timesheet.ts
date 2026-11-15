import { WorkedHours } from './worked-hours';
import { PayRate } from './pay-rate';

/** OUR model of a timesheet. Clean names from OUR Ubiquitous Language. */
export interface CaregiverTimesheet {
  caregiverId: string;
  weekStarting: Date;
  worked: WorkedHours;
  rate: PayRate;
}
