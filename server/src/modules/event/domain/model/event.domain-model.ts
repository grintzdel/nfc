import type { EventEntityProps } from '../entity/event.entity'

export namespace EventDomainModel {
  export type EventOverviewDto = EventEntityProps
  export type CreateEventDto = Omit<
    EventEntityProps,
    'id' | 'slug' | 'status' | 'createdAt' | 'updatedAt' | 'deletedAt'
  > & { slug?: string }
  export type UpdateEventDto = Partial<Omit<CreateEventDto, 'ownerId'>>
}
