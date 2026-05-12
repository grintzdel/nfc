import { IOrderRepository } from '@modules/order/domain/repository/order.repository.interface'
import { OrderStatus } from '@modules/order/domain/constants/order.constant'
import { getMonthRange } from '@shared/utils/month-range'
import { AnalyticsDomainModel } from '../../../domain/model/analytics.domain-model'

export class GetRevenueWithStatsUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(): Promise<AnalyticsDomainModel.RevenueWithRateDto> {
    const counted: OrderStatus[] = [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED]
    const thisMonth = getMonthRange(0)
    const lastMonth = getMonthRange(-1)
    const revenue = await this.orderRepository.sumRevenueInRange(thisMonth.from, thisMonth.to, counted)
    const prev = await this.orderRepository.sumRevenueInRange(lastMonth.from, lastMonth.to, counted)
    const rateVsLastMonth = prev === 0 ? null : ((revenue - prev) / prev) * 100
    return { revenue, rateVsLastMonth }
  }
}
