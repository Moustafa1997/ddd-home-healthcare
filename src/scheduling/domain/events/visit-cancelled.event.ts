import { DomainEvent } from '../../../shared/domain/domain-event';

export class VisitCancelled extends DomainEvent {
  constructor(public readonly aggregateId: string, public readonly caregiverId: string | null, public readonly cancelledAt: Date) { super(); }
}
