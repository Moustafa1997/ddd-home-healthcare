import { ValueObject } from '../../shared/domain/value-object';
import { DomainError } from '../../shared/domain/domain.error';

interface Props { hours: number }
export class WorkedHours extends ValueObject<Props> {
  private constructor(p: Props) { super(p); }
  static create(hours: number): WorkedHours {
    if (!Number.isFinite(hours) || hours < 0) throw new DomainError('Worked hours must be a non-negative number');
    return new WorkedHours({ hours: Math.round(hours * 100) / 100 });
  }
  get hours(): number { return this.props.hours; }
}
