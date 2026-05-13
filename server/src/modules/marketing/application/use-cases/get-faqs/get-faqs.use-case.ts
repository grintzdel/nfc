import type { IMarketingRepository } from '../../../domain/repository/marketing.repository.interface'
import type { MarketingDomainModel } from '../../../domain/model/marketing.domain-model'

export class GetFaqsUseCase {
  constructor(private readonly repository: IMarketingRepository) {}

  async execute(): Promise<MarketingDomainModel.FaqOverviewDto[]> {
    return this.repository.findAllFaqs()
  }
}
