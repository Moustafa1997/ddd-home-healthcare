/**
 * The EXTERNAL provider's API, exactly as they ship it.
 * Cryptic names, strings for numbers, codes instead of meaning.
 * We do not control this and it changes every few months.
 */
export interface LegacyPayrollRecord {
  emp_ref: string;      // their id for our caregiver, e.g. "E-00C1"
  wk_start: string;     // "20260105" (yyyymmdd)
  hrs_wk: string;       // "37.5"
  pay_cd: 'S' | 'N' | 'W';   // S=standard N=night W=weekend
  rt_p: number;         // pence per hour
}

/** Simulated HTTP client. In reality this would be fetch()/axios against their endpoint. */
export class LegacyPayrollClient {
  private readonly data: LegacyPayrollRecord[] = [
    { emp_ref: 'E-00c1', wk_start: '20260105', hrs_wk: '37.5', pay_cd: 'S', rt_p: 1450 },
    { emp_ref: 'E-00c2', wk_start: '20260105', hrs_wk: '12', pay_cd: 'N', rt_p: 1800 },
  ];
  async getRec(emp_ref: string, wk_start: string): Promise<LegacyPayrollRecord | undefined> {
    return this.data.find((r) => r.emp_ref.toLowerCase() === emp_ref.toLowerCase() && r.wk_start === wk_start);
  }
}
