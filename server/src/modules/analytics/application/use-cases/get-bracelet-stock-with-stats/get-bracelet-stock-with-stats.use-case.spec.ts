import { IBraceletRepository } from '@modules/bracelet/domain/repository/bracelet.repository.interface'
import { ISupplyOrderRepository } from '@modules/supply-order/domain/repository/supply-order.repository.interface'
import { GetBraceletStockWithStatsUseCase } from './get-bracelet-stock-with-stats.use-case'
import { SupplyOrderEntity } from '@modules/supply-order/domain/entity/supply-order.entity'

const mockBraceletRepo: jest.Mocked<IBraceletRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByNfcId: jest.fn(),
  findAll: jest.fn(),
  findAllByStatus: jest.fn(),
  findAllByEventId: jest.fn(),
  findAllByUserId: jest.fn(),
  countByStatus: jest.fn(),
  countByEventId: jest.fn(),
  countByEventIdAndStatus: jest.fn(),
  countInRange: jest.fn(),
  countActivationsByMonthInYear: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
}

const mockSupplyOrderRepo: jest.Mocked<ISupplyOrderRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findPending: jest.fn(),
  update: jest.fn(),
}

describe('GetBraceletStockWithStatsUseCase', () => {
  let useCase: GetBraceletStockWithStatsUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.BRACELET_MAX_CAPACITY = '1000'
    useCase = new GetBraceletStockWithStatsUseCase(mockBraceletRepo, mockSupplyOrderRepo)
  })

  afterEach(() => {
    delete process.env.BRACELET_MAX_CAPACITY
  })

  it('should return low level with pending order when fillPercent is 30%', async () => {
    const deliveryDate = new Date('2026-05-01')
    const pendingEntity = SupplyOrderEntity.fromProps({
      id: 'so-1',
      units: 100,
      orderedAt: new Date(),
      estimatedDeliveryDate: deliveryDate,
      status: 'pending',
      receivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockBraceletRepo.countByStatus.mockResolvedValue(300)
    mockSupplyOrderRepo.findPending.mockResolvedValue(pendingEntity)

    const result = await useCase.execute()

    expect(result.current).toBe(300)
    expect(result.maxCapacity).toBe(1000)
    expect(result.fillPercent).toBeCloseTo(30)
    expect(result.level).toBe('low')
    expect(result.pendingOrder).not.toBeNull()
    expect(result.pendingOrder?.units).toBe(100)
    expect(result.pendingOrder?.estimatedDeliveryDate).toEqual(deliveryDate)
  })

  it('should return mid level with no pending order when fillPercent is 50%', async () => {
    mockBraceletRepo.countByStatus.mockResolvedValue(500)
    mockSupplyOrderRepo.findPending.mockResolvedValue(null)

    const result = await useCase.execute()

    expect(result.fillPercent).toBeCloseTo(50)
    expect(result.level).toBe('mid')
    expect(result.pendingOrder).toBeNull()
  })

  it('should default to maxCapacity 5000 and log warning when env var is unset', async () => {
    delete process.env.BRACELET_MAX_CAPACITY
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)

    mockBraceletRepo.countByStatus.mockResolvedValue(0)
    mockSupplyOrderRepo.findPending.mockResolvedValue(null)

    const result = await useCase.execute()

    expect(result.maxCapacity).toBe(5000)
    expect(warnSpy).toHaveBeenCalledWith('BRACELET_MAX_CAPACITY not set, defaulting to', 5000)
    warnSpy.mockRestore()
  })
})
