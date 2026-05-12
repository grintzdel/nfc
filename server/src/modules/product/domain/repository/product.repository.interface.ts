import { ProductEntity } from '../entity/product.entity'

export interface IProductRepository {
  findAll(): Promise<ProductEntity[]>
  findById(id: string): Promise<Nullable<ProductEntity>>
  findBySlug(slug: string): Promise<Nullable<ProductEntity>>
  findFeatured(): Promise<ProductEntity[]>
  create(product: ProductEntity): Promise<ProductEntity>
  update(product: ProductEntity): Promise<ProductEntity>
  delete(id: string): Promise<void>
}
