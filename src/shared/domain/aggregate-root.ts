import { Entity } from './entity';

/** Marker base for Aggregate Roots. Domain events arrive in lesson 06. */
export abstract class AggregateRoot<Id = string> extends Entity<Id> {}
