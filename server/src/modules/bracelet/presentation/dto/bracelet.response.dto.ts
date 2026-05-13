import type { BraceletStatus } from '../../domain/constants/bracelet-status.constant'
import { BraceletEntity } from '../../domain/entity/bracelet.entity'

export class BraceletResponseDto {
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

  constructor(b: BraceletEntity) {
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
  }
}
