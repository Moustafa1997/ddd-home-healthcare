import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefundInvoice } from '../../scheduling/application/sagas/cancel-visit.commands';

/** Billing-side handler. Throws when the payment provider rejects — the saga must compensate. */
@CommandHandler(RefundInvoice)
export class RefundInvoiceHandler implements ICommandHandler<RefundInvoice> {
  readonly refunded: string[] = [];
  failNext = false; // test hook to simulate a provider failure
  async execute(c: RefundInvoice) {
    if (this.failNext) { this.failNext = false; throw new Error('Payment provider rejected the refund'); }
    this.refunded.push(c.visitId);
  }
}
