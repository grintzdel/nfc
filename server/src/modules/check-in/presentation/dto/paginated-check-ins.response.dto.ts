import { CheckInEntity } from '../../domain/entity/check-in.entity'
import { InteractionType } from '../../domain/constants/interaction-type.constant'
import { ParticipantEntity } from '@modules/participant/domain/entity/participant.entity'

type ParticipantSummary = { id: string; displayName: string }

export class CheckInWithParticipantResponseDto {
  id: string
  braceletId: string
  eventId: string
  interactionType: InteractionType
  zoneName: Nullable<string>
  targetBraceletId: Nullable<string>
  amount: Nullable<number>
  metadata: Record<string, unknown>
  createdAt: Date
  participant: Nullable<ParticipantSummary>

  constructor(c: CheckInEntity, participant: Nullable<ParticipantEntity>) {
    this.id = c.id
    this.braceletId = c.braceletId
    this.eventId = c.eventId
    this.interactionType = c.interactionType
    this.zoneName = c.zoneName
    this.targetBraceletId = c.targetBraceletId
    this.amount = c.amount
    this.metadata = c.metadata
    this.createdAt = c.createdAt
    this.participant = participant ? { id: participant.id, displayName: participant.profile.displayName } : null
  }
}

export class PaginatedCheckInsResponseDto {
  items: CheckInWithParticipantResponseDto[]
  total: number
  page: number
  limit: number
  totalPages: number

  constructor(paged: PaginatedResult<{ checkIn: CheckInEntity; participant: Nullable<ParticipantEntity> }>) {
    this.items = paged.items.map((it) => new CheckInWithParticipantResponseDto(it.checkIn, it.participant))
    this.total = paged.total
    this.page = paged.page
    this.limit = paged.limit
    this.totalPages = paged.totalPages
  }
}
