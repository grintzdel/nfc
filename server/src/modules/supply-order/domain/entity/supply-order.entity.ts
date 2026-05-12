import { SupplyOrderStatus } from '../constants/supply-order-status.constant'
import { SupplyOrderInvalidStatusError } from '../errors/supply-order.error'

export interface SupplyOrderEntityProps {
  id: string
  units: number
  orderedAt: Date
  estimatedDeliveryDate: Date
  status: SupplyOrderStatus
  receivedAt: Nullable<Date>
  createdAt: Date
  updatedAt: Date
}

export class SupplyOrderEntity {
  private constructor(private readonly props: SupplyOrderEntityProps) {}

  static create(props: Partial<SupplyOrderEntityProps>): SupplyOrderEntity {
    if (props.units === undefined || props.units <= 0) throw new Error('units must be positive')
    if (!props.estimatedDeliveryDate) throw new Error('estimatedDeliveryDate is required')

    const now = new Date()

    return new SupplyOrderEntity({
      id: props.id ?? '',
      units: props.units,
      orderedAt: props.orderedAt ?? now,
      estimatedDeliveryDate: props.estimatedDeliveryDate,
      status: props.status ?? SupplyOrderStatus.PENDING,
      receivedAt: props.receivedAt ?? null,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    })
  }

  static fromProps(props: SupplyOrderEntityProps): SupplyOrderEntity { return new SupplyOrderEntity(props) }

  get id(): string { return this.props.id }
  get units(): number { return this.props.units }
  get orderedAt(): Date { return this.props.orderedAt }
  get estimatedDeliveryDate(): Date { return this.props.estimatedDeliveryDate }
  get status(): SupplyOrderStatus { return this.props.status }
  get receivedAt(): Nullable<Date> { return this.props.receivedAt }
  get createdAt(): Date { return this.props.createdAt }
  get updatedAt(): Date { return this.props.updatedAt }

  isPending(): boolean { return this.props.status === SupplyOrderStatus.PENDING }
  isReceived(): boolean { return this.props.status === SupplyOrderStatus.RECEIVED }
  isCancelled(): boolean { return this.props.status === SupplyOrderStatus.CANCELLED }

  markReceived(): this {
    if (!this.isPending()) throw new SupplyOrderInvalidStatusError(this.props.status, 'receive')
    this.props.status = SupplyOrderStatus.RECEIVED
    this.props.receivedAt = new Date()
    this.props.updatedAt = new Date()
    return this
  }

  cancel(): this {
    if (!this.isPending()) throw new SupplyOrderInvalidStatusError(this.props.status, 'cancel')
    this.props.status = SupplyOrderStatus.CANCELLED
    this.props.updatedAt = new Date()
    return this
  }

  toJSON(): SupplyOrderEntityProps { return { ...this.props } }
}
