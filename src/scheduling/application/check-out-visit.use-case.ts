import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { VisitRepository } from './visit.repository';
import { DomainError } from '../../shared/domain/domain.error';

/**
 * Lesson 06 — application service.
 *
 * 1. load the aggregate
 * 2. call ONE behaviour on it
 * 3. save
 * 4. publish the events it recorded — only after the save succeeded
 *
 * Notice: this class does not know who listens. Billing, Payroll, Notifications
 * subscribe on their own. Adding a listener never touches this file.
 */
@Injectable()
export class CheckOutVisitUseCase {
  constructor(private readonly visits: VisitRepository, private readonly events: EventBus) {}

  async execute(visitId: string, at: Date = new Date()): Promise<void> {
    const visit = await this.visits.findById(visitId);
    if (!visit) throw new DomainError(`Visit ${visitId} not found`);

    visit.checkOut(at);
    await this.visits.save(visit);

    for (const event of visit.pullEvents()) this.events.publish(event);
  }
}
