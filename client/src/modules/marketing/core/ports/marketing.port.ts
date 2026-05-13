import type { MarketingDomainModel } from '../model/marketing.domain-model'

export interface IMarketingPort {
  getFaqs(): Promise<MarketingDomainModel.FaqOverviewDto[]>
}
