import { LegacyPayrollAcl } from './legacy-payroll.acl';
import { LegacyPayrollClient } from './legacy-payroll.client';
import { WeeklyPayService } from '../../application/weekly-pay.service';
import { DomainError } from '../../../shared/domain/domain.error';

describe('Anticorruption Layer', () => {
  const acl = new LegacyPayrollAcl(new LegacyPayrollClient());
  const week = new Date('2026-01-05T00:00:00Z');

  it('translates the vendor record into our clean model', async () => {
    const ts = await acl.fetchTimesheet('c1', week);
    expect(ts.worked.hours).toBe(37.5);          // "37.5" string → WorkedHours
    expect(ts.rate.band).toBe('standard');       // 'S' → 'standard'
    expect(ts.rate.perHourPence).toBe(1450);
    expect(Object.keys(ts)).not.toContain('emp_ref'); // vendor names never leak
  });

  it('our application code only ever sees our model', async () => {
    const pay = new WeeklyPayService(acl);
    expect(await pay.grossPayPence('c2', week)).toBe(12 * 1800);
  });

  it('turns vendor gaps into a DomainError, not an undefined', async () => {
    await expect(acl.fetchTimesheet('c9', week)).rejects.toThrow(DomainError);
  });
});
