import { JwtServiceSecurity } from '@modules/auth/application/services/security/jwt.service-security'
import { ICartItemRepository } from '@modules/cart/domain/repository/cart-item.repository.interface'
import { IProductRepository } from '@modules/product/domain/repository/product.repository.interface'
import { createAuthMiddleware, createAdminMiddleware } from '@shared/middlewares/auth.middleware'
import { Router } from 'express'

import { OrderService } from './application/services/order.service'
import { CreateOrderUseCase } from './application/use-cases/create-order/create-order.use-case'
import { GetAllOrdersUseCase } from './application/use-cases/get-all-orders/get-all-orders.use-case'
import { GetMyOrdersUseCase } from './application/use-cases/get-my-orders/get-my-orders.use-case'
import { GetOrderByIdUseCase } from './application/use-cases/get-order-by-id/get-order-by-id.use-case'
import {
  OnOrderConfirmed,
  UpdateOrderStatusUseCase,
} from './application/use-cases/update-order-status/update-order-status.use-case'
import { IOrderRepository } from './domain/repository/order.repository.interface'
import { OrderRepositoryMongooseMongo } from './infrastructure/repository/order.repository.mongoose-mongo'
import { OrderController } from './presentation/controllers/order.controller'

export function createOrderModule(
  jwtService: JwtServiceSecurity,
  cartItemRepository: ICartItemRepository,
  productRepository: IProductRepository,
  onOrderConfirmed?: OnOrderConfirmed
): { router: Router; orderRepository: IOrderRepository } {
  const orderRepository = new OrderRepositoryMongooseMongo()
  const createOrderUseCase = new CreateOrderUseCase(orderRepository, cartItemRepository, productRepository)
  const getMyOrdersUseCase = new GetMyOrdersUseCase(orderRepository)
  const getOrderByIdUseCase = new GetOrderByIdUseCase(orderRepository)
  const getAllOrdersUseCase = new GetAllOrdersUseCase(orderRepository)
  const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepository, onOrderConfirmed)
  const orderService = new OrderService(
    createOrderUseCase,
    getMyOrdersUseCase,
    getOrderByIdUseCase,
    getAllOrdersUseCase,
    updateOrderStatusUseCase
  )
  const controller = new OrderController(orderService)

  const authMiddleware = createAuthMiddleware(jwtService)
  const adminMiddleware = createAdminMiddleware()

  const router = Router()
  router.post('/', authMiddleware, (req, res, next) => controller.create(req, res, next))
  router.get('/', authMiddleware, (req, res, next) => controller.getMyOrders(req, res, next))
  router.get('/admin', authMiddleware, adminMiddleware, (_req, res, next) => controller.getAllOrders(_req, res, next))
  router.get('/:id', authMiddleware, (req, res, next) => controller.getOrderById(req, res, next))
  router.patch('/:id/status', authMiddleware, adminMiddleware, (req, res, next) =>
    controller.updateStatus(req, res, next)
  )

  return { router, orderRepository }
}
