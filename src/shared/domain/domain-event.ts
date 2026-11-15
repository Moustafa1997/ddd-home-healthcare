/**
 * A Domain Event: something that HAPPENED (past tense), carrying the data listeners need.
 * It is published only after the aggregate that produced it has been saved.
 */
export abstract class DomainEvent {
  readonly occurredAt: Date = new Date();
  abstract readonly aggregateId: string;
}
