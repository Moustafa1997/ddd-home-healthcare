import { AggregateRoot } from '../../../shared/domain/aggregate-root';
import { TaskKind } from '../visit';

export interface Availability { dayOfWeek: number; fromHour: number; toHour: number }

/**
 * Caregiver is its own aggregate. Visit references it by id only.
 * Kept minimal here — enough for the matching service to reason about.
 */
export class Caregiver extends AggregateRoot<string> {
  private constructor(
    id: string,
    public readonly name: string,
    public readonly trainedFor: ReadonlySet<TaskKind>,
    public readonly availability: ReadonlyArray<Availability>,
    public readonly homePostcodeArea: string,   // e.g. "NW1" — distance proxy for this course
    public readonly hoursWorkedThisWeek: number,
  ) { super(id); }

  static create(p: { id: string; name: string; trainedFor: TaskKind[]; availability: Availability[]; homePostcodeArea: string; hoursWorkedThisWeek?: number }): Caregiver {
    return new Caregiver(p.id, p.name, new Set(p.trainedFor), p.availability, p.homePostcodeArea.toUpperCase(), p.hoursWorkedThisWeek ?? 0);
  }

  isTrainedFor(kind: TaskKind): boolean { return this.trainedFor.has(kind); }

  isAvailableAt(when: Date, durationMinutes: number): boolean {
    const day = when.getUTCDay();
    const from = when.getUTCHours() + when.getUTCMinutes() / 60;
    const to = from + durationMinutes / 60;
    return this.availability.some((a) => a.dayOfWeek === day && a.fromHour <= from && to <= a.toHour);
  }
}
