import { InteractionType } from '../domain/constants/interaction-type.constant'
import { CheckInEntity, CheckInEntityProps } from '../domain/entity/check-in.entity'

let counter = 0

export function createCheckInPropsFixture(overrides: Partial<CheckInEntityProps> = {}): CheckInEntityProps {
  counter++
  return {
    id: `check-in-${counter}`,
    braceletId: `bracelet-${counter}`,
    eventId: `event-${counter}`,
    interactionType: InteractionType.CHECK_IN,
    zoneName: null,
    targetBraceletId: null,
    amount: null,
    metadata: {},
    createdAt: new Date(),
    ...overrides,
  }
}

export function createCheckInFixture(overrides: Partial<CheckInEntityProps> = {}): CheckInEntity {
  return CheckInEntity.fromProps(createCheckInPropsFixture(overrides))
}
