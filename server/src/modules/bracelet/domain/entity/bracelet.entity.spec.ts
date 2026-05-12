import { BraceletEntity } from './bracelet.entity'
import { BraceletStatus } from '../constants/bracelet-status.constant'
import { BraceletInvalidStatusError } from '../errors/bracelet.error'

describe('BraceletEntity', () => {
  describe('create()', () => {
    it('should create with default values when minimal props given', () => {
      const bracelet = BraceletEntity.create({})
      expect(bracelet.status).toBe(BraceletStatus.STOCK)
      expect(bracelet.userId).toBeNull()
      expect(bracelet.eventId).toBeNull()
      expect(bracelet.productId).toBeNull()
      expect(bracelet.orderId).toBeNull()
      expect(bracelet.activatedAt).toBeNull()
      expect(bracelet.deletedAt).toBeNull()
      expect(bracelet.nfcId).toBeDefined()
      expect(typeof bracelet.nfcId).toBe('string')
      expect(bracelet.nfcId.length).toBeGreaterThan(0)
    })

    it('should use provided nfcId when given', () => {
      const bracelet = BraceletEntity.create({ nfcId: 'my-custom-nfc-id' })
      expect(bracelet.nfcId).toBe('my-custom-nfc-id')
    })

    it('should generate unique nfcIds for each create call', () => {
      const b1 = BraceletEntity.create({})
      const b2 = BraceletEntity.create({})
      expect(b1.nfcId).not.toBe(b2.nfcId)
    })
  })

  describe('fromProps()', () => {
    it('should reconstitute entity from props without validation', () => {
      const now = new Date()
      const bracelet = BraceletEntity.fromProps({
        id: 'b-1',
        nfcId: 'nfc-1',
        status: BraceletStatus.ACTIVE,
        userId: 'user-1',
        eventId: 'event-1',
        productId: 'product-1',
        orderId: 'order-1',
        activatedAt: now,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      })
      expect(bracelet.id).toBe('b-1')
      expect(bracelet.nfcId).toBe('nfc-1')
      expect(bracelet.status).toBe(BraceletStatus.ACTIVE)
      expect(bracelet.userId).toBe('user-1')
    })
  })

  describe('assignTo()', () => {
    it('should transition from STOCK to PRE_ACTIVATED and set userId + eventId', () => {
      const bracelet = BraceletEntity.create({})
      expect(bracelet.status).toBe(BraceletStatus.STOCK)
      bracelet.assignTo('user-1', 'event-1')
      expect(bracelet.status).toBe(BraceletStatus.PRE_ACTIVATED)
      expect(bracelet.userId).toBe('user-1')
      expect(bracelet.eventId).toBe('event-1')
    })

    it('should throw BraceletInvalidStatusError if not STOCK', () => {
      const bracelet = BraceletEntity.fromProps({
        id: 'b-1',
        nfcId: 'nfc-1',
        status: BraceletStatus.ACTIVE,
        userId: 'user-1',
        eventId: 'event-1',
        productId: null,
        orderId: null,
        activatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })
      expect(() => bracelet.assignTo('user-2', 'event-2')).toThrow(BraceletInvalidStatusError)
    })
  })

  describe('activate()', () => {
    it('should transition from PRE_ACTIVATED to ACTIVE and set activatedAt', () => {
      const bracelet = BraceletEntity.fromProps({
        id: 'b-1',
        nfcId: 'nfc-1',
        status: BraceletStatus.PRE_ACTIVATED,
        userId: 'user-1',
        eventId: 'event-1',
        productId: null,
        orderId: null,
        activatedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })
      bracelet.activate()
      expect(bracelet.status).toBe(BraceletStatus.ACTIVE)
      expect(bracelet.activatedAt).not.toBeNull()
      expect(bracelet.activatedAt).toBeInstanceOf(Date)
    })

    it('should throw BraceletInvalidStatusError if not PRE_ACTIVATED', () => {
      const bracelet = BraceletEntity.create({})
      expect(bracelet.status).toBe(BraceletStatus.STOCK)
      expect(() => bracelet.activate()).toThrow(BraceletInvalidStatusError)
    })
  })

  describe('disable()', () => {
    it('should disable from STOCK', () => {
      const bracelet = BraceletEntity.create({})
      bracelet.disable()
      expect(bracelet.status).toBe(BraceletStatus.DISABLED)
    })

    it('should disable from PRE_ACTIVATED', () => {
      const bracelet = BraceletEntity.fromProps({
        id: 'b-1',
        nfcId: 'nfc-1',
        status: BraceletStatus.PRE_ACTIVATED,
        userId: 'user-1',
        eventId: 'event-1',
        productId: null,
        orderId: null,
        activatedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })
      bracelet.disable()
      expect(bracelet.status).toBe(BraceletStatus.DISABLED)
    })

    it('should disable from ACTIVE', () => {
      const bracelet = BraceletEntity.fromProps({
        id: 'b-1',
        nfcId: 'nfc-1',
        status: BraceletStatus.ACTIVE,
        userId: 'user-1',
        eventId: 'event-1',
        productId: null,
        orderId: null,
        activatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })
      bracelet.disable()
      expect(bracelet.status).toBe(BraceletStatus.DISABLED)
    })

    it('should throw BraceletInvalidStatusError if already DISABLED', () => {
      const bracelet = BraceletEntity.fromProps({
        id: 'b-1',
        nfcId: 'nfc-1',
        status: BraceletStatus.DISABLED,
        userId: null,
        eventId: null,
        productId: null,
        orderId: null,
        activatedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })
      expect(() => bracelet.disable()).toThrow(BraceletInvalidStatusError)
    })
  })

  describe('softDelete()', () => {
    it('should set deletedAt', () => {
      const bracelet = BraceletEntity.create({})
      expect(bracelet.deletedAt).toBeNull()
      bracelet.softDelete()
      expect(bracelet.deletedAt).not.toBeNull()
      expect(bracelet.isDeleted()).toBe(true)
    })

    it('should not overwrite deletedAt if already set', () => {
      const firstDeletion = new Date(Date.now() - 10000)
      const bracelet = BraceletEntity.fromProps({
        id: 'b-1',
        nfcId: 'nfc-1',
        status: BraceletStatus.STOCK,
        userId: null,
        eventId: null,
        productId: null,
        orderId: null,
        activatedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: firstDeletion,
      })
      bracelet.softDelete()
      expect(bracelet.deletedAt).toBe(firstDeletion)
    })
  })

  describe('toJSON()', () => {
    it('should serialize all props', () => {
      const now = new Date()
      const bracelet = BraceletEntity.fromProps({
        id: 'b-1',
        nfcId: 'nfc-1',
        status: BraceletStatus.STOCK,
        userId: null,
        eventId: null,
        productId: null,
        orderId: null,
        activatedAt: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      })
      const json = bracelet.toJSON()
      expect(json.id).toBe('b-1')
      expect(json.nfcId).toBe('nfc-1')
      expect(json.status).toBe(BraceletStatus.STOCK)
      expect(json.userId).toBeNull()
      expect(json.createdAt).toBe(now)
    })
  })

  describe('predicates', () => {
    it('isInStock() should be true for STOCK status', () => {
      const b = BraceletEntity.create({})
      expect(b.isInStock()).toBe(true)
      expect(b.isPreActivated()).toBe(false)
      expect(b.isActive()).toBe(false)
      expect(b.isDisabled()).toBe(false)
    })
  })
})
