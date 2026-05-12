import { IProductRepository } from '../../../domain/repository/product.repository.interface'
import { ProductEntity } from '../../../domain/entity/product.entity'

export class GetAllProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(): Promise<ProductEntity[]> {
    return this.productRepository.findAll()
  }
}
