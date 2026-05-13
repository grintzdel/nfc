import { IBraceletRepository } from '@modules/bracelet/domain/repository/bracelet.repository.interface'

import { AnalyticsDomainModel } from '../../../domain/model/analytics.domain-model'

const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

export class ListBraceletsActivationByYearUseCase {
  constructor(private readonly braceletRepository: IBraceletRepository) {}

  async execute(year?: number): Promise<AnalyticsDomainModel.ActivationsByYearDto> {
    const y = year ?? new Date().getFullYear()
    const rows = await this.braceletRepository.countActivationsByMonthInYear(y)
    return {
      year: y,
      months: rows.map((r) => ({ month: r.month, monthName: MONTH_NAMES[r.month - 1]!, activations: r.count })),
    }
  }
}
