import { ICartItemRepository } from '../../../domain/repository/cart-item.repository.interface'
import { CartItemNotFoundError } from '../../../domain/errors/cart.error'

export class RemoveCartItemUseCase {
  constructor(private readonly cartItemRepository: ICartItemRepository) {}

  async execute(id: string): Promise<void> {
    const item = await this.cartItemRepository.findById(id)
    if (!item) throw new CartItemNotFoundError(id)

    await this.cartItemRepository.delete(id)
  }
}
