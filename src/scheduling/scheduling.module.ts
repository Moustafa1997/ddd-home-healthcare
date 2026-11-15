import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckOutVisitScript } from './transaction-script/check-out.script';
import { CheckOutVisitService } from './active-record/check-out.service';
import { VisitRecord } from './active-record/visit.entity';
import { BillingLineRecord } from './active-record/billing-line.entity';
import { VisitRepository } from './application/visit.repository';
import { InMemoryVisitRepository } from './application/in-memory-visit.repository';
import { CheckOutVisitUseCase } from './application/check-out-visit.use-case';

/**
 * Scheduling Bounded Context (Core subdomain).
 * Nothing outside this folder may import from inside it except through its public API (index.ts).
 */
@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([VisitRecord, BillingLineRecord])],
  providers: [
    CheckOutVisitScript,
    CheckOutVisitService,
    { provide: VisitRepository, useClass: InMemoryVisitRepository },
    CheckOutVisitUseCase,
  ],
  exports: [CheckOutVisitUseCase, VisitRepository],
})
export class SchedulingModule {}
