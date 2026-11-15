import { ValueObject } from '../../../shared/domain/value-object';
import { DomainError } from '../../../shared/domain/domain.error';

interface Props { start: Date; end: Date }

/**
 * Lesson 04 — the rule "end must be after start" now lives in exactly one place,
 * and nobody can forget it: a VisitTime that breaks it cannot be created.
 */
export class VisitTime extends ValueObject<Props> {
  private constructor(props: Props) { super(props); }

  static create(start: Date, end: Date): VisitTime {
    if (!(start instanceof Date) || isNaN(start.getTime())) throw new DomainError('Invalid start time');
    if (!(end instanceof Date) || isNaN(end.getTime())) throw new DomainError('Invalid end time');
    if (end <= start) throw new DomainError('Visit end must be after start');
    return new VisitTime({ start, end });
  }

  get start(): Date { return this.props.start; }
  get end(): Date { return this.props.end; }

  /** Duration in whole minutes. Computed here, the same way, every time. */
  get durationMinutes(): number {
    return Math.round((this.props.end.getTime() - this.props.start.getTime()) / 60000);
  }

  /** Immutable: returns a NEW VisitTime. */
  withEnd(end: Date): VisitTime { return VisitTime.create(this.props.start, end); }
}
