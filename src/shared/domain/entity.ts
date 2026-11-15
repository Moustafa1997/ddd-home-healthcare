/** An Entity has an id. Its identity is the id, not its attributes. */
export abstract class Entity<Id = string> {
  protected constructor(public readonly id: Id) {}
  equals(other?: Entity<Id>): boolean {
    return !!other && other.constructor === this.constructor && other.id === this.id;
  }
}
