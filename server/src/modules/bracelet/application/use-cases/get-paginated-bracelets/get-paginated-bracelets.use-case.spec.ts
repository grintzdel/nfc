import { BraceletRepositoryMock } from '../../../__tests__/bracelet.repository.mock'
import { BraceletStatus } from '../../../domain/constants/bracelet-status.constant'
import { GetPaginatedBraceletsUseCase } from './get-paginated-bracelets.use-case'

describe('GetPaginatedBraceletsUseCase', () => {
  let braceletRepo: BraceletRepositoryMock
  let useCase: GetPaginatedBraceletsUseCase

  beforeEach(() => {
    braceletRepo = new BraceletRepositoryMock()
    useCase = new GetPaginatedBraceletsUseCase(braceletRepo)
  })

  it('passes params through to the repo', async () => {
    braceletRepo.findPaginated_result = { items: [], total: 0, page: 2, limit: 50, totalPages: 0 }

    await useCase.execute({ page: 2, limit: 50, status: BraceletStatus.ACTIVE, search: 'nfc-' })

    expect(braceletRepo.findPaginated_calledWith).toEqual({
      page: 2,
      limit: 50,
      status: BraceletStatus.ACTIVE,
      search: 'nfc-',
    })
  })

  it('clamps page to >= 1 and limit into [1, 100]', async () => {
    braceletRepo.findPaginated_result = { items: [], total: 0, page: 1, limit: 100, totalPages: 0 }

    await useCase.execute({ page: -5, limit: 9999 })
    expect(braceletRepo.findPaginated_calledWith?.page).toBe(1)
    expect(braceletRepo.findPaginated_calledWith?.limit).toBe(100)

    await useCase.execute({ page: 1, limit: 0 })
    expect(braceletRepo.findPaginated_calledWith?.limit).toBe(1)
  })

  it('returns the repo result as-is', async () => {
    braceletRepo.findPaginated_result = { items: [], total: 42, page: 1, limit: 20, totalPages: 3 }

    const result = await useCase.execute({ page: 1, limit: 20 })

    expect(result).toEqual({ items: [], total: 42, page: 1, limit: 20, totalPages: 3 })
  })
})
