import { CategoryEntity, CategoryEntityProps } from '../domain/entity/category.entity'

let counter = 0

export function createCategoryPropsFixture(overrides: Partial<CategoryEntityProps> = {}): CategoryEntityProps {
  counter++
  const now = new Date()
  return {
    id: `category-${counter}`,
    name: `Category ${counter}`,
    slug: `category-${counter}`,
    description: `Description ${counter}`,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  }
}

export function createCategoryFixture(overrides: Partial<CategoryEntityProps> = {}): CategoryEntity {
  return CategoryEntity.fromProps(createCategoryPropsFixture(overrides))
}
