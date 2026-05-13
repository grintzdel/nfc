import { SupplyOrderStatus } from '../constants/supply-order-status.constant'
import { SupplyOrderInvalidStatusError } from '../errors/supply-order.error'
import { SupplyOrderEntity } from './supply-order.entity'

describe('SupplyOrderEntity', () => {
  const validProps = {
    units: 100,
    estimatedDeliveryDate: new Date('2026-05-01T00:00:00Z'),
  }

  it('should create a supply order with defaults (status PENDING, receivedAt null)', () => {
    const order = SupplyOrderEntity.create(validProps)
    expect(order.status).toBe(SupplyOrderStatus.PENDING)
    expect(order.receivedAt).toBeNull()
    expect(order.units).toBe(100)
  })

  it('should default orderedAt to now if not provided', () => {
    const before = new Date()
    const order = SupplyOrderEntity.create(validProps)
    const after = new Date()
    expect(order.orderedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(order.orderedAt.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('should throw when units is 0', () => {
    expect(() => SupplyOrderEntity.create({ ...validProps, units: 0 })).toThrow('units must be positive')
  })

  it('should throw when units is negative', () => {
    expect(() => SupplyOrderEntity.create({ ...validProps, units: -5 })).toThrow('units must be positive')
  })

  it('should throw when estimatedDeliveryDate is missing', () => {
    expect(() => SupplyOrderEntity.create({ units: 50 })).toThrow('estimatedDeliveryDate is required')
  })

  it('should markReceived (PENDING → RECEIVED) and set receivedAt', () => {
    const order = SupplyOrderEntity.create(validProps)
    const before = new Date()
    order.markReceived()
    const after = new Date()
    expect(order.status).toBe(SupplyOrderStatus.RECEIVED)
    expect(order.receivedAt).not.toBeNull()
    expect(order.receivedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(order.receivedAt!.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('should throw SupplyOrderInvalidStatusError when markReceived on non-PENDING (RECEIVED)', () => {
    const order = SupplyOrderEntity.create(validProps)
    order.markReceived()
    expect(() => order.markReceived()).toThrow(SupplyOrderInvalidStatusError)
  })

  it('should throw SupplyOrderInvalidStatusError when markReceived on non-PENDING (CANCELLED)', () => {
    const order = SupplyOrderEntity.create(validProps)
    order.cancel()
    expect(() => order.markReceived()).toThrow(SupplyOrderInvalidStatusError)
  })

  it('should cancel (PENDING → CANCELLED)', () => {
    const order = SupplyOrderEntity.create(validProps)
    order.cancel()
    expect(order.status).toBe(SupplyOrderStatus.CANCELLED)
    expect(order.isCancelled()).toBe(true)
  })

  it('should throw SupplyOrderInvalidStatusError when cancel on non-PENDING (RECEIVED)', () => {
    const order = SupplyOrderEntity.create(validProps)
    order.markReceived()
    expect(() => order.cancel()).toThrow(SupplyOrderInvalidStatusError)
  })

  it('should throw SupplyOrderInvalidStatusError when cancel on non-PENDING (CANCELLED)', () => {
    const order = SupplyOrderEntity.create(validProps)
    order.cancel()
    expect(() => order.cancel()).toThrow(SupplyOrderInvalidStatusError)
  })

  it('should serialize via toJSON', () => {
    const order = SupplyOrderEntity.create(validProps)
    const json = order.toJSON()
    expect(json.units).toBe(100)
    expect(json.status).toBe(SupplyOrderStatus.PENDING)
    expect(json.receivedAt).toBeNull()
    expect(json.estimatedDeliveryDate).toEqual(validProps.estimatedDeliveryDate)
  })
})
