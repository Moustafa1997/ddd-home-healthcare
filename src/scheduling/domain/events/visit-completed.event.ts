import { DomainEvent } from '../../../shared/domain/domain-event';

/** Past tense. Carries what Billing / Payroll / Notifications need — and nothing more. */
export class VisitCompleted extends DomainEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly clientId: string,
    public readonly caregiverId: string,
    public readonly durationMinutes: number,
    public readonly completedAt: Date,
  ) { super(); }
}
