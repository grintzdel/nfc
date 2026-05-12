import { CartItemEntity } from '../../domain/entity/cart-item.entity'

export class CartItemResponseDto {
  public readonly id: string
  public readonly productId: string
  public readonly variantName: string | null
  public readonly quantity: number
  public readonly createdAt: Date

  constructor(entity: CartItemEntity) {
    this.id = entity.id
    this.productId = entity.productId
    this.variantName = entity.variantName
    this.quantity = entity.quantity
    this.createdAt = entity.createdAt
  }
}
