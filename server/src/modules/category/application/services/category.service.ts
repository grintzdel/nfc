import { CreateCategoryUseCase } from '../use-cases/create-category/create-category.use-case'
import { DeleteCategoryUseCase } from '../use-cases/delete-category/delete-category.use-case'
import { GetAllCategoriesUseCase } from '../use-cases/get-all-categories/get-all-categories.use-case'
import { GetCategoryBySlugUseCase } from '../use-cases/get-category-by-slug/get-category-by-slug.use-case'
import { UpdateCategoryUseCase } from '../use-cases/update-category/update-category.use-case'

export class CategoryService {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getAllCategoriesUseCase: GetAllCategoriesUseCase,
    private readonly getCategoryBySlugUseCase: GetCategoryBySlugUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private deleteCategoryUseCase: DeleteCategoryUseCase
  ) {}

  create(input: Record<string, unknown>) {
    return this.createCategoryUseCase.execute(input)
  }

  getAll() {
    return this.getAllCategoriesUseCase.execute()
  }

  getBySlug(slug: string) {
    return this.getCategoryBySlugUseCase.execute(slug)
  }

  update(id: string, input: Record<string, unknown>) {
    return this.updateCategoryUseCase.execute(id, input)
  }

  delete(id: string) {
    return this.deleteCategoryUseCase.execute(id)
  }

  attachDelete(useCase: DeleteCategoryUseCase): void {
    this.deleteCategoryUseCase = useCase
  }
}
