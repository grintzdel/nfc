import { EventStatus } from '../constants/event-status.constant'
import { EventInvalidStatusTransitionError } from '../errors/event.error'

export interface EventEntityProps {
  id: string
  name: string
  slug: string
  description: string
  venueName: string
  venueAddress: string
  city: string
  startsAt: Date
  endsAt: Date
  capacity: number
  staffCount: number
  status: EventStatus
  ownerId: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Nullable<Date>
}

export class EventEntity {
  private constructor(private readonly props: EventEntityProps) {}

  static create(props: Partial<EventEntityProps>): EventEntity {
    if (!props.name) throw new Error('Event name is required')
    if (!props.ownerId) throw new Error('Event ownerId is required')
    if (!props.startsAt || !props.endsAt) throw new Error('Event startsAt and endsAt are required')
    if (props.endsAt <= props.startsAt) throw new Error('endsAt must be after startsAt')
    if (props.capacity === undefined || props.capacity < 0) throw new Error('Valid capacity is required')

    const now = new Date()
    const slug =
      props.slug ??
      props.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

    return new EventEntity({
      id: props.id ?? '',
      name: props.name,
      slug,
      description: props.description ?? '',
      venueName: props.venueName ?? '',
      venueAddress: props.venueAddress ?? '',
      city: props.city ?? '',
      startsAt: props.startsAt,
      endsAt: props.endsAt,
      capacity: props.capacity,
      staffCount: props.staffCount ?? 0,
      status: props.status ?? EventStatus.DRAFT,
      ownerId: props.ownerId,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      deletedAt: props.deletedAt ?? null,
    })
  }

  static fromProps(props: EventEntityProps): EventEntity {
    return new EventEntity(props)
  }

  get id(): string {
    return this.props.id
  }
  get name(): string {
    return this.props.name
  }
  get slug(): string {
    return this.props.slug
  }
  get description(): string {
    return this.props.description
  }
  get venueName(): string {
    return this.props.venueName
  }
  get venueAddress(): string {
    return this.props.venueAddress
  }
  get city(): string {
    return this.props.city
  }
  get startsAt(): Date {
    return this.props.startsAt
  }
  get endsAt(): Date {
    return this.props.endsAt
  }
  get capacity(): number {
    return this.props.capacity
  }
  get staffCount(): number {
    return this.props.staffCount
  }
  get status(): EventStatus {
    return this.props.status
  }
  get ownerId(): string {
    return this.props.ownerId
  }
  get createdAt(): Date {
    return this.props.createdAt
  }
  get updatedAt(): Date {
    return this.props.updatedAt
  }
  get deletedAt(): Nullable<Date> {
    return this.props.deletedAt
  }

  isDraft(): boolean {
    return this.props.status === EventStatus.DRAFT
  }
  isUpcoming(): boolean {
    return this.props.status === EventStatus.UPCOMING
  }
  isInProgress(): boolean {
    return this.props.status === EventStatus.IN_PROGRESS
  }
  isCompleted(): boolean {
    return this.props.status === EventStatus.COMPLETED
  }
  isCancelled(): boolean {
    return this.props.status === EventStatus.CANCELLED
  }
  isActive(): boolean {
    return this.isUpcoming() || this.isInProgress()
  }
  isDeleted(): boolean {
    return this.props.deletedAt !== null
  }

  publish(): this {
    if (!this.isDraft()) throw new EventInvalidStatusTransitionError(this.props.status, EventStatus.UPCOMING)
    this.props.status = EventStatus.UPCOMING
    this.props.updatedAt = new Date()
    return this
  }

  start(): this {
    if (!this.isUpcoming()) throw new EventInvalidStatusTransitionError(this.props.status, EventStatus.IN_PROGRESS)
    this.props.status = EventStatus.IN_PROGRESS
    this.props.updatedAt = new Date()
    return this
  }

  complete(): this {
    if (!this.isInProgress()) throw new EventInvalidStatusTransitionError(this.props.status, EventStatus.COMPLETED)
    this.props.status = EventStatus.COMPLETED
    this.props.updatedAt = new Date()
    return this
  }

  cancel(): this {
    if (this.isCompleted()) throw new EventInvalidStatusTransitionError(this.props.status, EventStatus.CANCELLED)
    if (this.isCancelled()) throw new EventInvalidStatusTransitionError(this.props.status, EventStatus.CANCELLED)
    this.props.status = EventStatus.CANCELLED
    this.props.updatedAt = new Date()
    return this
  }

  update(newProps: Partial<Omit<EventEntityProps, 'id' | 'ownerId' | 'status' | 'createdAt'>>): this {
    if (newProps.name !== undefined) this.props.name = newProps.name
    if (newProps.slug !== undefined) this.props.slug = newProps.slug
    if (newProps.description !== undefined) this.props.description = newProps.description
    if (newProps.venueName !== undefined) this.props.venueName = newProps.venueName
    if (newProps.venueAddress !== undefined) this.props.venueAddress = newProps.venueAddress
    if (newProps.city !== undefined) this.props.city = newProps.city
    if (newProps.startsAt !== undefined) this.props.startsAt = newProps.startsAt
    if (newProps.endsAt !== undefined) this.props.endsAt = newProps.endsAt
    if (newProps.capacity !== undefined) this.props.capacity = newProps.capacity
    if (newProps.staffCount !== undefined) this.props.staffCount = newProps.staffCount
    if (this.props.endsAt <= this.props.startsAt) throw new Error('endsAt must be after startsAt')
    this.props.updatedAt = new Date()
    return this
  }

  softDelete(): void {
    if (!this.props.deletedAt) {
      this.props.deletedAt = new Date()
      this.props.updatedAt = new Date()
    }
  }

  toJSON(): EventEntityProps {
    return { ...this.props }
  }
}
