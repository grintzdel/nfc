import { CategoryNotFoundError } from '@modules/category/domain/errors/category.error'
import { ICategoryRepository } from '@modules/category/domain/repository/category.repository.interface'

import { ProductEntity } from '../../../domain/entity/product.entity'
import { ProductNotFoundError } from '../../../domain/errors/product.error'
import { IProductRepository } from '../../../domain/repository/product.repository.interface'

export class UpdateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(id: string, input: Record<string, unknown>): Promise<ProductEntity> {
    const product = await this.productRepository.findById(id)
    if (!product) throw new ProductNotFoundError(id)

    if (typeof input.category === 'string') {
      const category = await this.categoryRepository.findBySlug(input.category)
      if (!category) throw new CategoryNotFoundError(input.category)
    }

    product.update(input as Partial<ProductEntity>)
    return this.productRepository.update(product)
  }
}
