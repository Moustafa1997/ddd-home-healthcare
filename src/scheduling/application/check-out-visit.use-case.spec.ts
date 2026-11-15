import { Test } from '@nestjs/testing';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { CheckOutVisitUseCase } from './check-out-visit.use-case';
import { VisitRepository } from './visit.repository';
import { InMemoryVisitRepository } from './in-memory-visit.repository';
import { Visit } from '../domain/visit';
import { VisitCompleted } from '../domain/events';
import { CreateInvoiceOnVisitCompleted } from '../../billing/application/on-visit-completed.handler';
import { NotifyFamilyOnVisitCompleted } from '../../notifications/application/on-visit-completed.handler';

describe('CheckOutVisitUseCase + Domain Events', () => {
  let useCase: CheckOutVisitUseCase;
  let repo: VisitRepository;
  let billing: CreateInvoiceOnVisitCompleted;
  let notifications: NotifyFamilyOnVisitCompleted;
  let bus: EventBus;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        { provide: VisitRepository, useClass: InMemoryVisitRepository },
        CheckOutVisitUseCase, CreateInvoiceOnVisitCompleted, NotifyFamilyOnVisitCompleted,
      ],
    }).compile();
    const app = mod.createNestApplication(); await app.init();
    useCase = mod.get(CheckOutVisitUseCase); repo = mod.get(VisitRepository);
    billing = mod.get(CreateInvoiceOnVisitCompleted); notifications = mod.get(NotifyFamilyOnVisitCompleted);
    bus = mod.get(EventBus);

    const v = Visit.schedule('v1', 'client-1', new Date('2026-01-10T09:00:00Z'), [{ id: 't1', kind: 'medication', description: '' }]);
    v.assignCaregiver('c1'); v.checkIn(new Date('2026-01-10T09:05:00Z')); v.completeTask('t1');
    await repo.save(v);
  });

  it('publishes VisitCompleted after save; Billing and Notifications react without Scheduling knowing them', async () => {
    const published: VisitCompleted[] = [];
    bus.subscribe((e) => { if (e instanceof VisitCompleted) published.push(e); });

    await useCase.execute('v1', new Date('2026-01-10T10:05:00Z'));
    await new Promise((r) => setImmediate(r));

    expect(published).toHaveLength(1);
    expect(published[0].durationMinutes).toBe(60);
    expect(billing.invoices).toEqual([{ visitId: 'v1', minutes: 60 }]);
    expect(notifications.sent).toEqual(['client-1']);
  });

  it('publishes nothing when the rule blocks the check-out', async () => {
    const v = Visit.schedule('v2', 'client-2', new Date(), [{ id: 't1', kind: 'medication', description: '' }]);
    v.assignCaregiver('c1'); v.checkIn(new Date('2026-01-10T09:05:00Z')); // medication NOT done
    await repo.save(v);

    await expect(useCase.execute('v2', new Date('2026-01-10T10:05:00Z'))).rejects.toThrow(/medication/);
    expect(billing.invoices).toHaveLength(0);
  });
});
