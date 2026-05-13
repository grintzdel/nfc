import type { CategoryDomainModel } from '../model/category.domain-model'

export interface ICategoryPort {
  getAll(): Promise<CategoryDomainModel.CategoryOverviewDto[]>
  getBySlug(slug: string): Promise<CategoryDomainModel.CategoryOverviewDto>
  create(dto: CategoryDomainModel.CreateCategoryDto): Promise<CategoryDomainModel.CategoryOverviewDto>
  update(id: string, dto: CategoryDomainModel.UpdateCategoryDto): Promise<CategoryDomainModel.CategoryOverviewDto>
  delete(id: string): Promise<void>
}
