import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoredEvent } from './stored-event.orm-entity';
import { DomainError } from '../domain/domain.error';

export interface EventEnvelope { type: string; payload: Record<string, unknown>; version: number }

@Injectable()
export class EventStore {
  constructor(@InjectRepository(StoredEvent) private readonly rows: Repository<StoredEvent>) {}

  async load(streamId: string): Promise<EventEnvelope[]> {
    const rows = await this.rows.find({ where: { streamId }, order: { version: 'ASC' } });
    return rows.map((r) => ({ type: r.eventType, payload: r.payload, version: r.version }));
  }

  /**
   * Optimistic concurrency: `expectedVersion` is the version we loaded.
   * The unique (stream_id, version) index rejects two writers appending the same version.
   */
  async append(streamId: string, expectedVersion: number, events: { type: string; payload: Record<string, unknown> }[]): Promise<void> {
    const rows = events.map((e, i) => this.rows.create({ streamId, version: expectedVersion + i + 1, eventType: e.type, payload: e.payload }));
    try { await this.rows.save(rows); }
    catch (err: any) {
      if (err?.code === '23505') throw new DomainError(`Concurrent modification on stream ${streamId}`);
      throw err;
    }
  }
}
