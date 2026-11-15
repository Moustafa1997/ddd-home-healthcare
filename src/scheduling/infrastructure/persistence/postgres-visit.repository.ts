import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visit } from '../../domain/visit';
import { VisitRepository } from '../../domain/ports/visit.repository';
import { VisitOrmEntity } from './visit.orm-entity';
import { VisitMapper } from './visit.mapper';

/**
 * Lesson 08 — the Postgres ADAPTER for the VisitRepository PORT.
 * Swap it for InMemoryVisitRepository in tests; the use case does not change.
 */
@Injectable()
export class PostgresVisitRepository extends VisitRepository {
  constructor(@InjectRepository(VisitOrmEntity) private readonly rows: Repository<VisitOrmEntity>) { super(); }

  async findById(id: string): Promise<Visit | null> {
    const row = await this.rows.findOneBy({ id });
    return row ? VisitMapper.toDomain(row) : null;
  }

  async save(visit: Visit): Promise<void> {
    await this.rows.save(VisitMapper.toRow(visit));
  }
}
