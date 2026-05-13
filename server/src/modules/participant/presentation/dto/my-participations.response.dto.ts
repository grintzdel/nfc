import { EventStatus } from '@modules/event/domain/constants/event-status.constant'
import { EventEntity } from '@modules/event/domain/entity/event.entity'

import { ParticipantEntity, ParticipantProfile } from '../../domain/entity/participant.entity'

type EventSummary = {
  id: string
  name: string
  slug: string
  startsAt: Date
  endsAt: Date
  venueName: string
  city: string
  status: EventStatus
}

export class MyParticipationResponseDto {
  id: string
  userId: string
  eventId: string
  braceletId: Nullable<string>
  profile: ParticipantProfile
  registeredAt: Date
  checkedInAt: Nullable<Date>
  createdAt: Date
  updatedAt: Date
  event: Nullable<EventSummary>

  constructor(p: ParticipantEntity, event: Nullable<EventEntity>) {
    this.id = p.id
    this.userId = p.userId
    this.eventId = p.eventId
    this.braceletId = p.braceletId
    this.profile = p.profile
    this.registeredAt = p.registeredAt
    this.checkedInAt = p.checkedInAt
    this.createdAt = p.createdAt
    this.updatedAt = p.updatedAt
    this.event = event
      ? {
          id: event.id,
          name: event.name,
          slug: event.slug,
          startsAt: event.startsAt,
          endsAt: event.endsAt,
          venueName: event.venueName,
          city: event.city,
          status: event.status,
        }
      : null
  }
}
