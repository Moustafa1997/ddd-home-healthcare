import { DataSource } from 'typeorm';
import { StoredEvent } from '../../shared/event-store/stored-event.orm-entity';
import { EventStore } from '../../shared/event-store/event-store';
import { EventSourcedVisitRepository } from './es-visit.repository';
import { EventSourcedVisit } from './visit.es';
import { DomainError } from '../../shared/domain/domain.error';

describe('Event Sourcing', () => {
  let ds: DataSource; let repo: EventSourcedVisitRepository;
  beforeAll(async () => {
    ds = new DataSource({ type: 'postgres', url: process.env.DATABASE_URL ?? 'postgres://ddd:ddd@localhost:5432/home_healthcare', entities: [StoredEvent], synchronize: true });
    await ds.initialize();
    repo = new EventSourcedVisitRepository(new EventStore(ds.getRepository(StoredEvent)));
  });
  beforeEach(() => ds.query('TRUNCATE event_store'));
  afterAll(() => ds.destroy());

  it('state is rebuilt by replaying events; nothing is ever updated', async () => {
    const v = EventSourcedVisit.schedule('v1', 'client-1', new Date('2026-01-10T09:00:00Z'), [{ id: 't1', kind: 'medication', description: '' }]);
    v.assignCaregiver('c1'); v.start(new Date('2026-01-10T09:05:00Z'));
    await repo.save(v);

    const loaded = await repo.load('v1');
    expect(loaded.currentStatus).toBe('in_progress');
    expect(loaded.version).toBe(3);

    loaded.completeTask('t1'); loaded.complete(new Date('2026-01-10T10:05:00Z'));
    await repo.save(loaded);

    const history = await repo.history('v1');
    expect(history.map((h) => h.type)).toEqual(['VisitScheduled', 'CaregiverAssigned', 'VisitStarted', 'TaskCompleted', 'VisitCompleted']);
    expect(history[4].payload.durationMinutes).toBe(60);
  });

  it('rules still apply on replayed aggregates', async () => {
    const v = EventSourcedVisit.schedule('v2', 'client-1', new Date(), [{ id: 't1', kind: 'medication', description: '' }]);
    v.assignCaregiver('c1'); v.start(new Date('2026-01-10T09:05:00Z'));
    await repo.save(v);
    const loaded = await repo.load('v2');
    expect(() => loaded.complete(new Date('2026-01-10T10:05:00Z'))).toThrow(/medication/);
  });

  it('optimistic concurrency: two writers on the same version → one wins', async () => {
    const v = EventSourcedVisit.schedule('v3', 'client-1', new Date(), [{ id: 't1', kind: 'care_notes', description: '' }]);
    await repo.save(v);
    const a = await repo.load('v3'); const b = await repo.load('v3');
    a.assignCaregiver('c1'); b.assignCaregiver('c2');
    await repo.save(a);
    await expect(repo.save(b)).rejects.toThrow(DomainError);
  });
});
