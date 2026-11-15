import { AggregateRoot } from '../../../shared/domain/aggregate-root';
import { DomainError } from '../../../shared/domain/domain.error';
import { VisitTime } from '../value-objects';
import { Task, TaskKind } from './task';
import { VisitCompleted } from '../events/visit-completed.event';

export type VisitStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface VisitProps {
  clientId: string;
  caregiverId: string | null;   // reference by id — Caregiver is another aggregate
  scheduledStart: Date;
  tasks: Task[];
  status: VisitStatus;
  checkInAt: Date | null;
  time: VisitTime | null;        // set at check-out
}

/**
 * Lesson 05 — Visit is the Aggregate Root.
 *
 *  - Every change goes through a method here (the single entry point).
 *  - The invariant "cannot complete unless the medication task is done" is enforced here.
 *  - Other aggregates (Caregiver, Client) are referenced by id only.
 */
export class Visit extends AggregateRoot<string> {
  private props: VisitProps;

  private constructor(id: string, props: VisitProps) {
    super(id);
    this.props = props;
  }

  // ---------- factories ----------
  static schedule(id: string, clientId: string, scheduledStart: Date, tasks: { id: string; kind: TaskKind; description: string }[]): Visit {
    if (tasks.length === 0) throw new DomainError('A visit needs at least one task');
    return new Visit(id, {
      clientId, caregiverId: null, scheduledStart,
      tasks: tasks.map((t) => Task.create(t.id, t.kind, t.description)),
      status: 'scheduled', checkInAt: null, time: null,
    });
  }

  static rehydrate(id: string, props: VisitProps): Visit { return new Visit(id, props); }

  // ---------- behaviour (the only way to change state) ----------
  assignCaregiver(caregiverId: string): void {
    this.ensureStatus('scheduled', 'assign a caregiver');
    this.props.caregiverId = caregiverId;
  }

  checkIn(at: Date): void {
    this.ensureStatus('scheduled', 'check in');
    if (!this.props.caregiverId) throw new DomainError('Cannot check in without an assigned caregiver');
    this.props.checkInAt = at;
    this.props.status = 'in_progress';
  }

  completeTask(taskId: string): void {
    this.ensureStatus('in_progress', 'complete a task');
    const task = this.props.tasks.find((t) => t.id === taskId);
    if (!task) throw new DomainError(`Task ${taskId} is not part of this visit`);
    task.markDone();
  }

  checkOut(at: Date): void {
    this.ensureStatus('in_progress', 'check out');
    const medication = this.props.tasks.find((t) => t.kind === 'medication');
    if (medication && !medication.done) {
      throw new DomainError('Cannot complete the visit: medication task is not done');
    }
    // VisitTime validates "end after start" for us
    this.props.time = VisitTime.create(this.props.checkInAt!, at);
    this.props.status = 'completed';
    // Lesson 06: record the fact. It is published AFTER the aggregate is saved.
    this.record(new VisitCompleted(this.id, this.props.clientId, this.props.caregiverId!, this.props.time.durationMinutes, at));
  }

  cancel(): void {
    if (this.props.status === 'completed') throw new DomainError('Cannot cancel a completed visit');
    this.props.status = 'cancelled';
  }

  // ---------- read-only views ----------
  get status(): VisitStatus { return this.props.status; }
  get clientId(): string { return this.props.clientId; }
  get caregiverId(): string | null { return this.props.caregiverId; }
  get scheduledStart(): Date { return this.props.scheduledStart; }
  get checkInAt(): Date | null { return this.props.checkInAt; }
  get time(): VisitTime | null { return this.props.time; }
  get durationMinutes(): number | null { return this.props.time?.durationMinutes ?? null; }
  /** Defensive copy: callers cannot mutate tasks from outside. */
  get tasks(): ReadonlyArray<Readonly<{ id: string; kind: TaskKind; description: string; done: boolean }>> {
    return this.props.tasks.map((t) => ({ id: t.id, kind: t.kind, description: t.description, done: t.done }));
  }

  private ensureStatus(expected: VisitStatus, action: string): void {
    if (this.props.status !== expected) {
      throw new DomainError(`Cannot ${action}: visit is ${this.props.status}, expected ${expected}`);
    }
  }
}
