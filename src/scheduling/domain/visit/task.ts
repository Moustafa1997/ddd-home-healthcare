import { Entity } from '../../../shared/domain/entity';

export type TaskKind = 'medication' | 'meal_support' | 'care_notes' | 'personal_care';

/**
 * Task is an Entity *inside* the Visit aggregate.
 * It is never loaded or saved on its own, and nobody outside Visit may mutate it.
 * That is why `markDone` is internal (called only by Visit).
 */
export class Task extends Entity<string> {
  private _done = false;

  private constructor(id: string, public readonly kind: TaskKind, public readonly description: string) {
    super(id);
  }

  static create(id: string, kind: TaskKind, description: string): Task {
    return new Task(id, kind, description);
  }

  static rehydrate(id: string, kind: TaskKind, description: string, done: boolean): Task {
    const t = new Task(id, kind, description);
    t._done = done;
    return t;
  }

  get done(): boolean { return this._done; }

  /** @internal — only the Visit aggregate root calls this */
  markDone(): void { this._done = true; }
}
