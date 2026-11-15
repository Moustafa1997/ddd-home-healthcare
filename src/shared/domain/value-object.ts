/**
 * Base class for Value Objects.
 *
 * A Value Object:
 *  1. has no id — its identity IS its values
 *  2. is immutable — change it by creating a new one
 *  3. protects itself — it cannot exist in an invalid state
 */
export abstract class ValueObject<T extends object> {
  protected readonly props: Readonly<T>;

  protected constructor(props: T) {
    this.props = Object.freeze({ ...props });
  }

  equals(other?: ValueObject<T>): boolean {
    if (!other) return false;
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
