import { JwtServiceSecurity } from '@modules/auth/application/services/security/jwt.service-security'
import { IBraceletRepository } from '@modules/bracelet/domain/repository/bracelet.repository.interface'
import { ICheckInRepository } from '@modules/check-in/domain/repository/check-in.repository.interface'
import { IEventRepository } from '@modules/event/domain/repository/event.repository.interface'
import { IOrderRepository } from '@modules/order/domain/repository/order.repository.interface'
import { IParticipantRepository } from '@modules/participant/domain/repository/participant.repository.interface'
import { ISupplyOrderRepository } from '@modules/supply-order/domain/repository/supply-order.repository.interface'
import { createAuthMiddleware, createAdminMiddleware } from '@shared/middlewares/auth.middleware'
import { Router } from 'express'

import { AnalyticsService } from './application/services/analytics.service'
import { GetBraceletStockWithStatsUseCase } from './application/use-cases/get-bracelet-stock-with-stats/get-bracelet-stock-with-stats.use-case'
import { GetBraceletsCountWithStatsUseCase } from './application/use-cases/get-bracelets-count-with-stats/get-bracelets-count-with-stats.use-case'
import { GetEventDetailStatsUseCase } from './application/use-cases/get-event-detail-stats/get-event-detail-stats.use-case'
import { GetEventPageStatsUseCase } from './application/use-cases/get-event-page-stats/get-event-page-stats.use-case'
import { GetNextEventWithStatsUseCase } from './application/use-cases/get-next-event-with-stats/get-next-event-with-stats.use-case'
import { GetParticipantsCountWithStatsUseCase } from './application/use-cases/get-participants-count-with-stats/get-participants-count-with-stats.use-case'
import { GetRevenueWithStatsUseCase } from './application/use-cases/get-revenue-with-stats/get-revenue-with-stats.use-case'
import { ListActiveEventsWithStatsUseCase } from './application/use-cases/list-active-events-with-stats/list-active-events-with-stats.use-case'
import { ListBraceletsActivationByYearUseCase } from './application/use-cases/list-bracelets-activation-by-year/list-bracelets-activation-by-year.use-case'
import { ListInteractionTypesWithStatsUseCase } from './application/use-cases/list-interaction-types-with-stats/list-interaction-types-with-stats.use-case'
import { AnalyticsController } from './presentation/controllers/analytics.controller'

export interface AnalyticsDeps {
  eventRepository: IEventRepository
  braceletRepository: IBraceletRepository
  participantRepository: IParticipantRepository
  orderRepository: IOrderRepository
  checkInRepository: ICheckInRepository
  supplyOrderRepository: ISupplyOrderRepository
}

export function createAnalyticsModule(jwtService: JwtServiceSecurity, deps: AnalyticsDeps): Router {
  const listActiveUC = new ListActiveEventsWithStatsUseCase(deps.eventRepository)
  const getParticipantsUC = new GetParticipantsCountWithStatsUseCase(deps.participantRepository)
  const getBraceletsUC = new GetBraceletsCountWithStatsUseCase(deps.braceletRepository)
  const getRevenueUC = new GetRevenueWithStatsUseCase(deps.orderRepository)
  const listActivationsUC = new ListBraceletsActivationByYearUseCase(deps.braceletRepository)
  const listInteractionsUC = new ListInteractionTypesWithStatsUseCase(deps.checkInRepository)
  const getNextEventUC = new GetNextEventWithStatsUseCase(deps.eventRepository, deps.braceletRepository)
  const getStockUC = new GetBraceletStockWithStatsUseCase(deps.braceletRepository, deps.supplyOrderRepository)
  const getEventPageStatsUC = new GetEventPageStatsUseCase(deps.eventRepository)
  const getEventDetailStatsUC = new GetEventDetailStatsUseCase(
    deps.eventRepository,
    deps.participantRepository,
    deps.braceletRepository,
    deps.checkInRepository
  )

  const service = new AnalyticsService(
    listActiveUC,
    getParticipantsUC,
    getBraceletsUC,
    getRevenueUC,
    listActivationsUC,
    listInteractionsUC,
    getNextEventUC,
    getStockUC,
    getEventPageStatsUC,
    getEventDetailStatsUC
  )
  const controller = new AnalyticsController(service)

  const auth = createAuthMiddleware(jwtService)
  const admin = createAdminMiddleware()

  const router = Router()
  router.get('/events/active', auth, admin, (req, res, next) => controller.listActiveEvents(req, res, next))
  router.get('/events/next', auth, admin, (req, res, next) => controller.getNextEvent(req, res, next))
  router.get('/participants/count', auth, admin, (req, res, next) => controller.getParticipantsCount(req, res, next))
  router.get('/bracelets/count', auth, admin, (req, res, next) => controller.getBraceletsCount(req, res, next))
  router.get('/bracelets/stock', auth, admin, (req, res, next) => controller.getStock(req, res, next))
  router.get('/bracelets/activations', auth, admin, (req, res, next) => controller.listActivations(req, res, next))
  router.get('/revenue', auth, admin, (req, res, next) => controller.getRevenue(req, res, next))
  router.get('/interactions', auth, admin, (req, res, next) => controller.listInteractions(req, res, next))
  router.get('/events/page-stats', auth, admin, (req, res, next) => controller.getEventPageStats(req, res, next))
  router.get('/events/:eventId', auth, admin, (req, res, next) => controller.getEventDetailStats(req, res, next))
  return router
}
