import { IParticipantRepository } from '@modules/participant/domain/repository/participant.repository.interface'
import { getMonthRange } from '@shared/utils/month-range'

import { AnalyticsDomainModel } from '../../../domain/model/analytics.domain-model'

export class GetParticipantsCountWithStatsUseCase {
  constructor(private readonly participantRepository: IParticipantRepository) {}

  async execute(): Promise<AnalyticsDomainModel.CountWithRateDto> {
    const thisMonth = getMonthRange(0)
    const lastMonth = getMonthRange(-1)
    const count = await this.participantRepository.countInRange(thisMonth.from, thisMonth.to)
    const prev = await this.participantRepository.countInRange(lastMonth.from, lastMonth.to)
    const rateVsLastMonth = prev === 0 ? null : ((count - prev) / prev) * 100
    return { count, rateVsLastMonth }
  }
}
