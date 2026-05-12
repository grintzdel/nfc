import { CreateOrderUseCase } from '../use-cases/create-order/create-order.use-case'
import { GetMyOrdersUseCase } from '../use-cases/get-my-orders/get-my-orders.use-case'
import { GetOrderByIdUseCase } from '../use-cases/get-order-by-id/get-order-by-id.use-case'
import { GetAllOrdersUseCase } from '../use-cases/get-all-orders/get-all-orders.use-case'
import { UpdateOrderStatusUseCase } from '../use-cases/update-order-status/update-order-status.use-case'
import { OrderStatus } from '../../domain/constants/order.constant'

export class OrderService {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getMyOrdersUseCase: GetMyOrdersUseCase,
    private readonly getOrderByIdUseCase: GetOrderByIdUseCase,
    private readonly getAllOrdersUseCase: GetAllOrdersUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase
  ) {}

  create(input: { userId: string; shippingAddress: string }) { return this.createOrderUseCase.execute(input) }
  getMyOrders(userId: string) { return this.getMyOrdersUseCase.execute(userId) }
  getOrderById(id: string) { return this.getOrderByIdUseCase.execute(id) }
  getAllOrders() { return this.getAllOrdersUseCase.execute() }
  updateStatus(id: string, status: OrderStatus) { return this.updateOrderStatusUseCase.execute(id, status) }
}
