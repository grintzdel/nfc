import { ProductEntity } from '../../../domain/entity/product.entity'
import { ProductAlreadyExistsError } from '../../../domain/errors/product.error'
import { IProductRepository } from '../../../domain/repository/product.repository.interface'

export class CreateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: Record<string, unknown>): Promise<ProductEntity> {
    const product = ProductEntity.create(input)
    const existing = await this.productRepository.findBySlug(product.slug)
    if (existing) throw new ProductAlreadyExistsError(product.slug)
    return this.productRepository.create(product)
  }
}
