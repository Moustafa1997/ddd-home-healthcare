import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'billing_lines' })
export class BillingLineRecord extends BaseEntity {
  @PrimaryGeneratedColumn() id: number;
  @Column({ type: 'text', name: 'visit_id' }) visitId: string;
  @Column({ type: 'int', name: 'duration_min' }) durationMin: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
