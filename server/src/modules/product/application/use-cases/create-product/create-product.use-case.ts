import { CategoryNotFoundError } from '@modules/category/domain/errors/category.error'
import { ICategoryRepository } from '@modules/category/domain/repository/category.repository.interface'

import { ProductEntity } from '../../../domain/entity/product.entity'
import { ProductAlreadyExistsError } from '../../../domain/errors/product.error'
import { IProductRepository } from '../../../domain/repository/product.repository.interface'

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(input: Record<string, unknown>): Promise<ProductEntity> {
    const product = ProductEntity.create(input)

    const category = await this.categoryRepository.findBySlug(product.category)
    if (!category) throw new CategoryNotFoundError(product.category)

    const existing = await this.productRepository.findBySlug(product.slug)
    if (existing) throw new ProductAlreadyExistsError(product.slug)
    return this.productRepository.create(product)
  }
}
