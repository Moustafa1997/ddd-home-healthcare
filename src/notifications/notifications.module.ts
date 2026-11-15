import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { NotifyFamilyOnVisitCompleted } from './application/on-visit-completed.handler';

/** Notifications Bounded Context (Supporting). */
@Module({
  imports: [CqrsModule],
  providers: [NotifyFamilyOnVisitCompleted],
})
export class NotificationsModule {}
