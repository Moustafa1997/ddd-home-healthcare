import { Test } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { CancelVisitSaga } from './cancel-visit.saga';
import { ReleaseCaregiverHandler, ReassignCaregiverHandler, ReinstateVisitHandler } from './cancel-visit.handlers';
import { RefundInvoiceHandler } from '../../../billing/application/refund-invoice.handler';
import { CancelVisitUseCase } from '../cancel-visit.use-case';
import { VisitRepository } from '../../domain/ports';
import { InMemoryVisitRepository } from '../../infrastructure/persistence/in-memory-visit.repository';
import { Visit } from '../../domain/visit';

const tick = () => new Promise((r) => setTimeout(r, 20));

describe('CancelVisitSaga', () => {
  let cancel: CancelVisitUseCase; let repo: VisitRepository;
  let release: ReleaseCaregiverHandler; let reassign: ReassignCaregiverHandler; let refund: RefundInvoiceHandler;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        { provide: VisitRepository, useClass: InMemoryVisitRepository },
        CancelVisitUseCase, CancelVisitSaga,
        ReleaseCaregiverHandler, ReassignCaregiverHandler, ReinstateVisitHandler, RefundInvoiceHandler,
      ],
    }).compile();
    await mod.createNestApplication().init();
    cancel = mod.get(CancelVisitUseCase); repo = mod.get(VisitRepository);
    release = mod.get(ReleaseCaregiverHandler); reassign = mod.get(ReassignCaregiverHandler); refund = mod.get(RefundInvoiceHandler);

    const v = Visit.schedule('v1', 'client-1', new Date(), [{ id: 't1', kind: 'care_notes', description: '' }]);
    v.assignCaregiver('c1');
    await repo.save(v);
  });

  it('happy path: releases the caregiver, then refunds', async () => {
    await cancel.execute('v1'); await tick();
    expect(release.released).toEqual(['c1']);
    expect(refund.refunded).toEqual(['v1']);
    expect((await repo.findById('v1'))!.status).toBe('cancelled');
  });

  it('refund fails → compensates: reassigns the caregiver and reinstates the visit', async () => {
    refund.failNext = true;
    await cancel.execute('v1'); await tick();
    expect(release.released).toEqual(['c1']);      // step 1 happened
    expect(refund.refunded).toEqual([]);           // step 2 failed
    expect(reassign.reassigned).toEqual(['c1']);   // compensation 1
    expect((await repo.findById('v1'))!.status).toBe('scheduled'); // compensation 2
  });
});
