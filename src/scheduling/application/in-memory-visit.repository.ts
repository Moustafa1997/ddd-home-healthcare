import { Injectable } from '@nestjs/common';
import { Visit } from '../domain/visit';
import { VisitRepository } from './visit.repository';

@Injectable()
export class InMemoryVisitRepository extends VisitRepository {
  private readonly store = new Map<string, Visit>();
  async findById(id: string) { return this.store.get(id) ?? null; }
  async save(visit: Visit) { this.store.set(visit.id, visit); }
}
