import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Lesson 09 — a READ MODEL. Flat, denormalised, shaped for one screen.
 * No rules, no behaviour. Exactly the columns the office dashboard shows.
 */
@Entity({ name: 'visit_dashboard' })
export class VisitDashboardRow {
  @PrimaryColumn({ type: 'text', name: 'visit_id' }) visitId: string;
  @Column({ type: 'text', name: 'client_id' }) clientId: string;
  @Column({ type: 'text', name: 'caregiver_id', nullable: true }) caregiverId: string | null;
  @Column({ type: 'text' }) status: string;
  @Column({ type: 'int', name: 'duration_min', nullable: true }) durationMin: number | null;
  @Column({ type: 'timestamptz', name: 'updated_at' }) updatedAt: Date;
}
