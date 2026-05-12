import { ICartItemRepository } from '../../../domain/repository/cart-item.repository.interface'

export class ClearCartUseCase {
  constructor(private readonly cartItemRepository: ICartItemRepository) {}

  async execute(userId: string): Promise<void> {
    await this.cartItemRepository.deleteByUserId(userId)
  }
}
