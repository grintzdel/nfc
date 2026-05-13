import cors from 'cors'
import express, { type Express } from 'express'

import { createAnalyticsModule } from './modules/analytics/analytics.module'
import { createAuthModule } from './modules/auth/auth.module'
import { createBraceletModule } from './modules/bracelet/bracelet.module'
import { createCartModule } from './modules/cart/cart.module'
import { createCategoryModule } from './modules/category/category.module'
import { createCheckInModule } from './modules/check-in/check-in.module'
import { createEventModule } from './modules/event/event.module'
import { createMarketingModule } from './modules/marketing/marketing.module'
import { createOrderModule } from './modules/order/order.module'
import { createParticipantModule } from './modules/participant/participant.module'
import { createProductModule } from './modules/product/product.module'
import { createSupplyOrderModule } from './modules/supply-order/supply-order.module'
import { createTeamModule } from './modules/team/team.module'
import { createUserModule } from './modules/user/user.module'
import { createNfcRoutes } from './routes/nfc.routes'
import { errorHandlerMiddleware } from './shared/middlewares/error-handler.middleware'
import { loggerMiddleware } from './shared/middlewares/logger.middleware'

export function createApp(): Express {
  const app: Express = express()

  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )
  app.use(express.json())
  app.use(loggerMiddleware)

  const { router: authRouter, jwtService, userRepository } = createAuthModule()
  const {
    router: categoryRouter,
    categoryRepository,
    attachDeps: attachCategoryDeps,
  } = createCategoryModule(jwtService)
  const { router: productRouter, productRepository } = createProductModule(jwtService, categoryRepository)
  attachCategoryDeps({ productRepository })
  const { router: cartRouter, cartItemRepository } = createCartModule(jwtService)
  const { router: supplyOrderRouter, supplyOrderRepository } = createSupplyOrderModule(jwtService)
  const {
    router: braceletRouter,
    braceletRepository,
    createBraceletFromOrderUseCase,
    activateBraceletUseCase,
    attachDeps: attachBraceletDeps,
  } = createBraceletModule(jwtService, productRepository)
  const { router: eventRouter, eventRepository, attachDeps: attachEventDeps } = createEventModule(jwtService)
  const { router: participantRouter, participantRepository } = createParticipantModule(
    jwtService,
    eventRepository,
    braceletRepository
  )
  attachBraceletDeps({ participantRepository })
  const { router: checkInRouter, checkInRepository } = createCheckInModule(
    jwtService,
    braceletRepository,
    participantRepository,
    activateBraceletUseCase
  )
  attachEventDeps({ braceletRepository, checkInRepository, participantRepository })
  const { router: teamRouter } = createTeamModule(jwtService, userRepository, eventRepository)
  const { router: orderRouter, orderRepository } = createOrderModule(
    jwtService,
    cartItemRepository,
    productRepository,
    async (order) => {
      await createBraceletFromOrderUseCase.execute(order)
    }
  )
  const analyticsRouter = createAnalyticsModule(jwtService, {
    eventRepository,
    braceletRepository,
    participantRepository,
    orderRepository,
    checkInRepository,
    supplyOrderRepository,
  })
  const { router: marketingRouter } = createMarketingModule()
  const nfcRouter = createNfcRoutes(braceletRepository, participantRepository, eventRepository)

  app.use('/api/auth', authRouter)
  app.use('/api/users', createUserModule(userRepository, jwtService))
  app.use('/api/categories', categoryRouter)
  app.use('/api/products', productRouter)
  app.use('/api/cart', cartRouter)
  app.use('/api/orders', orderRouter)
  app.use('/api/events', eventRouter)
  app.use('/api/bracelets', braceletRouter)
  app.use('/api/participants', participantRouter)
  app.use('/api/check-ins', checkInRouter)
  app.use('/api/teams', teamRouter)
  app.use('/api/supply-orders', supplyOrderRouter)
  app.use('/api/admin-stats', analyticsRouter)
  app.use('/api/marketing', marketingRouter)
  app.use('/api/nfc', nfcRouter)

  app.use(errorHandlerMiddleware)

  return app
}
