import { CategoryEntity } from '../../../domain/entity/category.entity'
import { CategorySlugAlreadyExistsError } from '../../../domain/errors/category.error'
import { ICategoryRepository } from '../../../domain/repository/category.repository.interface'

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: Record<string, unknown>): Promise<CategoryEntity> {
    const category = CategoryEntity.create(input)
    const existing = await this.categoryRepository.findBySlug(category.slug)
    if (existing) throw new CategorySlugAlreadyExistsError(category.slug)
    return this.categoryRepository.create(category)
  }
}
