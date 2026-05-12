import { ParticipantEntity } from '../../domain/entity/participant.entity'
import type { ParticipantProfile } from '../../domain/entity/participant.entity'

export class ParticipantResponseDto {
  id: string
  userId: string
  eventId: string
  braceletId: Nullable<string>
  profile: ParticipantProfile
  registeredAt: Date
  checkedInAt: Nullable<Date>
  createdAt: Date
  updatedAt: Date

  constructor(p: ParticipantEntity) {
    this.id = p.id
    this.userId = p.userId
    this.eventId = p.eventId
    this.braceletId = p.braceletId
    this.profile = p.profile
    this.registeredAt = p.registeredAt
    this.checkedInAt = p.checkedInAt
    this.createdAt = p.createdAt
    this.updatedAt = p.updatedAt
  }
}
