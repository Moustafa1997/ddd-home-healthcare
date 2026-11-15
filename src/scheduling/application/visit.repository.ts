import { Visit } from '../domain/visit';

/** Port. Lesson 08 adds the Postgres adapter; for now an in-memory one is enough. */
export abstract class VisitRepository {
  abstract findById(id: string): Promise<Visit | null>;
  abstract save(visit: Visit): Promise<void>;
}
