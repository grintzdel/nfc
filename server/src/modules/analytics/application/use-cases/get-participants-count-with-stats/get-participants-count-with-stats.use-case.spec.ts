import { IParticipantRepository } from '@modules/participant/domain/repository/participant.repository.interface'

import { GetParticipantsCountWithStatsUseCase } from './get-participants-count-with-stats.use-case'

const mockParticipantRepo: jest.Mocked<IParticipantRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByUserAndEvent: jest.fn(),
  findByBraceletId: jest.fn(),
  findAllByEventId: jest.fn(),
  findAllByUserId: jest.fn(),
  findPaginatedByEventId: jest.fn(),
  findPaginated: jest.fn(),
  countInRange: jest.fn(),
  countByEventId: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
}

describe('GetParticipantsCountWithStatsUseCase', () => {
  let useCase: GetParticipantsCountWithStatsUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new GetParticipantsCountWithStatsUseCase(mockParticipantRepo)
  })

  it('should return count and positive rate when last month is non-zero', async () => {
    mockParticipantRepo.countInRange.mockResolvedValueOnce(10).mockResolvedValueOnce(8)
    const result = await useCase.execute()
    expect(result.count).toBe(10)
    expect(result.rateVsLastMonth).toBeCloseTo(25)
  })

  it('should return null rate when last month count is zero', async () => {
    mockParticipantRepo.countInRange.mockResolvedValueOnce(10).mockResolvedValueOnce(0)
    const result = await useCase.execute()
    expect(result.count).toBe(10)
    expect(result.rateVsLastMonth).toBeNull()
  })
})
