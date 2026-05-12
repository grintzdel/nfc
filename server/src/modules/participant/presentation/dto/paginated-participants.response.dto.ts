import { ParticipantEntity, ParticipantProfile } from '../../domain/entity/participant.entity'
import { BraceletEntity } from '@modules/bracelet/domain/entity/bracelet.entity'
import { BraceletStatus } from '@modules/bracelet/domain/constants/bracelet-status.constant'

type BraceletSummary = { id: string; nfcId: string; status: BraceletStatus }

export class ParticipantWithBraceletResponseDto {
  id: string
  userId: string
  eventId: string
  braceletId: Nullable<string>
  profile: ParticipantProfile
  registeredAt: Date
  checkedInAt: Nullable<Date>
  createdAt: Date
  updatedAt: Date
  bracelet: Nullable<BraceletSummary>

  constructor(p: ParticipantEntity, bracelet: Nullable<BraceletEntity>) {
    this.id = p.id
    this.userId = p.userId
    this.eventId = p.eventId
    this.braceletId = p.braceletId
    this.profile = p.profile
    this.registeredAt = p.registeredAt
    this.checkedInAt = p.checkedInAt
    this.createdAt = p.createdAt
    this.updatedAt = p.updatedAt
    this.bracelet = bracelet ? { id: bracelet.id, nfcId: bracelet.nfcId, status: bracelet.status } : null
  }
}

export class PaginatedParticipantsResponseDto {
  items: ParticipantWithBraceletResponseDto[]
  total: number
  page: number
  limit: number
  totalPages: number

  constructor(paged: PaginatedResult<{ participant: ParticipantEntity; bracelet: Nullable<BraceletEntity> }>) {
    this.items = paged.items.map((it) => new ParticipantWithBraceletResponseDto(it.participant, it.bracelet))
    this.total = paged.total
    this.page = paged.page
    this.limit = paged.limit
    this.totalPages = paged.totalPages
  }
}
