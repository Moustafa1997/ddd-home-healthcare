import { Visit } from './visit';
import { DomainError } from '../../../shared/domain/domain.error';

const t9 = new Date('2026-01-10T09:00:00Z');
const t905 = new Date('2026-01-10T09:05:00Z');
const t10 = new Date('2026-01-10T10:05:00Z');

function scheduledVisit() {
  return Visit.schedule('v1', 'client-1', t9, [
    { id: 't1', kind: 'medication', description: 'Morning insulin' },
    { id: 't2', kind: 'meal_support', description: 'Breakfast' },
  ]);
}
function inProgressVisit() {
  const v = scheduledVisit();
  v.assignCaregiver('c1');
  v.checkIn(t905);
  return v;
}

describe('Visit aggregate', () => {
  it('cannot check out while the medication task is not done', () => {
    const v = inProgressVisit();
    v.completeTask('t2'); // meal only
    expect(() => v.checkOut(t10)).toThrow(/medication task is not done/);
    expect(v.status).toBe('in_progress');
  });

  it('completes when the medication task is done, and computes duration via VisitTime', () => {
    const v = inProgressVisit();
    v.completeTask('t1');
    v.checkOut(t10);
    expect(v.status).toBe('completed');
    expect(v.durationMinutes).toBe(60);
  });

  it('exposes tasks read-only: outside code cannot bypass the root', () => {
    const v = inProgressVisit();
    const snapshot = v.tasks;
    (snapshot[0] as any).done = true; // mutating the copy...
    expect(() => v.checkOut(t10)).toThrow(DomainError); // ...changes nothing inside the aggregate
  });

  it('enforces the state machine', () => {
    const v = scheduledVisit();
    expect(() => v.checkIn(t905)).toThrow(/without an assigned caregiver/);
    expect(() => v.checkOut(t10)).toThrow(/expected in_progress/);
    v.assignCaregiver('c1');
    v.checkIn(t905);
    expect(() => v.assignCaregiver('c2')).toThrow(/expected scheduled/);
  });

  it('references the caregiver by id only', () => {
    const v = scheduledVisit();
    v.assignCaregiver('c1');
    expect(typeof v.caregiverId).toBe('string');
  });

  it('identity is the id, not the data', () => {
    const a = Visit.schedule('same', 'x', t9, [{ id: 't', kind: 'care_notes', description: '' }]);
    const b = Visit.schedule('same', 'y', t10, [{ id: 'u', kind: 'care_notes', description: '' }]);
    expect(a.equals(b)).toBe(true);
  });
});
