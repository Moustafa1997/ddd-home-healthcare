import { DataSource } from 'typeorm';
import { EventBus } from '@nestjs/cqrs';
import { OutboxMessage } from './outbox-message.orm-entity';
import { OutboxRelay } from './outbox.relay';
import { VisitOrmEntity } from '../../scheduling/infrastructure/persistence/visit.orm-entity';
import { PostgresVisitRepository } from '../../scheduling/infrastructure/persistence/postgres-visit.repository';
import { Visit } from '../../scheduling/domain/visit';
import { VisitCompleted } from '../../scheduling/domain/events';

describe('Outbox pattern', () => {
  let ds: DataSource; let repo: PostgresVisitRepository; let bus: EventBus; let published: any[];

  beforeAll(async () => {
    ds = new DataSource({ type: 'postgres', url: process.env.DATABASE_URL ?? 'postgres://ddd:ddd@localhost:5432/home_healthcare', entities: [VisitOrmEntity, OutboxMessage], synchronize: true });
    await ds.initialize();
    repo = new PostgresVisitRepository(ds.getRepository(VisitOrmEntity), ds);
  });
  beforeEach(async () => {
    await ds.query('TRUNCATE scheduling_visits, outbox');
    published = [];
    bus = { publish: (e: any) => published.push(e) } as unknown as EventBus;
  });
  afterAll(() => ds.destroy());

  async function completedVisit() {
    const v = Visit.schedule('v1', 'client-1', new Date('2026-01-10T09:00:00Z'), [{ id: 't1', kind: 'medication', description: '' }]);
    v.assignCaregiver('c1'); v.checkIn(new Date('2026-01-10T09:05:00Z')); v.completeTask('t1'); v.checkOut(new Date('2026-01-10T10:05:00Z'));
    return v;
  }

  it('stores the event in the same transaction as the aggregate', async () => {
    await repo.save(await completedVisit());
    const [row] = await ds.getRepository(OutboxMessage).find();
    expect(row.eventType).toBe('VisitCompleted');
    expect(row.sentAt).toBeNull();
    expect(row.payload.durationMinutes).toBe(60);
  });

  it('if the aggregate save fails, no outbox row is written either', async () => {
    const v = await completedVisit();
    await ds.query(`ALTER TABLE scheduling_visits ADD CONSTRAINT block CHECK (status <> 'completed')`);
    try {
      await expect(repo.save(v)).rejects.toThrow();
      expect(await ds.getRepository(OutboxMessage).count()).toBe(0);
    } finally { await ds.query(`ALTER TABLE scheduling_visits DROP CONSTRAINT block`); }
  });

  it('the relay publishes pending rows as typed events and marks them sent', async () => {
    await repo.save(await completedVisit());
    const relay = new OutboxRelay(ds.getRepository(OutboxMessage), bus);
    relay.register(VisitCompleted);

    expect(await relay.relayOnce()).toBe(1);
    expect(published[0]).toBeInstanceOf(VisitCompleted);
    expect(published[0].durationMinutes).toBe(60);
    expect(await relay.relayOnce()).toBe(0); // nothing left
  });
});
