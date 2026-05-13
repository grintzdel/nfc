import type { HttpClient } from '@/modules/shared/http/http-client'
import type { IMarketingPort } from '../ports/marketing.port'
import type { MarketingDomainModel } from '../model/marketing.domain-model'

export class MarketingHttpAdapter implements IMarketingPort {
  constructor(private readonly httpClient: HttpClient) {}

  async getFaqs(): Promise<MarketingDomainModel.FaqOverviewDto[]> {
    const result = await this.httpClient.get<MarketingDomainModel.FaqOverviewDto[]>('/marketing/faqs')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }
}
