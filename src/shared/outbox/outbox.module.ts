import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxMessage } from './outbox-message.orm-entity';
import { OutboxRelay } from './outbox.relay';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([OutboxMessage])],
  providers: [OutboxRelay],
  exports: [OutboxRelay],
})
export class OutboxModule {}
