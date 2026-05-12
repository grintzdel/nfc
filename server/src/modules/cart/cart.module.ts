import { Router } from 'express'
import { JwtServiceSecurity } from '@modules/auth/application/services/security/jwt.service-security'
import { createAuthMiddleware } from '@shared/middlewares/auth.middleware'
import { CartItemRepositoryMongooseMongo } from './infrastructure/repository/cart-item.repository.mongoose-mongo'
import { AddToCartUseCase } from './application/use-cases/add-to-cart/add-to-cart.use-case'
import { GetCartUseCase } from './application/use-cases/get-cart/get-cart.use-case'
import { UpdateCartItemUseCase } from './application/use-cases/update-cart-item/update-cart-item.use-case'
import { RemoveCartItemUseCase } from './application/use-cases/remove-cart-item/remove-cart-item.use-case'
import { ClearCartUseCase } from './application/use-cases/clear-cart/clear-cart.use-case'
import { CartService } from './application/services/cart.service'
import { CartController } from './presentation/controllers/cart.controller'

export function createCartModule(jwtService: JwtServiceSecurity) {
  const repository = new CartItemRepositoryMongooseMongo()

  const addToCartUseCase = new AddToCartUseCase(repository)
  const getCartUseCase = new GetCartUseCase(repository)
  const updateCartItemUseCase = new UpdateCartItemUseCase(repository)
  const removeCartItemUseCase = new RemoveCartItemUseCase(repository)
  const clearCartUseCase = new ClearCartUseCase(repository)

  const service = new CartService(
    addToCartUseCase,
    getCartUseCase,
    updateCartItemUseCase,
    removeCartItemUseCase,
    clearCartUseCase
  )

  const controller = new CartController(service)

  const authMiddleware = createAuthMiddleware(jwtService)
  const router = Router()

  router.use(authMiddleware)
  router.get('/', (req, res, next) => controller.getCart(req, res, next))
  router.post('/items', (req, res, next) => controller.addToCart(req, res, next))
  router.patch('/items/:id', (req, res, next) => controller.updateCartItem(req, res, next))
  router.delete('/items/:id', (req, res, next) => controller.removeCartItem(req, res, next))
  router.delete('/', (req, res, next) => controller.clearCart(req, res, next))

  return { router, cartItemRepository: repository }
}
