import { ICheckInRepository } from '@modules/check-in/domain/repository/check-in.repository.interface'
import { InteractionType } from '@modules/check-in/domain/constants/interaction-type.constant'
import { AnalyticsDomainModel } from '../../../domain/model/analytics.domain-model'

const INTERACTION_LABELS: Record<InteractionType, string> = {
  check_in: 'Check-in',
  networking: 'Réseau',
  vote: 'Votes',
  cashless: 'Cashless',
}

export class ListInteractionTypesWithStatsUseCase {
  constructor(private readonly checkInRepository: ICheckInRepository) {}

  async execute(): Promise<AnalyticsDomainModel.InteractionsStatsDto> {
    const rows = await this.checkInRepository.countByInteractionType()
    const total = rows.reduce((s, r) => s + r.count, 0)
    return {
      total,
      types: rows.map((r) => ({
        type: r.type,
        typeLabel: INTERACTION_LABELS[r.type],
        scansCount: r.count,
        sharePercent: total === 0 ? 0 : (r.count / total) * 100,
      })),
    }
  }
}
