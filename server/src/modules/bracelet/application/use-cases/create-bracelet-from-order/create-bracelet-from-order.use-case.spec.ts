import { CreateBraceletFromOrderUseCase } from './create-bracelet-from-order.use-case'
import { BraceletRepositoryMock } from '../../../__tests__/bracelet.repository.mock'
import { OrderEntity } from '@modules/order/domain/entity/order.entity'
import { BraceletStatus } from '../../../domain/constants/bracelet-status.constant'
import { OrderStatus } from '@modules/order/domain/constants/order.constant'

describe('CreateBraceletFromOrderUseCase', () => {
  let useCase: CreateBraceletFromOrderUseCase
  let mockRepository: BraceletRepositoryMock

  beforeEach(() => {
    mockRepository = new BraceletRepositoryMock()
    useCase = new CreateBraceletFromOrderUseCase(mockRepository)
  })

  it('should create one bracelet per item quantity and attach order metadata', async () => {
    const order = OrderEntity.fromProps({
      id: 'order-1',
      userId: 'user-1',
      items: [
        { productId: 'p1', productName: 'Pass A', quantity: 3, unitPrice: 50 },
        { productId: 'p2', productName: 'Pass B', quantity: 1, unitPrice: 100 },
      ],
      totalAmount: 250,
      status: OrderStatus.CONFIRMED,
      shippingAddress: '1 Rue de Paris',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const bracelets = await useCase.execute(order)

    expect(bracelets).toHaveLength(4)
    expect(mockRepository.create_calls).toHaveLength(4)

    for (const b of bracelets) {
      expect(b.orderId).toBe('order-1')
      expect(b.userId).toBe('user-1')
      expect(b.status).toBe(BraceletStatus.STOCK)
    }

    const p1Bracelets = bracelets.filter((b) => b.productId === 'p1')
    const p2Bracelets = bracelets.filter((b) => b.productId === 'p2')
    expect(p1Bracelets).toHaveLength(3)
    expect(p2Bracelets).toHaveLength(1)
  })

  it('should generate distinct nfcIds for each bracelet', async () => {
    const order = OrderEntity.fromProps({
      id: 'order-2',
      userId: 'user-2',
      items: [{ productId: 'p1', productName: 'Pass', quantity: 3, unitPrice: 50 }],
      totalAmount: 150,
      status: OrderStatus.CONFIRMED,
      shippingAddress: '2 Rue de Lyon',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const bracelets = await useCase.execute(order)
    const nfcIds = bracelets.map((b) => b.nfcId)
    const uniqueIds = new Set(nfcIds)
    expect(uniqueIds.size).toBe(3)
  })
})
