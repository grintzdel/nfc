import { IOrderRepository } from '../../../domain/repository/order.repository.interface'
import { OrderEntity, OrderItem } from '../../../domain/entity/order.entity'
import { ICartItemRepository } from '@modules/cart/domain/repository/cart-item.repository.interface'
import { IProductRepository } from '@modules/product/domain/repository/product.repository.interface'
import { AppError } from '@shared/errors/app.error'

interface CreateOrderInput { userId: string; shippingAddress: string }

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly cartItemRepository: ICartItemRepository,
    private readonly productRepository: IProductRepository
  ) {}

  async execute(input: CreateOrderInput): Promise<OrderEntity> {
    const cartItems = await this.cartItemRepository.findByUserId(input.userId)
    if (cartItems.length === 0) throw new AppError(400, 'Cart is empty')

    const orderItems: OrderItem[] = []
    for (const cartItem of cartItems) {
      const product = await this.productRepository.findById(cartItem.productId)
      if (!product) throw new AppError(400, `Product ${cartItem.productId} not found`)
      orderItems.push({
        productId: product.id, productName: product.name,
        quantity: cartItem.quantity, unitPrice: product.price,
      })
    }

    const order = OrderEntity.create({ userId: input.userId, items: orderItems, shippingAddress: input.shippingAddress })
    const saved = await this.orderRepository.create(order)
    await this.cartItemRepository.deleteByUserId(input.userId)
    return saved
  }
}
