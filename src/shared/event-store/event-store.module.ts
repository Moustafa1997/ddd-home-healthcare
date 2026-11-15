import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoredEvent } from './stored-event.orm-entity';
import { EventStore } from './event-store';

@Module({ imports: [TypeOrmModule.forFeature([StoredEvent])], providers: [EventStore], exports: [EventStore] })
export class EventStoreModule {}
