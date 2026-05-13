import { EventStatus } from '../domain/constants/event-status.constant'
import { EventEntity, EventEntityProps } from '../domain/entity/event.entity'

let counter = 0

export function createEventPropsFixture(overrides: Partial<EventEntityProps> = {}): EventEntityProps {
  counter++
  const now = new Date()
  return {
    id: `event-${counter}`,
    name: `Event ${counter}`,
    slug: `event-${counter}`,
    description: `Description ${counter}`,
    venueName: `Venue ${counter}`,
    venueAddress: `Address ${counter}`,
    city: `City ${counter}`,
    startsAt: new Date(now.getTime() + 7 * 24 * 3600 * 1000),
    endsAt: new Date(now.getTime() + 7 * 24 * 3600 * 1000 + 5 * 3600 * 1000),
    capacity: 1000,
    staffCount: 10,
    status: EventStatus.DRAFT,
    ownerId: `user-${counter}`,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  }
}

export function createEventFixture(overrides: Partial<EventEntityProps> = {}): EventEntity {
  return EventEntity.fromProps(createEventPropsFixture(overrides))
}
