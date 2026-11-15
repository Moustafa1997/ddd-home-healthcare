import { Injectable, Logger } from '@nestjs/common';
import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { VisitCancelled } from '../../domain/events';
import { RefundInvoice, ReinstateVisit, ReleaseCaregiver, ReassignCaregiver } from './cancel-visit.commands';

/**
 * Lesson 11 — Saga.
 *
 * Cancelling a visit touches three aggregates (Visit, Caregiver schedule, Invoice),
 * each in its own transaction. The saga listens for the event and drives the steps.
 * If a later step fails, it runs COMPENSATING actions to undo the earlier ones.
 *
 * It holds no state of its own — that is what makes it a Saga, not a Process Manager.
 */
@Injectable()
@EventsHandler(VisitCancelled)
export class CancelVisitSaga implements IEventHandler<VisitCancelled> {
  private readonly log = new Logger(CancelVisitSaga.name);
  constructor(private readonly commands: CommandBus) {}

  async handle(e: VisitCancelled): Promise<void> {
    const { aggregateId: visitId, caregiverId } = e;
    const done: Array<() => Promise<unknown>> = [];

    try {
      if (caregiverId) {
        await this.commands.execute(new ReleaseCaregiver(visitId, caregiverId));
        done.push(() => this.commands.execute(new ReassignCaregiver(visitId, caregiverId)));
      }
      await this.commands.execute(new RefundInvoice(visitId));
    } catch (err) {
      this.log.warn(`Cancel saga for ${visitId} failed at a step: ${(err as Error).message}. Compensating…`);
      for (const undo of done.reverse()) await undo();
      await this.commands.execute(new ReinstateVisit(visitId));
      throw err;
    }
  }
}
