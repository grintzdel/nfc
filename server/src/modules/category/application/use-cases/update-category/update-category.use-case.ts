import { CategoryEntity } from '../../../domain/entity/category.entity'
import { CategoryNotFoundError, CategorySlugAlreadyExistsError } from '../../../domain/errors/category.error'
import { ICategoryRepository } from '../../../domain/repository/category.repository.interface'

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(id: string, input: Record<string, unknown>): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findById(id)
    if (!category) throw new CategoryNotFoundError(id)

    const previousSlug = category.slug
    category.update(input as Partial<{ name: string; slug: string; description: string }>)

    if (category.slug !== previousSlug) {
      const collision = await this.categoryRepository.findBySlug(category.slug)
      if (collision && collision.id !== category.id) throw new CategorySlugAlreadyExistsError(category.slug)
    }

    return this.categoryRepository.update(category)
  }
}
