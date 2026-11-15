import { Visit, VisitStatus, Task, TaskKind } from '../../domain/visit';
import { VisitTime } from '../../domain/value-objects';
import { VisitOrmEntity } from './visit.orm-entity';

/** Translates between the aggregate (behaviour) and the row (storage). */
export class VisitMapper {
  static toDomain(row: VisitOrmEntity): Visit {
    return Visit.rehydrate(row.id, {
      clientId: row.clientId,
      caregiverId: row.caregiverId,
      scheduledStart: row.scheduledStart,
      status: row.status as VisitStatus,
      checkInAt: row.checkInAt,
      time: row.checkInAt && row.checkOutAt ? VisitTime.create(row.checkInAt, row.checkOutAt) : null,
      tasks: row.tasks.map((t) => Task.rehydrate(t.id, t.kind as TaskKind, t.description, t.done)),
    });
  }

  static toRow(visit: Visit): VisitOrmEntity {
    const row = new VisitOrmEntity();
    row.id = visit.id;
    row.clientId = visit.clientId;
    row.caregiverId = visit.caregiverId;
    row.scheduledStart = visit.scheduledStart;
    row.status = visit.status;
    row.checkInAt = visit.checkInAt;
    row.checkOutAt = visit.time?.end ?? null;
    row.tasks = visit.tasks.map((t) => ({ ...t }));
    return row;
  }
}
