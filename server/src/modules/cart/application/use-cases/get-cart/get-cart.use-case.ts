import { CartItemEntity } from '../../../domain/entity/cart-item.entity'
import { ICartItemRepository } from '../../../domain/repository/cart-item.repository.interface'

export class GetCartUseCase {
  constructor(private readonly cartItemRepository: ICartItemRepository) {}

  async execute(userId: string): Promise<CartItemEntity[]> {
    return this.cartItemRepository.findByUserId(userId)
  }
}
