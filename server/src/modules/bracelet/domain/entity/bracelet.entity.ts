import { generateId } from '@shared/utils/generate-id'

import { BraceletStatus } from '../constants/bracelet-status.constant'
import { BraceletInvalidStatusError } from '../errors/bracelet.error'

export interface BraceletEntityProps {
  id: string
  nfcId: string
  status: BraceletStatus
  userId: Nullable<string>
  eventId: Nullable<string>
  productId: Nullable<string>
  orderId: Nullable<string>
  activatedAt: Nullable<Date>
  createdAt: Date
  updatedAt: Date
  deletedAt: Nullable<Date>
}

export class BraceletEntity {
  private constructor(private readonly props: BraceletEntityProps) {}

  static create(props: Partial<BraceletEntityProps>): BraceletEntity {
    const now = new Date()
    return new BraceletEntity({
      id: props.id ?? '',
      nfcId: props.nfcId ?? generateId(),
      status: props.status ?? BraceletStatus.STOCK,
      userId: props.userId ?? null,
      eventId: props.eventId ?? null,
      productId: props.productId ?? null,
      orderId: props.orderId ?? null,
      activatedAt: props.activatedAt ?? null,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      deletedAt: props.deletedAt ?? null,
    })
  }

  static fromProps(props: BraceletEntityProps): BraceletEntity {
    return new BraceletEntity(props)
  }

  get id(): string {
    return this.props.id
  }
  get nfcId(): string {
    return this.props.nfcId
  }
  get status(): BraceletStatus {
    return this.props.status
  }
  get userId(): Nullable<string> {
    return this.props.userId
  }
  get eventId(): Nullable<string> {
    return this.props.eventId
  }
  get productId(): Nullable<string> {
    return this.props.productId
  }
  get orderId(): Nullable<string> {
    return this.props.orderId
  }
  get activatedAt(): Nullable<Date> {
    return this.props.activatedAt
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

  isInStock(): boolean {
    return this.props.status === BraceletStatus.STOCK
  }
  isPreActivated(): boolean {
    return this.props.status === BraceletStatus.PRE_ACTIVATED
  }
  isActive(): boolean {
    return this.props.status === BraceletStatus.ACTIVE
  }
  isDisabled(): boolean {
    return this.props.status === BraceletStatus.DISABLED
  }
  isDeleted(): boolean {
    return this.props.deletedAt !== null
  }

  assignTo(userId: string, eventId: string): this {
    if (!this.isInStock()) throw new BraceletInvalidStatusError(this.props.status, 'assign')
    this.props.userId = userId
    this.props.eventId = eventId
    this.props.status = BraceletStatus.PRE_ACTIVATED
    this.props.updatedAt = new Date()
    return this
  }

  activate(): this {
    if (!this.isPreActivated()) throw new BraceletInvalidStatusError(this.props.status, 'activate')
    this.props.status = BraceletStatus.ACTIVE
    this.props.activatedAt = new Date()
    this.props.updatedAt = new Date()
    return this
  }

  disable(): this {
    if (this.isDisabled()) throw new BraceletInvalidStatusError(this.props.status, 'disable')
    this.props.status = BraceletStatus.DISABLED
    this.props.updatedAt = new Date()
    return this
  }

  softDelete(): void {
    if (!this.props.deletedAt) {
      this.props.deletedAt = new Date()
      this.props.updatedAt = new Date()
    }
  }

  toJSON(): BraceletEntityProps {
    return { ...this.props }
  }
}
