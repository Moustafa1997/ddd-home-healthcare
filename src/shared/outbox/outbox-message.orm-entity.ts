import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/** Lesson 10 — the outbox table. Lives in the SAME database as the aggregates. */
@Entity({ name: 'outbox' })
export class OutboxMessage {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'text', name: 'event_type' }) eventType: string;
  @Column({ type: 'text', name: 'aggregate_id' }) aggregateId: string;
  @Column({ type: 'jsonb' }) payload: Record<string, unknown>;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @Index() @Column({ type: 'timestamptz', name: 'sent_at', nullable: true }) sentAt: Date | null;
}
