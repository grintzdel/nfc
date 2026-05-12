import { ICheckInRepository } from '@modules/check-in/domain/repository/check-in.repository.interface'
import { ListInteractionTypesWithStatsUseCase } from './list-interaction-types-with-stats.use-case'

const mockCheckInRepo: jest.Mocked<ICheckInRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findAllByEventId: jest.fn(),
  findAllByBraceletId: jest.fn(),
  findPaginatedByEventId: jest.fn(),
  countByInteractionType: jest.fn(),
  countByEventIdAndType: jest.fn(),
  countByEventId: jest.fn(),
}

describe('ListInteractionTypesWithStatsUseCase', () => {
  let useCase: ListInteractionTypesWithStatsUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new ListInteractionTypesWithStatsUseCase(mockCheckInRepo)
  })

  it('should return total, share percents, and French labels', async () => {
    mockCheckInRepo.countByInteractionType.mockResolvedValue([
      { type: 'check_in', count: 6 },
      { type: 'networking', count: 2 },
      { type: 'vote', count: 1 },
      { type: 'cashless', count: 1 },
    ])

    const result = await useCase.execute()

    expect(result.total).toBe(10)
    expect(result.types).toHaveLength(4)

    const checkIn = result.types.find((t) => t.type === 'check_in')!
    expect(checkIn.typeLabel).toBe('Check-in')
    expect(checkIn.scansCount).toBe(6)
    expect(checkIn.sharePercent).toBeCloseTo(60)

    const networking = result.types.find((t) => t.type === 'networking')!
    expect(networking.typeLabel).toBe('Réseau')
    expect(networking.sharePercent).toBeCloseTo(20)

    const vote = result.types.find((t) => t.type === 'vote')!
    expect(vote.typeLabel).toBe('Votes')
    expect(vote.sharePercent).toBeCloseTo(10)

    const cashless = result.types.find((t) => t.type === 'cashless')!
    expect(cashless.typeLabel).toBe('Cashless')
    expect(cashless.sharePercent).toBeCloseTo(10)
  })

  it('should return zero shares when all counts are zero', async () => {
    mockCheckInRepo.countByInteractionType.mockResolvedValue([
      { type: 'check_in', count: 0 },
      { type: 'networking', count: 0 },
      { type: 'vote', count: 0 },
      { type: 'cashless', count: 0 },
    ])

    const result = await useCase.execute()

    expect(result.total).toBe(0)
    result.types.forEach((t) => {
      expect(t.sharePercent).toBe(0)
    })
  })
})
