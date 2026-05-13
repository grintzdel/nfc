import { CartItemEntity } from '../../../domain/entity/cart-item.entity'
import { CartItemNotFoundError } from '../../../domain/errors/cart.error'
import { ICartItemRepository } from '../../../domain/repository/cart-item.repository.interface'

export class UpdateCartItemUseCase {
  constructor(private readonly cartItemRepository: ICartItemRepository) {}

  async execute(id: string, quantity: number): Promise<CartItemEntity> {
    const item = await this.cartItemRepository.findById(id)
    if (!item) throw new CartItemNotFoundError(id)

    item.updateQuantity(quantity)
    return this.cartItemRepository.update(item)
  }
}
