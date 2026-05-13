import { IProductRepository } from '@modules/product/domain/repository/product.repository.interface'

import { CategoryInUseError, CategoryNotFoundError } from '../../../domain/errors/category.error'
import { ICategoryRepository } from '../../../domain/repository/category.repository.interface'

export class DeleteCategoryUseCase {
  constructor(
    private readonly categoryRepository: ICategoryRepository,
    private readonly productRepository: IProductRepository
  ) {}

  async execute(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id)
    if (!category) throw new CategoryNotFoundError(id)

    const productCount = await this.productRepository.countByCategory(category.slug)
    if (productCount > 0) throw new CategoryInUseError(category.slug, productCount)

    await this.categoryRepository.delete(id)
  }
}
