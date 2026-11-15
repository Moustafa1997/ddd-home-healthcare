import { Controller, Get } from '@nestjs/common';
import { DashboardQuery } from '../../read-model/dashboard.query';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly query: DashboardQuery) {}
  @Get('visits') visits() { return this.query.completedVisits(); }
}
