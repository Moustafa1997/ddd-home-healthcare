import { Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { OutboxMessage } from './outbox-message.orm-entity';
import { DomainEvent } from '../domain/domain-event';

type EventCtor = new (...args: any[]) => DomainEvent;

/**
 * The relay: a separate loop that reads unsent rows, publishes them, marks them sent.
 * If it crashes after publishing but before marking, the event is sent twice —
 * so every listener must be idempotent.
 */
@Injectable()
export class OutboxRelay {
  private readonly log = new Logger(OutboxRelay.name);
  private readonly registry = new Map<string, EventCtor>();

  constructor(@InjectRepository(OutboxMessage) private readonly rows: Repository<OutboxMessage>, private readonly bus: EventBus) {}

  /** Tell the relay how to rebuild a typed event from its stored name. */
  register(...ctors: EventCtor[]): void { ctors.forEach((c) => this.registry.set(c.name, c)); }

  /** One pass. Call it from a scheduler (setInterval / cron) in a real app. */
  async relayOnce(batch = 50): Promise<number> {
    const pending = await this.rows.find({ where: { sentAt: IsNull() }, order: { createdAt: 'ASC' }, take: batch });
    for (const msg of pending) {
      const Ctor = this.registry.get(msg.eventType);
      if (!Ctor) { this.log.warn(`No event registered for ${msg.eventType}`); continue; }
      const event = Object.assign(Object.create(Ctor.prototype), msg.payload) as DomainEvent;
      this.bus.publish(event);
      await this.rows.update(msg.id, { sentAt: new Date() });
    }
    return pending.length;
  }
}
