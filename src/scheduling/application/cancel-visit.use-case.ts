import { Injectable } from '@nestjs/common';
import { VisitRepository } from '../domain/ports/visit.repository';
import { DomainError } from '../../shared/domain/domain.error';

@Injectable()
export class CancelVisitUseCase {
  constructor(private readonly visits: VisitRepository) {}
  async execute(visitId: string, at: Date = new Date()): Promise<void> {
    const visit = await this.visits.findById(visitId);
    if (!visit) throw new DomainError(`Visit ${visitId} not found`);
    visit.cancel(at);
    await this.visits.save(visit);
  }
}
