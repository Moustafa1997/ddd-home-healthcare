import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Persistence model — shaped for the database, NOT for the domain.
 * The domain never sees this class; the mapper translates.
 */
@Entity({ name: 'scheduling_visits' })
export class VisitOrmEntity {
  @PrimaryColumn({ type: 'text' }) id: string;
  @Column({ type: 'text', name: 'client_id' }) clientId: string;
  @Column({ type: 'text', name: 'caregiver_id', nullable: true }) caregiverId: string | null;
  @Column({ type: 'timestamptz', name: 'scheduled_start' }) scheduledStart: Date;
  @Column({ type: 'text' }) status: string;
  @Column({ type: 'timestamptz', name: 'check_in_at', nullable: true }) checkInAt: Date | null;
  @Column({ type: 'timestamptz', name: 'check_out_at', nullable: true }) checkOutAt: Date | null;
  @Column({ type: 'jsonb' }) tasks: { id: string; kind: string; description: string; done: boolean }[];
}
