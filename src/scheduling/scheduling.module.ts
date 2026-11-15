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
import { VisitDashboardRow } from './read-model/visit-dashboard.orm-entity';
import { VisitDashboardProjection } from './read-model/visit-dashboard.projection';
import { DashboardQuery } from './read-model/dashboard.query';
import { DashboardController } from './infrastructure/http/dashboard.controller';
import { OutboxModule } from '../shared/outbox/outbox.module';
import { OutboxRelay } from '../shared/outbox/outbox.relay';
import { VisitCompleted } from './domain/events';

/**
 * Scheduling Bounded Context (Core subdomain).
 *
 * Layout (Ports & Adapters):
 *   domain/          — aggregates, value objects, events, services, PORTS   (no framework imports)
 *   application/     — use cases orchestrating the domain
 *   infrastructure/  — ADAPTERS: persistence (Postgres), http (REST)
 *   read-model/      — CQRS query side: flat tables + projections (lesson 09)
 */
@Module({
  imports: [CqrsModule, OutboxModule, TypeOrmModule.forFeature([VisitRecord, BillingLineRecord, VisitOrmEntity, VisitDashboardRow])],
  controllers: [VisitsController, DashboardController],
  providers: [
    CheckOutVisitScript,
    CheckOutVisitService,
    { provide: VisitRepository, useClass: PostgresVisitRepository },
    CheckOutVisitUseCase,
    VisitDashboardProjection,
    DashboardQuery,
  ],
  exports: [CheckOutVisitUseCase, VisitRepository],
})
export class SchedulingModule {
  constructor(relay: OutboxRelay) { relay.register(VisitCompleted); }
}
