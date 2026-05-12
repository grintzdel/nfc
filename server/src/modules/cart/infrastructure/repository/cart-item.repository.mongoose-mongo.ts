import { ICartItemRepository } from '../../domain/repository/cart-item.repository.interface'
import { CartItemEntity } from '../../domain/entity/cart-item.entity'
import { CartItemModel, CartItemDocument } from '../schema/cart-item.schema'

export class CartItemRepositoryMongooseMongo implements ICartItemRepository {
  private toEntity(doc: CartItemDocument): CartItemEntity {
    return CartItemEntity.fromProps({
      id: doc._id.toString(),
      userId: doc.userId,
      productId: doc.productId,
      variantName: doc.variantName,
      quantity: doc.quantity,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })
  }

  async findByUserId(userId: string): Promise<CartItemEntity[]> {
    const docs = await CartItemModel.find({ userId })
    return docs.map((doc) => this.toEntity(doc))
  }

  async findById(id: string): Promise<Nullable<CartItemEntity>> {
    const doc = await CartItemModel.findById(id)
    return doc ? this.toEntity(doc) : null
  }

  async findByUserAndProduct(
    userId: string,
    productId: string,
    variantName: Nullable<string>
  ): Promise<Nullable<CartItemEntity>> {
    const doc = await CartItemModel.findOne({ userId, productId, variantName })
    return doc ? this.toEntity(doc) : null
  }

  async create(item: CartItemEntity): Promise<CartItemEntity> {
    const doc = await CartItemModel.create({
      userId: item.userId,
      productId: item.productId,
      variantName: item.variantName,
      quantity: item.quantity,
    })
    return this.toEntity(doc)
  }

  async update(item: CartItemEntity): Promise<CartItemEntity> {
    const doc = await CartItemModel.findByIdAndUpdate(item.id, { quantity: item.quantity }, { new: true })
    return this.toEntity(doc!)
  }

  async delete(id: string): Promise<void> {
    await CartItemModel.findByIdAndDelete(id)
  }

  async deleteByUserId(userId: string): Promise<void> {
    await CartItemModel.deleteMany({ userId })
  }
}
