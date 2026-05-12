import type { AnalyticsDomainModel } from '../model/analytics.domain-model'

export interface IAnalyticsPort {
  getActiveEvents(): Promise<AnalyticsDomainModel.ActiveEventsStatsDto>
  getNextEvent(): Promise<AnalyticsDomainModel.NextEventStatsDto>
  getParticipantsCount(): Promise<AnalyticsDomainModel.CountWithRateDto>
  getBraceletsCount(): Promise<AnalyticsDomainModel.CountWithRateDto>
  getStock(): Promise<AnalyticsDomainModel.BraceletStockStatsDto>
  getActivations(year?: number): Promise<AnalyticsDomainModel.ActivationsByYearDto>
  getRevenue(): Promise<AnalyticsDomainModel.RevenueWithRateDto>
  getInteractions(): Promise<AnalyticsDomainModel.InteractionsStatsDto>
  getEventPageStats(): Promise<AnalyticsDomainModel.EventPageStatsDto>
  getEventDetailStats(eventId: string): Promise<AnalyticsDomainModel.EventDetailStatsDto>
}
