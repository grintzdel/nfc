import { SupplyOrderEntity, SupplyOrderEntityProps } from '../domain/entity/supply-order.entity'
import { SupplyOrderStatus } from '../domain/constants/supply-order-status.constant'

let counter = 0

export function createSupplyOrderPropsFixture(overrides: Partial<SupplyOrderEntityProps> = {}): SupplyOrderEntityProps {
  counter++
  const now = new Date()
  return {
    id: `supply-order-${counter}`,
    units: 100,
    orderedAt: now,
    estimatedDeliveryDate: new Date(now.getTime() + 7 * 24 * 3600 * 1000),
    status: SupplyOrderStatus.PENDING,
    receivedAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

export function createSupplyOrderFixture(overrides: Partial<SupplyOrderEntityProps> = {}): SupplyOrderEntity {
  return SupplyOrderEntity.fromProps(createSupplyOrderPropsFixture(overrides))
}
