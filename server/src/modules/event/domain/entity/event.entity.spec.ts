import { EventStatus } from '../constants/event-status.constant'
import { EventEntity } from './event.entity'

describe('EventEntity', () => {
  const validProps = {
    name: 'Festival Jazz 2026',
    description: 'Jazz festival in Toulouse',
    venueName: 'Zenith',
    venueAddress: '1 rue du Zenith, Toulouse',
    startsAt: new Date('2026-06-15T18:00:00Z'),
    endsAt: new Date('2026-06-15T23:00:00Z'),
    capacity: 5000,
    ownerId: 'user-1',
  }

  it('should create event with defaults and generated slug', () => {
    const event = EventEntity.create(validProps)
    expect(event.name).toBe('Festival Jazz 2026')
    expect(event.slug).toBe('festival-jazz-2026')
    expect(event.status).toBe(EventStatus.DRAFT)
    expect(event.deletedAt).toBeNull()
  })

  it('should throw when name is missing', () => {
    expect(() => EventEntity.create({ ...validProps, name: '' } as never)).toThrow('Event name is required')
  })

  it('should throw when endsAt is before startsAt', () => {
    expect(() => EventEntity.create({ ...validProps, endsAt: new Date('2026-06-15T17:00:00Z') })).toThrow(
      'endsAt must be after startsAt'
    )
  })

  it('should publish DRAFT → UPCOMING', () => {
    const event = EventEntity.create(validProps)
    event.publish()
    expect(event.status).toBe(EventStatus.UPCOMING)
  })

  it('should throw when publishing non-DRAFT event', () => {
    const event = EventEntity.create(validProps)
    event.publish()
    expect(() => event.publish()).toThrow()
  })

  it('should transition UPCOMING → IN_PROGRESS on start()', () => {
    const event = EventEntity.create(validProps)
    event.publish().start()
    expect(event.status).toBe(EventStatus.IN_PROGRESS)
  })

  it('should identify isActive() as UPCOMING or IN_PROGRESS', () => {
    const event = EventEntity.create(validProps)
    expect(event.isActive()).toBe(false)
    event.publish()
    expect(event.isActive()).toBe(true)
    event.start()
    expect(event.isActive()).toBe(true)
    event.complete()
    expect(event.isActive()).toBe(false)
  })

  it('should soft delete', () => {
    const event = EventEntity.create(validProps)
    event.softDelete()
    expect(event.isDeleted()).toBe(true)
    expect(event.deletedAt).not.toBeNull()
  })

  it('should serialize via toJSON', () => {
    const event = EventEntity.create(validProps)
    const json = event.toJSON()
    expect(json.name).toBe('Festival Jazz 2026')
    expect(json.status).toBe(EventStatus.DRAFT)
  })
})
