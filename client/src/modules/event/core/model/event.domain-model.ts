export const EventStatus = {
  DRAFT: 'draft',
  UPCOMING: 'upcoming',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus]

export namespace EventDomainModel {
  export type EventOverviewDto = {
    id: string
    name: string
    slug: string
    description: string
    venueName: string
    venueAddress: string
    city: string
    startsAt: string
    endsAt: string
    capacity: number
    staffCount: number
    status: EventStatus
    ownerId: string
    createdAt: string
    updatedAt: string
    /**
     * Only populated by GET /events/public/:slug. Lets the public page detect
     * capacity-full state without an extra round-trip.
     */
    participantCount?: number
  }

  export type CreateEventDto = {
    name: string
    slug: string
    description: string
    venueName: string
    venueAddress: string
    city: string
    startsAt: string
    endsAt: string
    capacity: number
    staffCount: number
  }

  export type UpdateEventDto = Partial<CreateEventDto>

  export type PaginatedEventRowDto = {
    id: string
    name: string
    venueName: string
    city: string
    startsAt: string
    endsAt: string
    capacity: number
    staffCount: number
    status: EventStatus
    braceletsCount: number
    checkInsCount: number
    checkInsRate: number
  }

  export type PaginatedEventsDto = {
    items: PaginatedEventRowDto[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
