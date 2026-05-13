import { ProductEntity } from '../../../domain/entity/product.entity'
import { ProductNotFoundError } from '../../../domain/errors/product.error'
import { IProductRepository } from '../../../domain/repository/product.repository.interface'

export class GetProductBySlugUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(slug: string): Promise<ProductEntity> {
    const product = await this.productRepository.findBySlug(slug)
    if (!product) throw new ProductNotFoundError(slug)
    return product
  }
}
