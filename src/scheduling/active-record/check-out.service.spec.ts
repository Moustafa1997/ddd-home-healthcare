import { DataSource } from 'typeorm';
import { VisitRecord } from './visit.entity';
import { BillingLineRecord } from './billing-line.entity';
import { CheckOutVisitService } from './check-out.service';

describe('CheckOutVisitService (Active Record)', () => {
  let ds: DataSource;
  let service: CheckOutVisitService;

  beforeAll(async () => {
    ds = new DataSource({
      type: 'postgres',
      url: process.env.DATABASE_URL ?? 'postgres://ddd:ddd@localhost:5432/home_healthcare',
      entities: [VisitRecord, BillingLineRecord],
      synchronize: true,
    });
    await ds.initialize();
    service = new CheckOutVisitService(ds);
  });

  beforeEach(async () => {
    await ds.query(`TRUNCATE visits, billing_lines`);
    await VisitRecord.create({
      id: 'v1', clientName: 'Mrs. Smith', caregiverId: 'c1',
      scheduledAt: new Date('2026-01-10T09:00:00Z'), checkInAt: new Date('2026-01-10T09:05:00Z'), status: 'in_progress',
    }).save();
  });

  afterAll(() => ds.destroy());

  it('loads, mutates and saves the record', async () => {
    const visit = await service.execute('v1', new Date('2026-01-10T10:05:00Z'));
    expect(visit.status).toBe('completed');
    expect(visit.durationMin).toBe(60);
    expect(await BillingLineRecord.count({ where: { visitId: 'v1' } })).toBe(1);
  });

  it('the entity itself cannot protect its rules (this is the limitation)', async () => {
    const visit = await VisitRecord.findOneByOrFail({ id: 'v1' });
    visit.status = 'completed'; // nothing stops this — no check-in, no duration, no billing line
    await visit.save();
    expect((await VisitRecord.findOneByOrFail({ id: 'v1' })).status).toBe('completed');
    expect(await BillingLineRecord.count()).toBe(0); // inconsistent state is possible
  });
});
