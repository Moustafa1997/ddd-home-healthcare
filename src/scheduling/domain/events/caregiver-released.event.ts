import { DomainEvent } from '../../../shared/domain/domain-event';

/** Published by the Scheduling side when a caregiver slot is freed for a cancelled visit. */
export class CaregiverReleased extends DomainEvent {
  constructor(public readonly aggregateId: string, public readonly caregiverId: string) { super(); }
}
