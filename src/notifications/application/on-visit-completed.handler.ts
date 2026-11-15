import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { VisitCompleted } from '../../scheduling/domain/events';

@EventsHandler(VisitCompleted)
export class NotifyFamilyOnVisitCompleted implements IEventHandler<VisitCompleted> {
  private readonly log = new Logger('Notifications');
  readonly sent: string[] = [];

  handle(e: VisitCompleted) {
    this.sent.push(e.clientId);
    this.log.log(`Family of client ${e.clientId} notified: visit completed`);
  }
}
