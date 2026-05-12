import { CartItemEntity } from '../entity/cart-item.entity'

export interface ICartItemRepository {
  findByUserId(userId: string): Promise<CartItemEntity[]>
  findById(id: string): Promise<Nullable<CartItemEntity>>
  findByUserAndProduct(userId: string, productId: string, variantName: Nullable<string>): Promise<Nullable<CartItemEntity>>
  create(item: CartItemEntity): Promise<CartItemEntity>
  update(item: CartItemEntity): Promise<CartItemEntity>
  delete(id: string): Promise<void>
  deleteByUserId(userId: string): Promise<void>
}
