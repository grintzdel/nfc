import { AnalyticsDomainModel } from '../../domain/model/analytics.domain-model'
import { GetBraceletStockWithStatsUseCase } from '../use-cases/get-bracelet-stock-with-stats/get-bracelet-stock-with-stats.use-case'
import { GetBraceletsCountWithStatsUseCase } from '../use-cases/get-bracelets-count-with-stats/get-bracelets-count-with-stats.use-case'
import { GetEventDetailStatsUseCase } from '../use-cases/get-event-detail-stats/get-event-detail-stats.use-case'
import { GetEventPageStatsUseCase } from '../use-cases/get-event-page-stats/get-event-page-stats.use-case'
import { GetNextEventWithStatsUseCase } from '../use-cases/get-next-event-with-stats/get-next-event-with-stats.use-case'
import { GetParticipantsCountWithStatsUseCase } from '../use-cases/get-participants-count-with-stats/get-participants-count-with-stats.use-case'
import { GetRevenueWithStatsUseCase } from '../use-cases/get-revenue-with-stats/get-revenue-with-stats.use-case'
import { ListActiveEventsWithStatsUseCase } from '../use-cases/list-active-events-with-stats/list-active-events-with-stats.use-case'
import { ListBraceletsActivationByYearUseCase } from '../use-cases/list-bracelets-activation-by-year/list-bracelets-activation-by-year.use-case'
import { ListInteractionTypesWithStatsUseCase } from '../use-cases/list-interaction-types-with-stats/list-interaction-types-with-stats.use-case'

export class AnalyticsService {
  constructor(
    private readonly listActiveEventsUC: ListActiveEventsWithStatsUseCase,
    private readonly getParticipantsCountUC: GetParticipantsCountWithStatsUseCase,
    private readonly getBraceletsCountUC: GetBraceletsCountWithStatsUseCase,
    private readonly getRevenueUC: GetRevenueWithStatsUseCase,
    private readonly listActivationsUC: ListBraceletsActivationByYearUseCase,
    private readonly listInteractionsUC: ListInteractionTypesWithStatsUseCase,
    private readonly getNextEventUC: GetNextEventWithStatsUseCase,
    private readonly getStockUC: GetBraceletStockWithStatsUseCase,
    private readonly getEventPageStatsUC: GetEventPageStatsUseCase,
    private readonly getEventDetailStatsUC: GetEventDetailStatsUseCase
  ) {}

  listActiveEventsWithStats(): Promise<AnalyticsDomainModel.ActiveEventsStatsDto> {
    return this.listActiveEventsUC.execute()
  }
  getParticipantsCountWithStats(): Promise<AnalyticsDomainModel.CountWithRateDto> {
    return this.getParticipantsCountUC.execute()
  }
  getBraceletsCountWithStats(): Promise<AnalyticsDomainModel.CountWithRateDto> {
    return this.getBraceletsCountUC.execute()
  }
  getRevenueWithStats(): Promise<AnalyticsDomainModel.RevenueWithRateDto> {
    return this.getRevenueUC.execute()
  }
  listBraceletsActivationByYear(year?: number): Promise<AnalyticsDomainModel.ActivationsByYearDto> {
    return this.listActivationsUC.execute(year)
  }
  listInteractionTypesWithStats(): Promise<AnalyticsDomainModel.InteractionsStatsDto> {
    return this.listInteractionsUC.execute()
  }
  getNextEventWithStats(): Promise<AnalyticsDomainModel.NextEventStatsDto> {
    return this.getNextEventUC.execute()
  }
  getBraceletStockWithStats(): Promise<AnalyticsDomainModel.BraceletStockStatsDto> {
    return this.getStockUC.execute()
  }
  getEventPageStats(): Promise<AnalyticsDomainModel.EventPageStatsDto> {
    return this.getEventPageStatsUC.execute()
  }
  getEventDetailStats(eventId: string): Promise<AnalyticsDomainModel.EventDetailStatsDto> {
    return this.getEventDetailStatsUC.execute(eventId)
  }
}
