import { Injectable } from '@nestjs/common';
import { EventStore } from '../../shared/event-store/event-store';
import { EventSourcedVisit } from './visit.es';
import { VisitEvent } from './visit.events';
import { DomainError } from '../../shared/domain/domain.error';

/** Loads by replaying the stream; saves by appending only the new events. */
@Injectable()
export class EventSourcedVisitRepository {
  constructor(private readonly store: EventStore) {}

  async load(id: string): Promise<EventSourcedVisit> {
    const history = await this.store.load(`visit-${id}`);
    if (history.length === 0) throw new DomainError(`Visit ${id} not found`);
    return EventSourcedVisit.fromHistory(id, history.map((h) => ({ type: h.type, ...h.payload }) as VisitEvent));
  }

  async save(visit: EventSourcedVisit): Promise<void> {
    const events = visit.pullPending();
    await this.store.append(`visit-${visit.id}`, visit.version, events.map(({ type, ...payload }) => ({ type, payload })));
  }

  /** The audit question from the Compliance Officer: "what exactly happened, and when?" */
  async history(id: string) { return this.store.load(`visit-${id}`); }
}
