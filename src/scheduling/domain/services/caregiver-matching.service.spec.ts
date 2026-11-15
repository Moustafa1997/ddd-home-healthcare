import { CaregiverMatchingService } from './caregiver-matching.service';
import { Visit } from '../visit';
import { Caregiver } from '../caregiver';
import { DomainError } from '../../../shared/domain/domain.error';

// Saturday 2026-01-10 09:00 UTC  → getUTCDay() === 6
const sat9 = new Date('2026-01-10T09:00:00Z');
const allDaySat = [{ dayOfWeek: 6, fromHour: 8, toHour: 18 }];

const medVisit = Visit.schedule('v1', 'client-1', sat9, [
  { id: 't1', kind: 'medication', description: '' },
  { id: 't2', kind: 'meal_support', description: '' },
]);

const svc = new CaregiverMatchingService();

describe('CaregiverMatchingService', () => {
  it('excludes caregivers without the required training', () => {
    const untrained = Caregiver.create({ id: 'a', name: 'A', trainedFor: ['meal_support'], availability: allDaySat, homePostcodeArea: 'NW1' });
    const trained = Caregiver.create({ id: 'b', name: 'B', trainedFor: ['medication', 'meal_support'], availability: allDaySat, homePostcodeArea: 'SE1' });
    expect(svc.findBestMatch(medVisit, [untrained, trained], 60, 'NW1').id).toBe('b');
  });

  it('excludes caregivers not available at that time', () => {
    const busy = Caregiver.create({ id: 'a', name: 'A', trainedFor: ['medication', 'meal_support'], availability: [{ dayOfWeek: 6, fromHour: 12, toHour: 18 }], homePostcodeArea: 'NW1' });
    expect(() => svc.findBestMatch(medVisit, [busy], 60, 'NW1')).toThrow(DomainError);
  });

  it('excludes caregivers who would exceed the legal weekly hours', () => {
    const tired = Caregiver.create({ id: 'a', name: 'A', trainedFor: ['medication', 'meal_support'], availability: allDaySat, homePostcodeArea: 'NW1', hoursWorkedThisWeek: 47.5 });
    expect(() => svc.findBestMatch(medVisit, [tired], 60, 'NW1')).toThrow(/No eligible/);
  });

  it('prefers the closest, then the least loaded', () => {
    const far = Caregiver.create({ id: 'far', name: '', trainedFor: ['medication', 'meal_support'], availability: allDaySat, homePostcodeArea: 'SE1', hoursWorkedThisWeek: 5 });
    const nearBusy = Caregiver.create({ id: 'nearBusy', name: '', trainedFor: ['medication', 'meal_support'], availability: allDaySat, homePostcodeArea: 'NW1', hoursWorkedThisWeek: 30 });
    const nearFree = Caregiver.create({ id: 'nearFree', name: '', trainedFor: ['medication', 'meal_support'], availability: allDaySat, homePostcodeArea: 'NW1', hoursWorkedThisWeek: 10 });
    expect(svc.findBestMatch(medVisit, [far, nearBusy, nearFree], 60, 'nw1').id).toBe('nearFree');
  });

  it('has no state: two calls with the same input give the same output', () => {
    const c = Caregiver.create({ id: 'x', name: '', trainedFor: ['medication', 'meal_support'], availability: allDaySat, homePostcodeArea: 'NW1' });
    expect(svc.findBestMatch(medVisit, [c], 60, 'NW1')).toBe(svc.findBestMatch(medVisit, [c], 60, 'NW1'));
  });
});
