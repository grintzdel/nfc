import { SupplyOrderEntity } from '../../domain/entity/supply-order.entity'
import { SupplyOrderStatus } from '../../domain/constants/supply-order-status.constant'

export class SupplyOrderResponseDto {
  id: string
  units: number
  orderedAt: Date
  estimatedDeliveryDate: Date
  status: SupplyOrderStatus
  receivedAt: Nullable<Date>
  createdAt: Date
  updatedAt: Date

  constructor(e: SupplyOrderEntity) {
    this.id = e.id
    this.units = e.units
    this.orderedAt = e.orderedAt
    this.estimatedDeliveryDate = e.estimatedDeliveryDate
    this.status = e.status
    this.receivedAt = e.receivedAt
    this.createdAt = e.createdAt
    this.updatedAt = e.updatedAt
  }
}
