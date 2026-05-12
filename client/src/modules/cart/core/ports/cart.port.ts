import type { CartDomainModel } from '../model/cart.domain-model'

export interface ICartPort {
  getCart(): Promise<CartDomainModel.CartItemOverviewDto[]>
  addToCart(dto: CartDomainModel.AddToCartDto): Promise<CartDomainModel.CartItemOverviewDto>
  updateItem(id: string, dto: CartDomainModel.UpdateCartItemDto): Promise<CartDomainModel.CartItemOverviewDto>
  removeItem(id: string): Promise<void>
  clearCart(): Promise<void>
}
