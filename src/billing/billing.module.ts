import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateInvoiceOnVisitCompleted } from './application/on-visit-completed.handler';

/** Billing Bounded Context (Supporting). Reacts to events; never reads Scheduling tables. */
@Module({
  imports: [CqrsModule],
  providers: [CreateInvoiceOnVisitCompleted],
})
export class BillingModule {}
