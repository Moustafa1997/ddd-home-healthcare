import { Module } from '@nestjs/common';
import { PayrollProviderPort } from './domain/payroll-provider.port';
import { LegacyPayrollAcl } from './infrastructure/acl/legacy-payroll.acl';
import { LegacyPayrollClient } from './infrastructure/acl/legacy-payroll.client';
import { WeeklyPayService } from './application/weekly-pay.service';

/**
 * Payroll Bounded Context (Generic subdomain).
 * The real work is done by an external provider; we keep it behind an Anticorruption Layer.
 */
@Module({
  providers: [
    LegacyPayrollClient,
    { provide: PayrollProviderPort, useClass: LegacyPayrollAcl },
    WeeklyPayService,
  ],
  exports: [WeeklyPayService],
})
export class PayrollModule {}
