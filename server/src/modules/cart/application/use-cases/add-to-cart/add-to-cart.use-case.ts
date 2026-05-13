import { CartItemEntity } from '../../../domain/entity/cart-item.entity'
import { ICartItemRepository } from '../../../domain/repository/cart-item.repository.interface'

interface AddToCartInput {
  userId: string
  productId: string
  variantName?: string
  quantity: number
}

export class AddToCartUseCase {
  constructor(private readonly cartItemRepository: ICartItemRepository) {}

  async execute(input: AddToCartInput): Promise<CartItemEntity> {
    const existing = await this.cartItemRepository.findByUserAndProduct(
      input.userId,
      input.productId,
      input.variantName ?? null
    )

    if (existing) {
      existing.incrementQuantity(input.quantity)
      return this.cartItemRepository.update(existing)
    }

    const item = CartItemEntity.create({
      userId: input.userId,
      productId: input.productId,
      variantName: input.variantName ?? null,
      quantity: input.quantity,
    })

    return this.cartItemRepository.create(item)
  }
}
