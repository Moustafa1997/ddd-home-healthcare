import { Injectable } from '@nestjs/common';
import { PayrollProviderPort } from '../../domain/payroll-provider.port';
import { CaregiverTimesheet } from '../../domain/caregiver-timesheet';
import { WorkedHours } from '../../domain/worked-hours';
import { PayRate, RateBand } from '../../domain/pay-rate';
import { LegacyPayrollClient, LegacyPayrollRecord } from './legacy-payroll.client';
import { DomainError } from '../../../shared/domain/domain.error';

/**
 * Lesson 12 — Anticorruption Layer.
 *
 * One job: TRANSLATE the vendor's model into ours.
 * Our domain never sees `emp_ref` or `pay_cd`. When the vendor changes their API,
 * this file changes — nothing else does.
 */
@Injectable()
export class LegacyPayrollAcl extends PayrollProviderPort {
  private static readonly BAND: Record<LegacyPayrollRecord['pay_cd'], RateBand> = { S: 'standard', N: 'night', W: 'weekend' };

  constructor(private readonly client: LegacyPayrollClient) { super(); }

  async fetchTimesheet(caregiverId: string, weekStarting: Date): Promise<CaregiverTimesheet> {
    const rec = await this.client.getRec(this.toEmpRef(caregiverId), this.toWkStart(weekStarting));
    if (!rec) throw new DomainError(`No timesheet for caregiver ${caregiverId} on ${weekStarting.toISOString().slice(0, 10)}`);

    return {
      caregiverId,
      weekStarting,
      worked: WorkedHours.create(parseFloat(rec.hrs_wk)),
      rate: PayRate.create(LegacyPayrollAcl.BAND[rec.pay_cd], rec.rt_p),
    };
  }

  // --- translation details, kept private to the ACL ---
  private toEmpRef(caregiverId: string): string { return `E-00${caregiverId}`; }
  private toWkStart(d: Date): string { return d.toISOString().slice(0, 10).replace(/-/g, ''); }
}
