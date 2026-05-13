import { OrderStatus } from '../../../domain/constants/order.constant'
import { OrderEntity } from '../../../domain/entity/order.entity'
import { OrderCannotBeDeletedError, OrderNotFoundError } from '../../../domain/errors/order.error'
import { IOrderRepository } from '../../../domain/repository/order.repository.interface'
import { DeleteOrderUseCase } from './delete-order.use-case'

function makeOrder(status: OrderStatus): OrderEntity {
  return OrderEntity.fromProps({
    id: 'order-1',
    userId: 'user-1',
    items: [{ productId: 'p-1', productName: 'Bracelet', quantity: 1, unitPrice: 25 }],
    totalAmount: 25,
    status,
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

describe('DeleteOrderUseCase', () => {
  let repo: jest.Mocked<IOrderRepository>
  let useCase: DeleteOrderUseCase

  beforeEach(() => {
    repo = makeRepoMock()
    useCase = new DeleteOrderUseCase(repo)
  })

  it('soft-deletes a pending order', async () => {
    repo.findById.mockResolvedValue(makeOrder(OrderStatus.PENDING))

    await useCase.execute('order-1')

    expect(repo.delete).toHaveBeenCalledWith('order-1')
  })

  it('soft-deletes a cancelled order', async () => {
    repo.findById.mockResolvedValue(makeOrder(OrderStatus.CANCELLED))

    await useCase.execute('order-1')

    expect(repo.delete).toHaveBeenCalledWith('order-1')
  })

  it('throws OrderCannotBeDeletedError on a delivered order', async () => {
    repo.findById.mockResolvedValue(makeOrder(OrderStatus.DELIVERED))

    await expect(useCase.execute('order-1')).rejects.toBeInstanceOf(OrderCannotBeDeletedError)
    expect(repo.delete).not.toHaveBeenCalled()
  })

  it('throws OrderNotFoundError when order does not exist', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(OrderNotFoundError)
  })
})
