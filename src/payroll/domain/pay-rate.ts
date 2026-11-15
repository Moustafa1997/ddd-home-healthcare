import { ValueObject } from '../../shared/domain/value-object';
import { DomainError } from '../../shared/domain/domain.error';

export type RateBand = 'standard' | 'night' | 'weekend';
interface Props { band: RateBand; perHourPence: number }

export class PayRate extends ValueObject<Props> {
  private constructor(p: Props) { super(p); }
  static create(band: RateBand, perHourPence: number): PayRate {
    if (perHourPence <= 0) throw new DomainError('Pay rate must be positive');
    return new PayRate({ band, perHourPence });
  }
  get band(): RateBand { return this.props.band; }
  get perHourPence(): number { return this.props.perHourPence; }
}
