import { CategoryEntity } from '../../../domain/entity/category.entity'
import { CategoryNotFoundError } from '../../../domain/errors/category.error'
import { ICategoryRepository } from '../../../domain/repository/category.repository.interface'

export class GetCategoryBySlugUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(slug: string): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findBySlug(slug)
    if (!category) throw new CategoryNotFoundError(slug)
    return category
  }
}
