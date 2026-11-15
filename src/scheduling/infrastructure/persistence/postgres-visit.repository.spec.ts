import { DataSource } from 'typeorm';
import { VisitOrmEntity } from './visit.orm-entity';
import { PostgresVisitRepository } from './postgres-visit.repository';
import { Visit } from '../../domain/visit';

describe('PostgresVisitRepository (adapter)', () => {
  let ds: DataSource; let repo: PostgresVisitRepository;

  beforeAll(async () => {
    ds = new DataSource({ type: 'postgres', url: process.env.DATABASE_URL ?? 'postgres://ddd:ddd@localhost:5432/home_healthcare', entities: [VisitOrmEntity], synchronize: true });
    await ds.initialize();
    repo = new PostgresVisitRepository(ds.getRepository(VisitOrmEntity));
  });
  beforeEach(() => ds.query('TRUNCATE scheduling_visits'));
  afterAll(() => ds.destroy());

  it('round-trips the aggregate through the row without losing behaviour', async () => {
    const v = Visit.schedule('v1', 'client-1', new Date('2026-01-10T09:00:00Z'), [{ id: 't1', kind: 'medication', description: 'insulin' }]);
    v.assignCaregiver('c1'); v.checkIn(new Date('2026-01-10T09:05:00Z'));
    await repo.save(v);

    const loaded = (await repo.findById('v1'))!;
    expect(loaded.status).toBe('in_progress');
    expect(() => loaded.checkOut(new Date('2026-01-10T10:05:00Z'))).toThrow(/medication/); // rules survived the trip
    loaded.completeTask('t1'); loaded.checkOut(new Date('2026-01-10T10:05:00Z'));
    await repo.save(loaded);

    expect((await repo.findById('v1'))!.durationMinutes).toBe(60);
  });
});
