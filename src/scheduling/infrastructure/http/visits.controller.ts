import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { IsISO8601, IsOptional } from 'class-validator';
import { CheckOutVisitUseCase } from '../../application/check-out-visit.use-case';
import { CancelVisitUseCase } from '../../application/cancel-visit.use-case';

class CheckOutDto { @IsOptional() @IsISO8601() at?: string }

/** Inbound adapter. REST today; a GraphQL or queue adapter would call the same use case. */
@Controller('visits')
export class VisitsController {
  constructor(private readonly checkOut: CheckOutVisitUseCase, private readonly cancel: CancelVisitUseCase) {}

  @Post(':id/check-out')
  @HttpCode(204)
  async checkOutVisit(@Param('id') id: string, @Body() dto: CheckOutDto): Promise<void> {
    await this.checkOut.execute(id, dto.at ? new Date(dto.at) : new Date());
  }

  @Post(':id/cancel')
  @HttpCode(204)
  async cancelVisit(@Param('id') id: string): Promise<void> {
    await this.cancel.execute(id);
  }
}
