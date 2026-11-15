import { Injectable } from '@nestjs/common';
import { PayrollProviderPort } from '../domain/payroll-provider.port';

/** Uses OUR model only. Has no idea a legacy vendor exists. */
@Injectable()
export class WeeklyPayService {
  constructor(private readonly provider: PayrollProviderPort) {}

  async grossPayPence(caregiverId: string, weekStarting: Date): Promise<number> {
    const ts = await this.provider.fetchTimesheet(caregiverId, weekStarting);
    return Math.round(ts.worked.hours * ts.rate.perHourPence);
  }
}
