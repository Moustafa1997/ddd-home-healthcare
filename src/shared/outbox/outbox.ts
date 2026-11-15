import { EntityManager } from 'typeorm';
import { DomainEvent } from '../domain/domain-event';
import { OutboxMessage } from './outbox-message.orm-entity';

/** Write events into the outbox using the caller's transaction. */
export async function enqueueToOutbox(tx: EntityManager, events: DomainEvent[]): Promise<void> {
  if (events.length === 0) return;
  const rows = events.map((e) => tx.getRepository(OutboxMessage).create({
    eventType: e.constructor.name,
    aggregateId: e.aggregateId,
    payload: { ...e } as Record<string, unknown>,
    sentAt: null,
  }));
  await tx.getRepository(OutboxMessage).save(rows);
}
