import type { MarketingDomainModel } from '../../../domain/model/marketing.domain-model'
import type { IMarketingRepository } from '../../../domain/repository/marketing.repository.interface'

export class GetFaqsUseCase {
  constructor(private readonly repository: IMarketingRepository) {}

  async execute(): Promise<MarketingDomainModel.FaqOverviewDto[]> {
    return this.repository.findAllFaqs()
  }
}
