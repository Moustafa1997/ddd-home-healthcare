import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Visit } from '../../domain/visit';
import { VisitRepository } from '../../domain/ports/visit.repository';

/** Test adapter: no transactions, so it publishes immediately after "saving". */
@Injectable()
export class InMemoryVisitRepository extends VisitRepository {
  private readonly store = new Map<string, Visit>();
  constructor(private readonly bus: EventBus) { super(); }
  async findById(id: string) { return this.store.get(id) ?? null; }
  async save(visit: Visit) {
    this.store.set(visit.id, visit);
    visit.pullEvents().forEach((e) => this.bus.publish(e));
  }
}
