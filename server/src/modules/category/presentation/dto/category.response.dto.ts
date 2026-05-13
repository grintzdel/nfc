import { CategoryEntity } from '../../domain/entity/category.entity'

export class CategoryResponseDto {
  public readonly id: string
  public readonly name: string
  public readonly slug: string
  public readonly description: string
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(entity: CategoryEntity) {
    this.id = entity.id
    this.name = entity.name
    this.slug = entity.slug
    this.description = entity.description
    this.createdAt = entity.createdAt
    this.updatedAt = entity.updatedAt
  }
}
