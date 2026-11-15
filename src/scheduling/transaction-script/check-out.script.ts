import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Lesson 02 — Transaction Script.
 *
 * One procedure, top to bottom, inside ONE database transaction.
 * If any step fails, everything rolls back: a visit can never be
 * "completed" without its billing line.
 */
@Injectable()
export class CheckOutVisitScript {
  constructor(private readonly dataSource: DataSource) {}

  async execute(visitId: string, now: Date = new Date()): Promise<void> {
    await this.dataSource.transaction(async (tx) => {
      // 1. load
      const [visit] = await tx.query(`SELECT * FROM visits WHERE id = $1 FOR UPDATE`, [visitId]);
      if (!visit) throw new Error(`Visit ${visitId} not found`);
      if (visit.status === 'completed') throw new Error(`Visit ${visitId} already completed`);
      if (!visit.check_in_at) throw new Error(`Visit ${visitId} was never checked in`);

      // 2. compute
      const durationMin = Math.round((now.getTime() - new Date(visit.check_in_at).getTime()) / 60000);
      if (durationMin <= 0) throw new Error('Check-out must be after check-in');

      // 3. update visit
      await tx.query(
        `UPDATE visits SET check_out_at = $2, duration_min = $3, status = 'completed' WHERE id = $1`,
        [visitId, now, durationMin],
      );

      // 4. insert billing line — same transaction
      await tx.query(`INSERT INTO billing_lines (visit_id, duration_min) VALUES ($1, $2)`, [
        visitId,
        durationMin,
      ]);
    });
  }
}
