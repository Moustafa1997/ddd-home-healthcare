import { DomainError } from '../../shared/domain/domain.error';
import { VisitEvent } from './visit.events';
import { VisitTime } from '../domain/value-objects';

type Status = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Lesson 13 — an event-sourced Visit.
 *
 * Two kinds of methods:
 *   - commands (schedule, assign, start, completeTask, complete, cancel): CHECK rules, then RAISE an event
 *   - apply(event): CHANGE state. No checks here — the event already happened.
 *
 * Current state = replay all events through apply(). Nothing is ever overwritten.
 */
export class EventSourcedVisit {
  private status: Status | null = null;
  private caregiverId: string | null = null;
  private startedAt: Date | null = null;
  private tasks = new Map<string, { kind: string; done: boolean }>();
  private _version = 0;
  private pending: VisitEvent[] = [];

  private constructor(public readonly id: string) {}

  // ---------- rebuild from history ----------
  static fromHistory(id: string, history: VisitEvent[]): EventSourcedVisit {
    const v = new EventSourcedVisit(id);
    history.forEach((e) => { v.apply(e); v._version++; });
    return v;
  }

  // ---------- commands ----------
  static schedule(id: string, clientId: string, scheduledStart: Date, tasks: { id: string; kind: string; description: string }[]): EventSourcedVisit {
    if (tasks.length === 0) throw new DomainError('A visit needs at least one task');
    const v = new EventSourcedVisit(id);
    v.raise({ type: 'VisitScheduled', clientId, scheduledStart: scheduledStart.toISOString(), tasks });
    return v;
  }
  assignCaregiver(caregiverId: string) { this.expect('scheduled'); this.raise({ type: 'CaregiverAssigned', caregiverId }); }
  start(at: Date) {
    this.expect('scheduled');
    if (!this.caregiverId) throw new DomainError('Cannot start without a caregiver');
    this.raise({ type: 'VisitStarted', at: at.toISOString() });
  }
  completeTask(taskId: string) {
    this.expect('in_progress');
    if (!this.tasks.has(taskId)) throw new DomainError(`Task ${taskId} is not part of this visit`);
    this.raise({ type: 'TaskCompleted', taskId });
  }
  complete(at: Date) {
    this.expect('in_progress');
    const med = [...this.tasks.values()].find((t) => t.kind === 'medication');
    if (med && !med.done) throw new DomainError('Cannot complete the visit: medication task is not done');
    const time = VisitTime.create(this.startedAt!, at);
    this.raise({ type: 'VisitCompleted', at: at.toISOString(), durationMinutes: time.durationMinutes });
  }
  cancel(at: Date) {
    if (this.status === 'completed') throw new DomainError('Cannot cancel a completed visit');
    if (this.status === 'cancelled') return;
    this.raise({ type: 'VisitCancelled', at: at.toISOString() });
  }

  // ---------- state transitions (no rules here) ----------
  private apply(e: VisitEvent): void {
    switch (e.type) {
      case 'VisitScheduled': this.status = 'scheduled'; e.tasks.forEach((t) => this.tasks.set(t.id, { kind: t.kind, done: false })); break;
      case 'CaregiverAssigned': this.caregiverId = e.caregiverId; break;
      case 'VisitStarted': this.status = 'in_progress'; this.startedAt = new Date(e.at); break;
      case 'TaskCompleted': this.tasks.get(e.taskId)!.done = true; break;
      case 'VisitCompleted': this.status = 'completed'; break;
      case 'VisitCancelled': this.status = 'cancelled'; break;
    }
  }
  private raise(e: VisitEvent) { this.apply(e); this.pending.push(e); }
  private expect(s: Status) { if (this.status !== s) throw new DomainError(`Visit is ${this.status}, expected ${s}`); }

  // ---------- for the repository ----------
  get version(): number { return this._version; }
  pullPending(): VisitEvent[] { const out = this.pending; this.pending = []; return out; }
  get currentStatus(): Status | null { return this.status; }
}
