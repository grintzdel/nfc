import express, { type Express } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDatabase } from './config/database'
import { loggerMiddleware } from './shared/middlewares/logger.middleware'
import { errorHandlerMiddleware } from './shared/middlewares/error-handler.middleware'
import { createAuthModule } from './modules/auth/auth.module'
import { createUserModule } from './modules/user/user.module'
import { createProductModule } from './modules/product/product.module'
import { createCartModule } from './modules/cart/cart.module'
import { createOrderModule } from './modules/order/order.module'
import { createEventModule } from './modules/event/event.module'
import { createSupplyOrderModule } from './modules/supply-order/supply-order.module'
import { createBraceletModule } from './modules/bracelet/bracelet.module'
import { createParticipantModule } from './modules/participant/participant.module'
import { createCheckInModule } from './modules/check-in/check-in.module'
import { createTeamModule } from './modules/team/team.module'
import { createAnalyticsModule } from './modules/analytics/analytics.module'
import { createNfcRoutes } from './routes/nfc.routes'

dotenv.config()

const app: Express = express()
const PORT = process.env.PORT || 3001

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)
app.use(express.json())
app.use(loggerMiddleware)

const { router: authRouter, jwtService, userRepository } = createAuthModule()
const { router: productRouter, productRepository } = createProductModule(jwtService)
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
  braceletRepository,
)
attachBraceletDeps({ participantRepository })
const { router: checkInRouter, checkInRepository } = createCheckInModule(
  jwtService,
  braceletRepository,
  participantRepository,
  activateBraceletUseCase,
)
attachEventDeps({ braceletRepository, checkInRepository, participantRepository })
const { router: teamRouter } = createTeamModule(jwtService, userRepository, eventRepository)
const { router: orderRouter, orderRepository } = createOrderModule(
  jwtService,
  cartItemRepository,
  productRepository,
  async (order) => {
    await createBraceletFromOrderUseCase.execute(order)
  },
)
const analyticsRouter = createAnalyticsModule(jwtService, {
  eventRepository,
  braceletRepository,
  participantRepository,
  orderRepository,
  checkInRepository,
  supplyOrderRepository,
})
const nfcRouter = createNfcRoutes(braceletRepository, participantRepository, eventRepository)

app.use('/api/auth', authRouter)
app.use('/api/users', createUserModule(userRepository, jwtService))
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
app.use('/api/nfc', nfcRouter)

app.use(errorHandlerMiddleware)

async function bootstrap(): Promise<void> {
  await connectDatabase(process.env.MONGODB_URI!)
  app.listen(PORT, () => {
    console.log(`PULSE API running on port ${PORT}`)
  })
}

bootstrap().catch(console.error)

export { app }
