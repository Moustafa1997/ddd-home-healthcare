import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VisitCompleted } from '../domain/events';
import { VisitDashboardRow } from './visit-dashboard.orm-entity';

/**
 * Projection: listens to domain events and keeps the read model up to date.
 * The write side (Visit aggregate) knows nothing about this table.
 * There is a small delay between write and read — eventual consistency.
 */
@EventsHandler(VisitCompleted)
export class VisitDashboardProjection implements IEventHandler<VisitCompleted> {
  constructor(@InjectRepository(VisitDashboardRow) private readonly rows: Repository<VisitDashboardRow>) {}

  async handle(e: VisitCompleted): Promise<void> {
    await this.rows.save({
      visitId: e.aggregateId, clientId: e.clientId, caregiverId: e.caregiverId,
      status: 'completed', durationMin: e.durationMinutes, updatedAt: e.occurredAt,
    });
  }
}
