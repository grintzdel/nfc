import { createCategoryFixture } from '../../../__tests__/category.factory'
import { CategoryRepositoryMock } from '../../../__tests__/category.repository.mock'
import { GetAllCategoriesUseCase } from './get-all-categories.use-case'

describe('GetAllCategoriesUseCase', () => {
  it('returns all non-deleted categories from the repository', async () => {
    const repo = new CategoryRepositoryMock()
    repo.findAll_result = [createCategoryFixture({ name: 'A' }), createCategoryFixture({ name: 'B' })]
    const useCase = new GetAllCategoriesUseCase(repo)

    const result = await useCase.execute()

    expect(result).toHaveLength(2)
    expect(result[0]!.name).toBe('A')
  })
})
