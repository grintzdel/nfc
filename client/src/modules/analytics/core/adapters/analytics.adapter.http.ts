import type { HttpClient } from '@/modules/shared/http/http-client'
import type { IAnalyticsPort } from '../ports/analytics.port'
import type { AnalyticsDomainModel } from '../model/analytics.domain-model'

export class AnalyticsHttpAdapter implements IAnalyticsPort {
  constructor(private readonly httpClient: HttpClient) {}

  async getActiveEvents(): Promise<AnalyticsDomainModel.ActiveEventsStatsDto> {
    const result = await this.httpClient.get<AnalyticsDomainModel.ActiveEventsStatsDto>('/admin-stats/events/active')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getNextEvent(): Promise<AnalyticsDomainModel.NextEventStatsDto> {
    const result = await this.httpClient.get<AnalyticsDomainModel.NextEventStatsDto>('/admin-stats/events/next')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getParticipantsCount(): Promise<AnalyticsDomainModel.CountWithRateDto> {
    const result = await this.httpClient.get<AnalyticsDomainModel.CountWithRateDto>('/admin-stats/participants/count')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getBraceletsCount(): Promise<AnalyticsDomainModel.CountWithRateDto> {
    const result = await this.httpClient.get<AnalyticsDomainModel.CountWithRateDto>('/admin-stats/bracelets/count')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getStock(): Promise<AnalyticsDomainModel.BraceletStockStatsDto> {
    const result = await this.httpClient.get<AnalyticsDomainModel.BraceletStockStatsDto>('/admin-stats/bracelets/stock')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getActivations(year?: number): Promise<AnalyticsDomainModel.ActivationsByYearDto> {
    const params = year ? `?year=${year}` : ''
    const result = await this.httpClient.get<AnalyticsDomainModel.ActivationsByYearDto>(`/admin-stats/bracelets/activations${params}`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getRevenue(): Promise<AnalyticsDomainModel.RevenueWithRateDto> {
    const result = await this.httpClient.get<AnalyticsDomainModel.RevenueWithRateDto>('/admin-stats/revenue')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getInteractions(): Promise<AnalyticsDomainModel.InteractionsStatsDto> {
    const result = await this.httpClient.get<AnalyticsDomainModel.InteractionsStatsDto>('/admin-stats/interactions')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getEventPageStats(): Promise<AnalyticsDomainModel.EventPageStatsDto> {
    const result = await this.httpClient.get<AnalyticsDomainModel.EventPageStatsDto>('/admin-stats/events/page-stats')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getEventDetailStats(eventId: string): Promise<AnalyticsDomainModel.EventDetailStatsDto> {
    const result = await this.httpClient.get<AnalyticsDomainModel.EventDetailStatsDto>(`/admin-stats/events/${eventId}`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }
}
