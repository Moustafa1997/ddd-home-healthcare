import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VisitDashboardRow } from './visit-dashboard.orm-entity';

/** Query side: reads the flat table directly. No aggregates are loaded. */
@Injectable()
export class DashboardQuery {
  constructor(@InjectRepository(VisitDashboardRow) private readonly rows: Repository<VisitDashboardRow>) {}

  completedVisits(limit = 500): Promise<VisitDashboardRow[]> {
    return this.rows.find({ where: { status: 'completed' }, order: { updatedAt: 'DESC' }, take: limit });
  }
}
