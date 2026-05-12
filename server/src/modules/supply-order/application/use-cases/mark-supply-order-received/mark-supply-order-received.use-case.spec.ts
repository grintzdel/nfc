import { MarkSupplyOrderReceivedUseCase } from './mark-supply-order-received.use-case'
import { SupplyOrderRepositoryMock } from '../../../__tests__/supply-order.repository.mock'
import { createSupplyOrderFixture } from '../../../__tests__/supply-order.factory'
import { SupplyOrderStatus } from '../../../domain/constants/supply-order-status.constant'
import { SupplyOrderNotFoundError, SupplyOrderInvalidStatusError } from '../../../domain/errors/supply-order.error'

describe('MarkSupplyOrderReceivedUseCase', () => {
  it('marks a pending supply order as received', async () => {
    const repo = new SupplyOrderRepositoryMock()
    const order = createSupplyOrderFixture({ status: SupplyOrderStatus.PENDING })
    repo.findById_result = order
    const useCase = new MarkSupplyOrderReceivedUseCase(repo)
    const result = await useCase.execute(order.id)
    expect(result.status).toBe(SupplyOrderStatus.RECEIVED)
    expect(result.receivedAt).not.toBeNull()
    expect(repo.update_calledWith).toBe(order)
  })

  it('throws SupplyOrderNotFoundError if supply order does not exist', async () => {
    const repo = new SupplyOrderRepositoryMock()
    repo.findById_result = null
    const useCase = new MarkSupplyOrderReceivedUseCase(repo)
    await expect(useCase.execute('non-existent-id')).rejects.toThrow(SupplyOrderNotFoundError)
  })

  it('propagates SupplyOrderInvalidStatusError if already RECEIVED', async () => {
    const repo = new SupplyOrderRepositoryMock()
    const order = createSupplyOrderFixture({ status: SupplyOrderStatus.PENDING })
    order.markReceived()
    repo.findById_result = order
    const useCase = new MarkSupplyOrderReceivedUseCase(repo)
    await expect(useCase.execute(order.id)).rejects.toThrow(SupplyOrderInvalidStatusError)
  })
})
