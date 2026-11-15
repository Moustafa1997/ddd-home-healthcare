import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Visit } from '../../domain/visit';
import { VisitRepository } from '../../domain/ports/visit.repository';
import { VisitOrmEntity } from './visit.orm-entity';
import { VisitMapper } from './visit.mapper';
import { enqueueToOutbox } from '../../../shared/outbox/outbox';

/**
 * Lesson 10 — save() now writes the aggregate AND its events to the outbox
 * in ONE transaction. Either both land, or neither does.
 */
@Injectable()
export class PostgresVisitRepository extends VisitRepository {
  constructor(
    @InjectRepository(VisitOrmEntity) private readonly rows: Repository<VisitOrmEntity>,
    private readonly dataSource: DataSource,
  ) { super(); }

  async findById(id: string): Promise<Visit | null> {
    const row = await this.rows.findOneBy({ id });
    return row ? VisitMapper.toDomain(row) : null;
  }

  async save(visit: Visit): Promise<void> {
    await this.dataSource.transaction(async (tx) => {
      await tx.getRepository(VisitOrmEntity).save(VisitMapper.toRow(visit));
      await enqueueToOutbox(tx, visit.pullEvents());
    });
  }
}
