import type { HttpClient } from '@/modules/shared/http/http-client'

import type { CartDomainModel } from '../model/cart.domain-model'
import type { ICartPort } from '../ports/cart.port'

export class CartHttpAdapter implements ICartPort {
  constructor(private readonly httpClient: HttpClient) {}

  async getCart(): Promise<CartDomainModel.CartItemOverviewDto[]> {
    const result = await this.httpClient.get<CartDomainModel.CartItemOverviewDto[]>('/cart')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async addToCart(dto: CartDomainModel.AddToCartDto): Promise<CartDomainModel.CartItemOverviewDto> {
    const result = await this.httpClient.post<CartDomainModel.CartItemOverviewDto>('/cart/items', dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async updateItem(id: string, dto: CartDomainModel.UpdateCartItemDto): Promise<CartDomainModel.CartItemOverviewDto> {
    const result = await this.httpClient.patch<CartDomainModel.CartItemOverviewDto>(`/cart/items/${id}`, dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async removeItem(id: string): Promise<void> {
    const result = await this.httpClient.delete(`/cart/items/${id}`)
    if (result.error) throw new Error(result.error.message)
  }

  async clearCart(): Promise<void> {
    const result = await this.httpClient.delete('/cart')
    if (result.error) throw new Error(result.error.message)
  }
}
