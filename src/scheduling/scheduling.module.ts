import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckOutVisitScript } from './transaction-script/check-out.script';
import { CheckOutVisitService } from './active-record/check-out.service';
import { VisitRecord } from './active-record/visit.entity';
import { BillingLineRecord } from './active-record/billing-line.entity';

/**
 * Scheduling Bounded Context (Core subdomain).
 * Nothing outside this folder may import from inside it except through its public API (index.ts).
 */
@Module({
  imports: [TypeOrmModule.forFeature([VisitRecord, BillingLineRecord])],
  providers: [CheckOutVisitScript, CheckOutVisitService],
  exports: [CheckOutVisitService],
})
export class SchedulingModule {}
