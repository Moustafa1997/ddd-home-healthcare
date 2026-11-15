import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Lesson 03 — Active Record.
 *
 * One row = one object. The object knows how to load and save itself
 * (BaseEntity gives us find(), save(), remove()).
 *
 * Notice what is NOT here: no business rules. The entity is still just data.
 */
@Entity({ name: 'visits' })
export class VisitRecord extends BaseEntity {
  @PrimaryColumn({ type: 'text' }) id: string;
  @Column({ type: 'text', name: 'client_name' }) clientName: string;
  @Column({ type: 'text', name: 'caregiver_id' }) caregiverId: string;
  @Column({ type: 'timestamptz', name: 'scheduled_at' }) scheduledAt: Date;
  @Column({ type: 'timestamptz', name: 'check_in_at', nullable: true }) checkInAt: Date | null;
  @Column({ type: 'timestamptz', name: 'check_out_at', nullable: true }) checkOutAt: Date | null;
  @Column({ type: 'int', name: 'duration_min', nullable: true }) durationMin: number | null;
  @Column({ type: 'text', default: 'scheduled' }) status: 'scheduled' | 'in_progress' | 'completed';
}
