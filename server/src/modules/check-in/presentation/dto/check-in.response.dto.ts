import { CheckInEntity } from '../../domain/entity/check-in.entity'
import type { InteractionType } from '../../domain/constants/interaction-type.constant'

export class CheckInResponseDto {
  id: string
  braceletId: string
  eventId: string
  interactionType: InteractionType
  zoneName: Nullable<string>
  targetBraceletId: Nullable<string>
  amount: Nullable<number>
  metadata: Record<string, unknown>
  createdAt: Date

  constructor(c: CheckInEntity) {
    this.id = c.id
    this.braceletId = c.braceletId
    this.eventId = c.eventId
    this.interactionType = c.interactionType
    this.zoneName = c.zoneName
    this.targetBraceletId = c.targetBraceletId
    this.amount = c.amount
    this.metadata = c.metadata
    this.createdAt = c.createdAt
  }
}
