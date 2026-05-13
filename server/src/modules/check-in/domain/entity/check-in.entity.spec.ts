import { InteractionType } from '../constants/interaction-type.constant'
import { CheckInEntity } from './check-in.entity'

describe('CheckInEntity', () => {
  const minimalProps = {
    braceletId: 'bracelet-1',
    eventId: 'event-1',
    interactionType: InteractionType.CHECK_IN,
  }

  it('should create with minimal props and apply defaults', () => {
    const entity = CheckInEntity.create(minimalProps)
    expect(entity.braceletId).toBe('bracelet-1')
    expect(entity.eventId).toBe('event-1')
    expect(entity.interactionType).toBe(InteractionType.CHECK_IN)
    expect(entity.zoneName).toBeNull()
    expect(entity.targetBraceletId).toBeNull()
    expect(entity.amount).toBeNull()
    expect(entity.metadata).toEqual({})
    expect(entity.createdAt).toBeInstanceOf(Date)
  })

  it('should throw when braceletId is missing', () => {
    expect(() => CheckInEntity.create({ ...minimalProps, braceletId: undefined })).toThrow('braceletId is required')
  })

  it('should throw when eventId is missing', () => {
    expect(() => CheckInEntity.create({ ...minimalProps, eventId: undefined })).toThrow('eventId is required')
  })

  it('should throw when interactionType is missing', () => {
    expect(() => CheckInEntity.create({ ...minimalProps, interactionType: undefined })).toThrow(
      'interactionType is required'
    )
  })

  it('should throw when interactionType is invalid', () => {
    expect(() => CheckInEntity.create({ ...minimalProps, interactionType: 'foo' as never })).toThrow(
      'Invalid interactionType: foo'
    )
  })

  it('should create with all fields populated', () => {
    const entity = CheckInEntity.create({
      ...minimalProps,
      interactionType: InteractionType.CASHLESS,
      zoneName: 'Entrée principale',
      targetBraceletId: 'bracelet-2',
      amount: 15.5,
      metadata: { source: 'terminal-A' },
    })
    expect(entity.zoneName).toBe('Entrée principale')
    expect(entity.targetBraceletId).toBe('bracelet-2')
    expect(entity.amount).toBe(15.5)
    expect(entity.metadata).toEqual({ source: 'terminal-A' })
  })

  it('should serialize correctly via toJSON', () => {
    const entity = CheckInEntity.create(minimalProps)
    const json = entity.toJSON()
    expect(json.braceletId).toBe('bracelet-1')
    expect(json.eventId).toBe('event-1')
    expect(json.interactionType).toBe(InteractionType.CHECK_IN)
    expect(json.zoneName).toBeNull()
    expect(json.targetBraceletId).toBeNull()
    expect(json.amount).toBeNull()
    expect(json.metadata).toEqual({})
    expect(json.createdAt).toBeInstanceOf(Date)
  })

  it('should reconstruct from props via fromProps without validation', () => {
    const now = new Date()
    const entity = CheckInEntity.fromProps({
      id: 'check-in-99',
      braceletId: 'b-1',
      eventId: 'e-1',
      interactionType: InteractionType.NETWORKING,
      zoneName: 'VIP Lounge',
      targetBraceletId: 'b-2',
      amount: null,
      metadata: {},
      createdAt: now,
    })
    expect(entity.id).toBe('check-in-99')
    expect(entity.interactionType).toBe(InteractionType.NETWORKING)
    expect(entity.createdAt).toBe(now)
  })
})
