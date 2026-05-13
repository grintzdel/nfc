import { JwtServiceSecurity } from '@modules/auth/application/services/security/jwt.service-security'
import { createAuthMiddleware, createAdminMiddleware } from '@shared/middlewares/auth.middleware'
import { Router } from 'express'

import { SupplyOrderService } from './application/services/supply-order.service'
import { CancelSupplyOrderUseCase } from './application/use-cases/cancel-supply-order/cancel-supply-order.use-case'
import { CreateSupplyOrderUseCase } from './application/use-cases/create-supply-order/create-supply-order.use-case'
import { GetAllSupplyOrdersUseCase } from './application/use-cases/get-all-supply-orders/get-all-supply-orders.use-case'
import { GetPendingSupplyOrderUseCase } from './application/use-cases/get-pending-supply-order/get-pending-supply-order.use-case'
import { GetSupplyOrderByIdUseCase } from './application/use-cases/get-supply-order-by-id/get-supply-order-by-id.use-case'
import { MarkSupplyOrderReceivedUseCase } from './application/use-cases/mark-supply-order-received/mark-supply-order-received.use-case'
import { ISupplyOrderRepository } from './domain/repository/supply-order.repository.interface'
import { SupplyOrderRepositoryMongooseMongo } from './infrastructure/repository/supply-order.repository.mongoose-mongo'
import { SupplyOrderController } from './presentation/controllers/supply-order.controller'

export function createSupplyOrderModule(jwtService: JwtServiceSecurity): {
  router: Router
  supplyOrderRepository: ISupplyOrderRepository
} {
  const supplyOrderRepository = new SupplyOrderRepositoryMongooseMongo()
  const createUC = new CreateSupplyOrderUseCase(supplyOrderRepository)
  const getAllUC = new GetAllSupplyOrdersUseCase(supplyOrderRepository)
  const getByIdUC = new GetSupplyOrderByIdUseCase(supplyOrderRepository)
  const getPendingUC = new GetPendingSupplyOrderUseCase(supplyOrderRepository)
  const markReceivedUC = new MarkSupplyOrderReceivedUseCase(supplyOrderRepository)
  const cancelUC = new CancelSupplyOrderUseCase(supplyOrderRepository)
  const service = new SupplyOrderService(createUC, getAllUC, getByIdUC, getPendingUC, markReceivedUC, cancelUC)
  const controller = new SupplyOrderController(service)

  const auth = createAuthMiddleware(jwtService)
  const admin = createAdminMiddleware()

  const router = Router()
  router.post('/', auth, admin, (req, res, next) => controller.create(req, res, next))
  router.get('/', auth, admin, (req, res, next) => controller.getAll(req, res, next))
  router.get('/:id', auth, admin, (req, res, next) => controller.getById(req, res, next))
  router.post('/:id/receive', auth, admin, (req, res, next) => controller.markReceived(req, res, next))
  router.post('/:id/cancel', auth, admin, (req, res, next) => controller.cancel(req, res, next))

  return { router, supplyOrderRepository }
}
