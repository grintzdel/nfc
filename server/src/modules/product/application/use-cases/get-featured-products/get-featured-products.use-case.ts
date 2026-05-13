import { ProductEntity } from '../../../domain/entity/product.entity'
import { IProductRepository } from '../../../domain/repository/product.repository.interface'

export class GetFeaturedProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(): Promise<ProductEntity[]> {
    return this.productRepository.findFeatured()
  }
}
