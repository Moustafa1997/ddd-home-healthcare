import { Module } from '@nestjs/common';
import { CheckOutVisitScript } from './transaction-script/check-out.script';

/**
 * Scheduling Bounded Context (Core subdomain).
 * Nothing outside this folder may import from inside it except through its public API (index.ts).
 */
@Module({
  providers: [CheckOutVisitScript],
  exports: [CheckOutVisitScript],
})
export class SchedulingModule {}
