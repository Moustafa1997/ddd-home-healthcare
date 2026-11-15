import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { VisitRecord } from './visit.entity';
import { BillingLineRecord } from './billing-line.entity';

/**
 * Lesson 03 — the same check-out, now with Active Record.
 *
 * Data access got tidier (no SQL strings), but the business logic
 * still lives HERE, in the service — not inside Visit.
 * That is why the book calls Active Record an evolved Transaction Script.
 */
@Injectable()
export class CheckOutVisitService {
  constructor(private readonly dataSource: DataSource) {}

  async execute(visitId: string, now: Date = new Date()): Promise<VisitRecord> {
    return this.dataSource.transaction(async (tx) => {
      const visit = await tx.getRepository(VisitRecord).findOne({ where: { id: visitId }, lock: { mode: 'pessimistic_write' } });
      if (!visit) throw new Error(`Visit ${visitId} not found`);
      if (visit.status === 'completed') throw new Error(`Visit ${visitId} already completed`);
      if (!visit.checkInAt) throw new Error(`Visit ${visitId} was never checked in`);

      // business rule — still outside the entity
      const durationMin = Math.round((now.getTime() - visit.checkInAt.getTime()) / 60000);
      if (durationMin <= 0) throw new Error('Check-out must be after check-in');

      visit.checkOutAt = now;
      visit.durationMin = durationMin;
      visit.status = 'completed';
      await tx.getRepository(VisitRecord).save(visit);

      const line = tx.getRepository(BillingLineRecord).create({ visitId, durationMin });
      await tx.getRepository(BillingLineRecord).save(line);

      return visit;
    });
  }
}
