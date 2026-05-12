import { OrderEntity } from '../../domain/entity/order.entity'

export class OrderResponseDto {
  public readonly id: string; public readonly userId: string
  public readonly items: { productId: string; productName: string; quantity: number; unitPrice: number }[]
  public readonly totalAmount: number; public readonly status: string
  public readonly shippingAddress: string; public readonly createdAt: Date

  constructor(entity: OrderEntity) {
    this.id = entity.id; this.userId = entity.userId; this.items = entity.items
    this.totalAmount = entity.totalAmount; this.status = entity.status
    this.shippingAddress = entity.shippingAddress; this.createdAt = entity.createdAt
  }
}
