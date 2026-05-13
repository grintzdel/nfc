import { CategoryEntity } from '../../../domain/entity/category.entity'
import { ICategoryRepository } from '../../../domain/repository/category.repository.interface'

export class GetAllCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  execute(): Promise<CategoryEntity[]> {
    return this.categoryRepository.findAll()
  }
}
