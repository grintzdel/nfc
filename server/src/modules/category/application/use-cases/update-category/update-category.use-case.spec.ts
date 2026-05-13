import { createCategoryFixture } from '../../../__tests__/category.factory'
import { CategoryRepositoryMock } from '../../../__tests__/category.repository.mock'
import { CategoryNotFoundError, CategorySlugAlreadyExistsError } from '../../../domain/errors/category.error'
import { UpdateCategoryUseCase } from './update-category.use-case'

describe('UpdateCategoryUseCase', () => {
  let repo: CategoryRepositoryMock
  let useCase: UpdateCategoryUseCase

  beforeEach(() => {
    repo = new CategoryRepositoryMock()
    useCase = new UpdateCategoryUseCase(repo)
  })

  it('updates name and description without slug change', async () => {
    repo.findById_result = createCategoryFixture({ id: 'cat-1', slug: 'bracelet', name: 'Bracelet' })

    const result = await useCase.execute('cat-1', { name: 'Bracelets premium', description: 'NFC' })

    expect(result.name).toBe('Bracelets premium')
    expect(result.description).toBe('NFC')
    expect(result.slug).toBe('bracelet')
  })

  it('allows changing the slug if free', async () => {
    repo.findById_result = createCategoryFixture({ id: 'cat-1', slug: 'old-slug' })
    repo.findBySlug_result = null

    const result = await useCase.execute('cat-1', { slug: 'new-slug' })

    expect(result.slug).toBe('new-slug')
  })

  it('throws CategorySlugAlreadyExistsError when new slug collides with another category', async () => {
    repo.findById_result = createCategoryFixture({ id: 'cat-1', slug: 'old-slug' })
    repo.findBySlug_result = createCategoryFixture({ id: 'cat-2', slug: 'new-slug' })

    await expect(useCase.execute('cat-1', { slug: 'new-slug' })).rejects.toBeInstanceOf(CategorySlugAlreadyExistsError)
  })

  it('throws CategoryNotFoundError when category does not exist', async () => {
    repo.findById_result = null

    await expect(useCase.execute('missing', { name: 'x' })).rejects.toBeInstanceOf(CategoryNotFoundError)
  })
})
