import { Module } from '@nestjs/common';

/**
 * Scheduling Bounded Context.
 * Nothing outside this folder may import from inside it except through its public API (index.ts).
 */
@Module({})
export class SchedulingModule {}
