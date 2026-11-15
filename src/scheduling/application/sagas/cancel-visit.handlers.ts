import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ReleaseCaregiver, ReassignCaregiver, ReinstateVisit } from './cancel-visit.commands';
import { CaregiverReleased } from '../../domain/events';
import { VisitRepository } from '../../domain/ports';
import { DomainError } from '../../../shared/domain/domain.error';

/** Scheduling-side handlers. In a real system the caregiver schedule is its own aggregate; kept simple here. */
@CommandHandler(ReleaseCaregiver)
export class ReleaseCaregiverHandler implements ICommandHandler<ReleaseCaregiver> {
  readonly released: string[] = [];
  constructor(private readonly events: EventBus) {}
  async execute(c: ReleaseCaregiver) {
    this.released.push(c.caregiverId);
    this.events.publish(new CaregiverReleased(c.visitId, c.caregiverId));
  }
}

@CommandHandler(ReassignCaregiver)
export class ReassignCaregiverHandler implements ICommandHandler<ReassignCaregiver> {
  readonly reassigned: string[] = [];
  async execute(c: ReassignCaregiver) { this.reassigned.push(c.caregiverId); }
}

@CommandHandler(ReinstateVisit)
export class ReinstateVisitHandler implements ICommandHandler<ReinstateVisit> {
  private readonly log = new Logger('Scheduling');
  constructor(private readonly visits: VisitRepository) {}
  async execute(c: ReinstateVisit) {
    const visit = await this.visits.findById(c.visitId);
    if (!visit) throw new DomainError(`Visit ${c.visitId} not found`);
    visit.reinstate();
    await this.visits.save(visit);
    this.log.warn(`Visit ${c.visitId} reinstated after failed cancellation`);
  }
}
