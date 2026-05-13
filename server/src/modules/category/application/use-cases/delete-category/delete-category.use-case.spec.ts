import { IProductRepository } from '@modules/product/domain/repository/product.repository.interface'

import { createCategoryFixture } from '../../../__tests__/category.factory'
import { CategoryRepositoryMock } from '../../../__tests__/category.repository.mock'
import { CategoryInUseError, CategoryNotFoundError } from '../../../domain/errors/category.error'
import { DeleteCategoryUseCase } from './delete-category.use-case'

function makeProductRepoMock(): jest.Mocked<IProductRepository> {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    findFeatured: jest.fn(),
    countByCategory: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}

describe('DeleteCategoryUseCase', () => {
  let categoryRepo: CategoryRepositoryMock
  let productRepo: jest.Mocked<IProductRepository>
  let useCase: DeleteCategoryUseCase

  beforeEach(() => {
    categoryRepo = new CategoryRepositoryMock()
    productRepo = makeProductRepoMock()
    useCase = new DeleteCategoryUseCase(categoryRepo, productRepo)
  })

  it('soft-deletes the category when no product uses its slug', async () => {
    categoryRepo.findById_result = createCategoryFixture({ id: 'cat-1', slug: 'bracelet' })
    productRepo.countByCategory.mockResolvedValue(0)

    await useCase.execute('cat-1')

    expect(productRepo.countByCategory).toHaveBeenCalledWith('bracelet')
    expect(categoryRepo.delete_calledWith).toBe('cat-1')
  })

  it('throws CategoryInUseError when at least one product references the slug', async () => {
    categoryRepo.findById_result = createCategoryFixture({ id: 'cat-1', slug: 'bracelet' })
    productRepo.countByCategory.mockResolvedValue(3)

    await expect(useCase.execute('cat-1')).rejects.toBeInstanceOf(CategoryInUseError)
    expect(categoryRepo.delete_calledWith).toBeNull()
  })

  it('throws CategoryNotFoundError when the category does not exist', async () => {
    categoryRepo.findById_result = null

    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(CategoryNotFoundError)
  })
})
