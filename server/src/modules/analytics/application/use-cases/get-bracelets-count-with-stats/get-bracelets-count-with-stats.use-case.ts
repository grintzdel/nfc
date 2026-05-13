import { IBraceletRepository } from '@modules/bracelet/domain/repository/bracelet.repository.interface'
import { getMonthRange } from '@shared/utils/month-range'

import { AnalyticsDomainModel } from '../../../domain/model/analytics.domain-model'

export class GetBraceletsCountWithStatsUseCase {
  constructor(private readonly braceletRepository: IBraceletRepository) {}

  async execute(): Promise<AnalyticsDomainModel.CountWithRateDto> {
    const thisMonth = getMonthRange(0)
    const lastMonth = getMonthRange(-1)
    const count = await this.braceletRepository.countInRange(thisMonth.from, thisMonth.to)
    const prev = await this.braceletRepository.countInRange(lastMonth.from, lastMonth.to)
    const rateVsLastMonth = prev === 0 ? null : ((count - prev) / prev) * 100
    return { count, rateVsLastMonth }
  }
}
