import { CategoryEntity } from '../entity/category.entity'

export interface ICategoryRepository {
  findAll(): Promise<CategoryEntity[]>
  findById(id: string): Promise<Nullable<CategoryEntity>>
  findBySlug(slug: string): Promise<Nullable<CategoryEntity>>
  create(category: CategoryEntity): Promise<CategoryEntity>
  update(category: CategoryEntity): Promise<CategoryEntity>
  delete(id: string): Promise<void>
}
