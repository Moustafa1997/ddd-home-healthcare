import { Visit } from '../visit';
import { Caregiver } from '../caregiver';
import { DomainError } from '../../../shared/domain/domain.error';

export const MAX_WEEKLY_HOURS = 48; // Working Time Regulations — a real business rule

/**
 * Lesson 07 — Domain Service.
 *
 * This logic needs to look at a Visit AND many Caregivers at once.
 * It belongs to neither aggregate, so it lives here.
 *
 *  - no state (nothing is stored on `this`)
 *  - named from the Ubiquitous Language
 *  - pure business logic: no DB, no HTTP, no email
 */
export class CaregiverMatchingService {
  findBestMatch(visit: Visit, candidates: Caregiver[], expectedMinutes: number, clientPostcodeArea: string): Caregiver {
    const required = visit.tasks.map((t) => t.kind);

    const eligible = candidates
      .filter((c) => required.every((k) => c.isTrainedFor(k)))                     // rule 1: training
      .filter((c) => c.isAvailableAt(visit.scheduledStart, expectedMinutes))        // rule 2: availability
      .filter((c) => c.hoursWorkedThisWeek + expectedMinutes / 60 <= MAX_WEEKLY_HOURS); // rule 4: legal hours

    if (eligible.length === 0) throw new DomainError('No eligible caregiver for this visit');

    // rule 3: prefer the closest (same postcode area), then the least loaded
    return eligible.sort((a, b) => {
      const da = a.homePostcodeArea === clientPostcodeArea.toUpperCase() ? 0 : 1;
      const db = b.homePostcodeArea === clientPostcodeArea.toUpperCase() ? 0 : 1;
      return da - db || a.hoursWorkedThisWeek - b.hoursWorkedThisWeek;
    })[0];
  }
}
