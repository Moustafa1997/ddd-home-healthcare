import { VisitTime, PhoneNumber, Address } from '.';
import { DomainError } from '../../../shared/domain/domain.error';

describe('Value Objects', () => {
  describe('VisitTime', () => {
    const t9 = new Date('2026-01-10T09:00:00Z');
    const t10 = new Date('2026-01-10T10:00:00Z');

    it('cannot be created with end before start', () => {
      expect(() => VisitTime.create(t10, t9)).toThrow(DomainError);
      expect(() => VisitTime.create(t9, t9)).toThrow(/after start/);
    });

    it('computes duration in one place', () => {
      expect(VisitTime.create(t9, t10).durationMinutes).toBe(60);
    });

    it('has no id: equal values are equal', () => {
      expect(VisitTime.create(t9, t10).equals(VisitTime.create(t9, t10))).toBe(true);
    });

    it('is immutable: withEnd returns a new object', () => {
      const a = VisitTime.create(t9, t10);
      const b = a.withEnd(new Date('2026-01-10T11:00:00Z'));
      expect(a.durationMinutes).toBe(60);
      expect(b.durationMinutes).toBe(120);
      expect(() => { (a as any).props.end = t9; }).toThrow(); // frozen
    });
  });

  describe('PhoneNumber', () => {
    it('normalises and validates', () => {
      expect(PhoneNumber.create('+20 100 123-4567').value).toBe('+201001234567');
    });
    it('rejects garbage', () => {
      expect(() => PhoneNumber.create('hello')).toThrow(DomainError);
      expect(() => PhoneNumber.create('0100')).toThrow(DomainError);
    });
  });

  describe('Address', () => {
    it('requires all parts and normalises postcode', () => {
      const a = Address.create(' 12 Baker St ', 'London', 'nw1 6xe');
      expect(a.postcode).toBe('NW1 6XE');
      expect(() => Address.create('', 'London', 'NW1')).toThrow(DomainError);
    });
  });
});
