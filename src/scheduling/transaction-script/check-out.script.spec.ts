import { DataSource } from 'typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';
import { CheckOutVisitScript } from './check-out.script';

describe('CheckOutVisitScript (Transaction Script)', () => {
  let ds: DataSource;
  let script: CheckOutVisitScript;

  beforeAll(async () => {
    ds = new DataSource({
      type: 'postgres',
      url: process.env.DATABASE_URL ?? 'postgres://ddd:ddd@localhost:5432/home_healthcare',
    });
    await ds.initialize();
    await ds.query(readFileSync(join(__dirname, 'schema.sql'), 'utf8'));
    script = new CheckOutVisitScript(ds);
  });

  beforeEach(async () => {
    await ds.query(`TRUNCATE visits, billing_lines`);
    await ds.query(
      `INSERT INTO visits (id, client_name, caregiver_id, scheduled_at, check_in_at, status)
       VALUES ('v1', 'Mrs. Smith', 'c1', '2026-01-10 09:00+00', '2026-01-10 09:05+00', 'in_progress')`,
    );
  });

  afterAll(() => ds.destroy());

  it('completes the visit and writes the billing line together', async () => {
    await script.execute('v1', new Date('2026-01-10T10:05:00Z'));

    const [visit] = await ds.query(`SELECT status, duration_min FROM visits WHERE id = 'v1'`);
    const lines = await ds.query(`SELECT * FROM billing_lines WHERE visit_id = 'v1'`);

    expect(visit.status).toBe('completed');
    expect(visit.duration_min).toBe(60);
    expect(lines).toHaveLength(1);
  });

  it('rolls back the visit update when the billing insert fails', async () => {
    await ds.query(`ALTER TABLE billing_lines ADD CONSTRAINT no_lines CHECK (duration_min < 0)`);
    try {
      await expect(script.execute('v1', new Date('2026-01-10T10:05:00Z'))).rejects.toThrow();
      const [visit] = await ds.query(`SELECT status FROM visits WHERE id = 'v1'`);
      expect(visit.status).toBe('in_progress'); // NOT completed — the whole thing rolled back
    } finally {
      await ds.query(`ALTER TABLE billing_lines DROP CONSTRAINT no_lines`);
    }
  });

  it('refuses to complete a visit twice', async () => {
    await script.execute('v1', new Date('2026-01-10T10:05:00Z'));
    await expect(script.execute('v1')).rejects.toThrow(/already completed/);
  });
});
