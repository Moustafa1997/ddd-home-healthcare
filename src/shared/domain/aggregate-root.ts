import { Entity } from './entity';
import { DomainEvent } from './domain-event';

/**
 * An Aggregate Root collects the events it produces.
 * The application layer saves the aggregate, THEN publishes them (lesson 06).
 */
export abstract class AggregateRoot<Id = string> extends Entity<Id> {
  private readonly _events: DomainEvent[] = [];

  protected record(event: DomainEvent): void { this._events.push(event); }

  /** Returns and clears pending events. Called once, after a successful save. */
  pullEvents(): DomainEvent[] {
    const out = [...this._events];
    this._events.length = 0;
    return out;
  }
}
