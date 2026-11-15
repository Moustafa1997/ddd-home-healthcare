import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckOutVisitScript } from './transaction-script/check-out.script';
import { CheckOutVisitService } from './active-record/check-out.service';
import { VisitRecord } from './active-record/visit.entity';
import { BillingLineRecord } from './active-record/billing-line.entity';
import { VisitRepository } from './domain/ports';
import { VisitOrmEntity } from './infrastructure/persistence/visit.orm-entity';
import { PostgresVisitRepository } from './infrastructure/persistence/postgres-visit.repository';
import { CheckOutVisitUseCase } from './application/check-out-visit.use-case';
import { VisitsController } from './infrastructure/http/visits.controller';

/**
 * Scheduling Bounded Context (Core subdomain).
 *
 * Layout (Ports & Adapters):
 *   domain/          — aggregates, value objects, events, services, PORTS   (no framework imports)
 *   application/     — use cases orchestrating the domain
 *   infrastructure/  — ADAPTERS: persistence (Postgres), http (REST)
 */
@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([VisitRecord, BillingLineRecord, VisitOrmEntity])],
  controllers: [VisitsController],
  providers: [
    CheckOutVisitScript,
    CheckOutVisitService,
    { provide: VisitRepository, useClass: PostgresVisitRepository },
    CheckOutVisitUseCase,
  ],
  exports: [CheckOutVisitUseCase, VisitRepository],
})
export class SchedulingModule {}
