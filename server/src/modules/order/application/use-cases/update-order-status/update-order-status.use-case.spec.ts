import { OrderStatus } from '../../../domain/constants/order.constant'
import { OrderEntity } from '../../../domain/entity/order.entity'
import { OrderNotFoundError } from '../../../domain/errors/order.error'
import { IOrderRepository } from '../../../domain/repository/order.repository.interface'
import { UpdateOrderStatusUseCase, OnOrderConfirmed } from './update-order-status.use-case'

const makePendingOrder = () =>
  OrderEntity.fromProps({
    id: 'order-1',
    userId: 'user-1',
    items: [{ productId: 'p-1', productName: 'Bracelet', quantity: 2, unitPrice: 25 }],
    totalAmount: 50,
    status: OrderStatus.PENDING,
    shippingAddress: '1 rue de la Paix, Paris',
    createdAt: new Date(),
    updatedAt: new Date(),
  })

describe('UpdateOrderStatusUseCase', () => {
  let mockRepository: jest.Mocked<IOrderRepository>

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      sumRevenueInRange: jest.fn(),
    }
  })

  it('should confirm a pending order and call onOrderConfirmed callback', async () => {
    const order = makePendingOrder()
    const confirmed = OrderEntity.fromProps({ ...order.toJSON(), status: OrderStatus.CONFIRMED })
    mockRepository.findById.mockResolvedValue(order)
    mockRepository.update.mockResolvedValue(confirmed)

    const onOrderConfirmed: OnOrderConfirmed = jest.fn().mockResolvedValue(undefined)
    const useCase = new UpdateOrderStatusUseCase(mockRepository, onOrderConfirmed)

    const result = await useCase.execute('order-1', OrderStatus.CONFIRMED)

    expect(result.status).toBe(OrderStatus.CONFIRMED)
    expect(onOrderConfirmed).toHaveBeenCalledTimes(1)
    expect(onOrderConfirmed).toHaveBeenCalledWith(confirmed)
  })

  it('should NOT call onOrderConfirmed when transitioning to a non-CONFIRMED status', async () => {
    const order = OrderEntity.fromProps({ ...makePendingOrder().toJSON(), status: OrderStatus.CONFIRMED })
    const shipped = OrderEntity.fromProps({ ...order.toJSON(), status: OrderStatus.SHIPPED })
    mockRepository.findById.mockResolvedValue(order)
    mockRepository.update.mockResolvedValue(shipped)

    const onOrderConfirmed: OnOrderConfirmed = jest.fn().mockResolvedValue(undefined)
    const useCase = new UpdateOrderStatusUseCase(mockRepository, onOrderConfirmed)

    const result = await useCase.execute('order-1', OrderStatus.SHIPPED)

    expect(result.status).toBe(OrderStatus.SHIPPED)
    expect(onOrderConfirmed).not.toHaveBeenCalled()
  })

  it('should not crash when onOrderConfirmed is undefined', async () => {
    const order = makePendingOrder()
    const confirmed = OrderEntity.fromProps({ ...order.toJSON(), status: OrderStatus.CONFIRMED })
    mockRepository.findById.mockResolvedValue(order)
    mockRepository.update.mockResolvedValue(confirmed)

    const useCase = new UpdateOrderStatusUseCase(mockRepository)

    await expect(useCase.execute('order-1', OrderStatus.CONFIRMED)).resolves.toBeDefined()
  })

  it('should return the saved order even if onOrderConfirmed callback throws', async () => {
    const order = makePendingOrder()
    const confirmed = OrderEntity.fromProps({ ...order.toJSON(), status: OrderStatus.CONFIRMED })
    mockRepository.findById.mockResolvedValue(order)
    mockRepository.update.mockResolvedValue(confirmed)

    const onOrderConfirmed: OnOrderConfirmed = jest.fn().mockRejectedValue(new Error('bracelet creation failed'))
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)

    const useCase = new UpdateOrderStatusUseCase(mockRepository, onOrderConfirmed)

    const result = await useCase.execute('order-1', OrderStatus.CONFIRMED)

    expect(result.status).toBe(OrderStatus.CONFIRMED)
    expect(consoleSpy).toHaveBeenCalledWith(
      '[order→bracelet bridge] failed to create bracelets from order',
      'order-1',
      expect.any(Error)
    )

    consoleSpy.mockRestore()
  })

  it('should throw OrderNotFoundError when order does not exist', async () => {
    mockRepository.findById.mockResolvedValue(null)

    const useCase = new UpdateOrderStatusUseCase(mockRepository)

    await expect(useCase.execute('non-existent', OrderStatus.CONFIRMED)).rejects.toThrow(OrderNotFoundError)
  })
})
