import { BraceletStatus } from '../domain/constants/bracelet-status.constant'
import { BraceletEntity, BraceletEntityProps } from '../domain/entity/bracelet.entity'

let counter = 0

export function createBraceletPropsFixture(overrides: Partial<BraceletEntityProps> = {}): BraceletEntityProps {
  counter++
  const now = new Date()
  return {
    id: `bracelet-${counter}`,
    nfcId: `nfc-${counter}`,
    status: BraceletStatus.STOCK,
    userId: null,
    eventId: null,
    productId: null,
    orderId: null,
    activatedAt: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  }
}

export function createBraceletFixture(overrides: Partial<BraceletEntityProps> = {}): BraceletEntity {
  return BraceletEntity.fromProps(createBraceletPropsFixture(overrides))
}
