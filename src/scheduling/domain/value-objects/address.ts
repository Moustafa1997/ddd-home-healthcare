import { ValueObject } from '../../../shared/domain/value-object';
import { DomainError } from '../../../shared/domain/domain.error';

interface Props { line1: string; city: string; postcode: string }

export class Address extends ValueObject<Props> {
  private constructor(props: Props) { super(props); }

  static create(line1: string, city: string, postcode: string): Address {
    if (!line1?.trim()) throw new DomainError('Address line is required');
    if (!city?.trim()) throw new DomainError('City is required');
    if (!postcode?.trim()) throw new DomainError('Postcode is required');
    return new Address({ line1: line1.trim(), city: city.trim(), postcode: postcode.trim().toUpperCase() });
  }

  get line1(): string { return this.props.line1; }
  get city(): string { return this.props.city; }
  get postcode(): string { return this.props.postcode; }
  toString(): string { return `${this.line1}, ${this.city} ${this.postcode}`; }
}
