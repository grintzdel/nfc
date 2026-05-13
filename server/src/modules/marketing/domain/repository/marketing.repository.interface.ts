import type { MarketingDomainModel } from '../model/marketing.domain-model'

export interface IMarketingRepository {
  findAllFaqs(): Promise<MarketingDomainModel.FaqOverviewDto[]>
}
