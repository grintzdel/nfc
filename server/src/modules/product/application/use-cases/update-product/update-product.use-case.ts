import { ProductEntity } from '../../../domain/entity/product.entity'
import { ProductNotFoundError } from '../../../domain/errors/product.error'
import { IProductRepository } from '../../../domain/repository/product.repository.interface'

export class UpdateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: string, input: Record<string, unknown>): Promise<ProductEntity> {
    const product = await this.productRepository.findById(id)
    if (!product) throw new ProductNotFoundError(id)
    product.update(input as Partial<ProductEntity>)
    return this.productRepository.update(product)
  }
}
