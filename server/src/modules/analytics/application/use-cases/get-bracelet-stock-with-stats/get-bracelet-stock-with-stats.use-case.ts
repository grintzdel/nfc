import { IBraceletRepository } from '@modules/bracelet/domain/repository/bracelet.repository.interface'
import { ISupplyOrderRepository } from '@modules/supply-order/domain/repository/supply-order.repository.interface'
import { BraceletStatus } from '@modules/bracelet/domain/constants/bracelet-status.constant'
import { stockLevelFromFillPercent } from '../../../domain/constants/stock-level.constant'
import { AnalyticsDomainModel } from '../../../domain/model/analytics.domain-model'

const DEFAULT_MAX_CAPACITY = 5000

export class GetBraceletStockWithStatsUseCase {
  constructor(
    private readonly braceletRepository: IBraceletRepository,
    private readonly supplyOrderRepository: ISupplyOrderRepository,
  ) {}

  async execute(): Promise<AnalyticsDomainModel.BraceletStockStatsDto> {
    const current = await this.braceletRepository.countByStatus(BraceletStatus.STOCK)
    const envValue = process.env.BRACELET_MAX_CAPACITY
    if (!envValue) console.warn('BRACELET_MAX_CAPACITY not set, defaulting to', DEFAULT_MAX_CAPACITY)
    const parsed = Number(envValue)
    const maxCapacity = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_CAPACITY
    const fillPercent = maxCapacity === 0 ? 0 : (current / maxCapacity) * 100
    const level = stockLevelFromFillPercent(fillPercent)
    const pending = await this.supplyOrderRepository.findPending()
    const pendingOrder = pending
      ? { units: pending.units, estimatedDeliveryDate: pending.estimatedDeliveryDate }
      : null
    return { current, maxCapacity, fillPercent, level, pendingOrder }
  }
}
