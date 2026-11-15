import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SchedulingModule } from './scheduling/scheduling.module';
import { BillingModule } from './billing/billing.module';
import { PayrollModule } from './payroll/payroll.module';
import { NotificationsModule } from './notifications/notifications.module';

/**
 * Each module below is a Bounded Context.
 * The same word (e.g. "Visit") can mean different things in different modules,
 * and that is by design. See each module's GLOSSARY.md.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SchedulingModule,
    BillingModule,
    PayrollModule,
    NotificationsModule,
  ],
})
export class AppModule {}
