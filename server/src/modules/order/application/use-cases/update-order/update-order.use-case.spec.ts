import { OrderStatus } from '../../../domain/constants/order.constant'
import { OrderEntity } from '../../../domain/entity/order.entity'
import { OrderNotFoundError } from '../../../domain/errors/order.error'
import { IOrderRepository } from '../../../domain/repository/order.repository.interface'
import { UpdateOrderUseCase } from './update-order.use-case'

function makeOrder(): OrderEntity {
  return OrderEntity.fromProps({
    id: 'order-1',
    userId: 'user-1',
    items: [{ productId: 'p-1', productName: 'Bracelet', quantity: 1, unitPrice: 25 }],
    totalAmount: 25,
    status: OrderStatus.PENDING,
    shippingAddress: '1 rue de la Paix, Paris',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  })
}

function makeRepoMock(): jest.Mocked<IOrderRepository> {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    sumRevenueInRange: jest.fn(),
  }
}

describe('UpdateOrderUseCase', () => {
  let repo: jest.Mocked<IOrderRepository>
  let useCase: UpdateOrderUseCase

  beforeEach(() => {
    repo = makeRepoMock()
    useCase = new UpdateOrderUseCase(repo)
  })

  it('updates the shipping address', async () => {
    const order = makeOrder()
    repo.findById.mockResolvedValue(order)
    repo.update.mockImplementation(async (o) => o)

    const result = await useCase.execute('order-1', { shippingAddress: '42 avenue Pulse' })

    expect(result.shippingAddress).toBe('42 avenue Pulse')
    expect(repo.update).toHaveBeenCalledWith(order)
  })

  it('throws OrderNotFoundError when order does not exist', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(useCase.execute('missing', { shippingAddress: 'x' })).rejects.toBeInstanceOf(OrderNotFoundError)
  })

  it('throws when shipping address is empty string', async () => {
    repo.findById.mockResolvedValue(makeOrder())

    await expect(useCase.execute('order-1', { shippingAddress: '   ' })).rejects.toThrow(
      'Shipping address cannot be empty'
    )
  })
})
