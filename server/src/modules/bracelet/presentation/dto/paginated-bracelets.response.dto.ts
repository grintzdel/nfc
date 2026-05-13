import { ParticipantEntity } from '@modules/participant/domain/entity/participant.entity'

import { BraceletStatus } from '../../domain/constants/bracelet-status.constant'
import { BraceletEntity } from '../../domain/entity/bracelet.entity'

type ParticipantSummary = { id: string; displayName: string }

export class BraceletWithParticipantResponseDto {
  id: string
  nfcId: string
  status: BraceletStatus
  userId: Nullable<string>
  eventId: Nullable<string>
  productId: Nullable<string>
  orderId: Nullable<string>
  activatedAt: Nullable<Date>
  createdAt: Date
  updatedAt: Date
  participant: Nullable<ParticipantSummary>

  constructor(b: BraceletEntity, participant: Nullable<ParticipantEntity>) {
    this.id = b.id
    this.nfcId = b.nfcId
    this.status = b.status
    this.userId = b.userId
    this.eventId = b.eventId
    this.productId = b.productId
    this.orderId = b.orderId
    this.activatedAt = b.activatedAt
    this.createdAt = b.createdAt
    this.updatedAt = b.updatedAt
    this.participant = participant ? { id: participant.id, displayName: participant.profile.displayName } : null
  }
}

export class PaginatedBraceletsResponseDto {
  items: BraceletWithParticipantResponseDto[]
  total: number
  page: number
  limit: number
  totalPages: number

  constructor(paged: PaginatedResult<{ bracelet: BraceletEntity; participant: Nullable<ParticipantEntity> }>) {
    this.items = paged.items.map((it) => new BraceletWithParticipantResponseDto(it.bracelet, it.participant))
    this.total = paged.total
    this.page = paged.page
    this.limit = paged.limit
    this.totalPages = paged.totalPages
  }
}
