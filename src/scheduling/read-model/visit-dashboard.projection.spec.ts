import { DataSource } from 'typeorm';
import { VisitDashboardRow } from './visit-dashboard.orm-entity';
import { VisitDashboardProjection } from './visit-dashboard.projection';
import { DashboardQuery } from './dashboard.query';
import { VisitCompleted } from '../domain/events';

describe('CQRS read model', () => {
  let ds: DataSource;
  beforeAll(async () => {
    ds = new DataSource({ type: 'postgres', url: process.env.DATABASE_URL ?? 'postgres://ddd:ddd@localhost:5432/home_healthcare', entities: [VisitDashboardRow], synchronize: true });
    await ds.initialize();
  });
  beforeEach(() => ds.query('TRUNCATE visit_dashboard'));
  afterAll(() => ds.destroy());

  it('projection writes a flat row from the event; query reads it without touching aggregates', async () => {
    const repo = ds.getRepository(VisitDashboardRow);
    const projection = new VisitDashboardProjection(repo);
    const query = new DashboardQuery(repo);

    await projection.handle(new VisitCompleted('v1', 'client-1', 'c1', 60, new Date('2026-01-10T10:05:00Z')));
    await projection.handle(new VisitCompleted('v2', 'client-2', 'c2', 45, new Date('2026-01-10T11:00:00Z')));

    const rows = await query.completedVisits();
    expect(rows.map((r) => r.visitId)).toEqual(['v2', 'v1']);
    expect(rows[1].durationMin).toBe(60);
  });

  it('is idempotent: the same event twice yields one row', async () => {
    const repo = ds.getRepository(VisitDashboardRow);
    const projection = new VisitDashboardProjection(repo);
    const e = new VisitCompleted('v1', 'client-1', 'c1', 60, new Date());
    await projection.handle(e); await projection.handle(e);
    expect(await repo.count()).toBe(1);
  });
});
