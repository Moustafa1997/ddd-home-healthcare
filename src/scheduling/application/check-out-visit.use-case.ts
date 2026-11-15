import { Injectable } from '@nestjs/common';
import { VisitRepository } from '../domain/ports/visit.repository';
import { DomainError } from '../../shared/domain/domain.error';

/**
 * Lesson 10 — the use case no longer publishes.
 * The repository stores events in the outbox inside the same transaction,
 * and the OutboxRelay publishes them. No lost events, no phantom events.
 */
@Injectable()
export class CheckOutVisitUseCase {
  constructor(private readonly visits: VisitRepository) {}

  async execute(visitId: string, at: Date = new Date()): Promise<void> {
    const visit = await this.visits.findById(visitId);
    if (!visit) throw new DomainError(`Visit ${visitId} not found`);
    visit.checkOut(at);
    await this.visits.save(visit);
  }
}
