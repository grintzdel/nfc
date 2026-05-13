import { CategoryEntity } from '../domain/entity/category.entity'
import { ICategoryRepository } from '../domain/repository/category.repository.interface'

export class CategoryRepositoryMock implements ICategoryRepository {
  findAll_result: CategoryEntity[] = []
  findById_result: Nullable<CategoryEntity> = null
  findById_calledWith: Nullable<string> = null
  findBySlug_result: Nullable<CategoryEntity> = null
  findBySlug_calledWith: Nullable<string> = null
  create_result: Nullable<CategoryEntity> = null
  create_calledWith: Nullable<CategoryEntity> = null
  update_result: Nullable<CategoryEntity> = null
  update_calledWith: Nullable<CategoryEntity> = null
  delete_calledWith: Nullable<string> = null

  async findAll(): Promise<CategoryEntity[]> {
    return this.findAll_result
  }
  async findById(id: string): Promise<Nullable<CategoryEntity>> {
    this.findById_calledWith = id
    return this.findById_result
  }
  async findBySlug(slug: string): Promise<Nullable<CategoryEntity>> {
    this.findBySlug_calledWith = slug
    return this.findBySlug_result
  }
  async create(c: CategoryEntity): Promise<CategoryEntity> {
    this.create_calledWith = c
    return this.create_result ?? c
  }
  async update(c: CategoryEntity): Promise<CategoryEntity> {
    this.update_calledWith = c
    return this.update_result ?? c
  }
  async delete(id: string): Promise<void> {
    this.delete_calledWith = id
  }
}
