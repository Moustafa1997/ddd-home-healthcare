import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { VisitCompleted } from '../../scheduling/domain/events';

/**
 * Billing listens. It never calls Scheduling; it reacts to what Scheduling announced.
 * (In lesson 12 this import crosses contexts through a published contract instead of a domain event.)
 */
@EventsHandler(VisitCompleted)
export class CreateInvoiceOnVisitCompleted implements IEventHandler<VisitCompleted> {
  private readonly log = new Logger('Billing');
  readonly invoices: { visitId: string; minutes: number }[] = [];

  handle(e: VisitCompleted) {
    this.invoices.push({ visitId: e.aggregateId, minutes: e.durationMinutes });
    this.log.log(`Invoice created for visit ${e.aggregateId} (${e.durationMinutes} min)`);
  }
}
