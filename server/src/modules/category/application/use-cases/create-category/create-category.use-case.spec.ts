import { createCategoryFixture } from '../../../__tests__/category.factory'
import { CategoryRepositoryMock } from '../../../__tests__/category.repository.mock'
import { CategorySlugAlreadyExistsError } from '../../../domain/errors/category.error'
import { CreateCategoryUseCase } from './create-category.use-case'

describe('CreateCategoryUseCase', () => {
  let repo: CategoryRepositoryMock
  let useCase: CreateCategoryUseCase

  beforeEach(() => {
    repo = new CategoryRepositoryMock()
    useCase = new CreateCategoryUseCase(repo)
  })

  it('creates a category when the slug is free', async () => {
    repo.findBySlug_result = null

    const created = await useCase.execute({ name: 'Pass VIP' })

    expect(created.name).toBe('Pass VIP')
    expect(created.slug).toBe('pass-vip')
    expect(repo.create_calledWith).toBeDefined()
  })

  it('throws CategorySlugAlreadyExistsError when slug is taken', async () => {
    repo.findBySlug_result = createCategoryFixture({ slug: 'bracelet' })

    await expect(useCase.execute({ name: 'Bracelet' })).rejects.toBeInstanceOf(CategorySlugAlreadyExistsError)
  })
})
