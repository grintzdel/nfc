import { CategoryEntity } from './category.entity'

describe('CategoryEntity', () => {
  it('should create a category with a slugified slug from name', () => {
    const category = CategoryEntity.create({ name: 'Pass VIP' })

    expect(category.name).toBe('Pass VIP')
    expect(category.slug).toBe('pass-vip')
    expect(category.description).toBe('')
    expect(category.deletedAt).toBeNull()
  })

  it('should slugify an explicit slug', () => {
    const category = CategoryEntity.create({ name: 'X', slug: 'My Custom Slug!' })

    expect(category.slug).toBe('my-custom-slug')
  })

  it('should throw if name is missing', () => {
    expect(() => CategoryEntity.create({})).toThrow('Category name is required')
  })

  it('should update name, slug and description', () => {
    const category = CategoryEntity.create({ name: 'Old', slug: 'old' })
    const before = category.updatedAt

    category.update({ name: 'New name', slug: 'new slug', description: 'desc' })

    expect(category.name).toBe('New name')
    expect(category.slug).toBe('new-slug')
    expect(category.description).toBe('desc')
    expect(category.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
  })

  it('should soft delete', () => {
    const category = CategoryEntity.create({ name: 'X' })
    expect(category.isDeleted()).toBe(false)

    category.softDelete()

    expect(category.isDeleted()).toBe(true)
    expect(category.deletedAt).not.toBeNull()
  })

  it('should be idempotent on soft delete', () => {
    const category = CategoryEntity.create({ name: 'X' })
    category.softDelete()
    const first = category.deletedAt
    category.softDelete()

    expect(category.deletedAt).toEqual(first)
  })
})
