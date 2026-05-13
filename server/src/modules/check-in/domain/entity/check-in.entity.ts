import { InteractionType } from '../constants/interaction-type.constant'

export interface CheckInEntityProps {
  id: string
  braceletId: string
  eventId: string
  interactionType: InteractionType
  zoneName: Nullable<string>
  targetBraceletId: Nullable<string>
  amount: Nullable<number>
  metadata: Record<string, unknown>
  createdAt: Date
}

export class CheckInEntity {
  private constructor(private readonly props: CheckInEntityProps) {}

  static create(props: Partial<CheckInEntityProps>): CheckInEntity {
    if (!props.braceletId) throw new Error('braceletId is required')
    if (!props.eventId) throw new Error('eventId is required')
    if (!props.interactionType) throw new Error('interactionType is required')
    if (!Object.values(InteractionType).includes(props.interactionType)) {
      throw new Error(`Invalid interactionType: ${props.interactionType}`)
    }

    return new CheckInEntity({
      id: props.id ?? '',
      braceletId: props.braceletId,
      eventId: props.eventId,
      interactionType: props.interactionType,
      zoneName: props.zoneName ?? null,
      targetBraceletId: props.targetBraceletId ?? null,
      amount: props.amount ?? null,
      metadata: props.metadata ?? {},
      createdAt: props.createdAt ?? new Date(),
    })
  }

  static fromProps(props: CheckInEntityProps): CheckInEntity {
    return new CheckInEntity(props)
  }

  get id(): string {
    return this.props.id
  }
  get braceletId(): string {
    return this.props.braceletId
  }
  get eventId(): string {
    return this.props.eventId
  }
  get interactionType(): InteractionType {
    return this.props.interactionType
  }
  get zoneName(): Nullable<string> {
    return this.props.zoneName
  }
  get targetBraceletId(): Nullable<string> {
    return this.props.targetBraceletId
  }
  get amount(): Nullable<number> {
    return this.props.amount
  }
  get metadata(): Record<string, unknown> {
    return this.props.metadata
  }
  get createdAt(): Date {
    return this.props.createdAt
  }

  toJSON(): CheckInEntityProps {
    return { ...this.props }
  }
}
