import { createCategoryFixture } from '../../../__tests__/category.factory'
import { CategoryRepositoryMock } from '../../../__tests__/category.repository.mock'
import { CategoryNotFoundError } from '../../../domain/errors/category.error'
import { GetCategoryBySlugUseCase } from './get-category-by-slug.use-case'

describe('GetCategoryBySlugUseCase', () => {
  let repo: CategoryRepositoryMock
  let useCase: GetCategoryBySlugUseCase

  beforeEach(() => {
    repo = new CategoryRepositoryMock()
    useCase = new GetCategoryBySlugUseCase(repo)
  })

  it('returns the category when the slug exists', async () => {
    repo.findBySlug_result = createCategoryFixture({ slug: 'bracelet' })

    const result = await useCase.execute('bracelet')

    expect(result.slug).toBe('bracelet')
  })

  it('throws CategoryNotFoundError when the slug does not exist', async () => {
    repo.findBySlug_result = null

    await expect(useCase.execute('unknown')).rejects.toBeInstanceOf(CategoryNotFoundError)
  })
})
