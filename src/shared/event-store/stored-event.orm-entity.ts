import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

/** Lesson 13 — append-only. No UPDATE, no DELETE. Ever. */
@Entity({ name: 'event_store' })
@Unique(['streamId', 'version'])
export class StoredEvent {
  @PrimaryGeneratedColumn('increment') sequence: number;
  @Index() @Column({ type: 'text', name: 'stream_id' }) streamId: string;
  @Column({ type: 'int' }) version: number;
  @Column({ type: 'text', name: 'event_type' }) eventType: string;
  @Column({ type: 'jsonb' }) payload: Record<string, unknown>;
  @CreateDateColumn({ name: 'recorded_at' }) recordedAt: Date;
}
