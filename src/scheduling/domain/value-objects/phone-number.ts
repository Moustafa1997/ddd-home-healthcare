import { ValueObject } from '../../../shared/domain/value-object';
import { DomainError } from '../../../shared/domain/domain.error';

interface Props { value: string }

/** E.164-ish: +, then 8–15 digits. Normalises spaces and dashes away. */
export class PhoneNumber extends ValueObject<Props> {
  private static readonly PATTERN = /^\+[1-9]\d{7,14}$/;
  private constructor(props: Props) { super(props); }

  static create(raw: string): PhoneNumber {
    const value = (raw ?? '').replace(/[\s\-()]/g, '');
    if (!PhoneNumber.PATTERN.test(value)) throw new DomainError(`Invalid phone number: ${raw}`);
    return new PhoneNumber({ value });
  }

  get value(): string { return this.props.value; }
  toString(): string { return this.props.value; }
}
