import { OrderStatus } from '../constants/order.constant'

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

export interface OrderEntityProps {
  id: string
  userId: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  shippingAddress: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Nullable<Date>
}

export class OrderEntity {
  private constructor(private readonly props: OrderEntityProps) {}

  static create(props: Partial<OrderEntityProps>): OrderEntity {
    if (!props.userId) throw new Error('User ID is required')
    if (!props.items || props.items.length === 0) throw new Error('Order must have at least one item')
    if (!props.shippingAddress) throw new Error('Shipping address is required')

    const items = props.items
    const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    const now = new Date()

    return new OrderEntity({
      id: props.id ?? '',
      userId: props.userId,
      items,
      totalAmount,
      status: props.status ?? OrderStatus.PENDING,
      shippingAddress: props.shippingAddress,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      deletedAt: props.deletedAt ?? null,
    })
  }

  static fromProps(props: OrderEntityProps): OrderEntity {
    return new OrderEntity(props)
  }

  get id(): string {
    return this.props.id
  }
  get userId(): string {
    return this.props.userId
  }
  get items(): OrderItem[] {
    return this.props.items
  }
  get totalAmount(): number {
    return this.props.totalAmount
  }
  get status(): OrderStatus {
    return this.props.status
  }
  get shippingAddress(): string {
    return this.props.shippingAddress
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

  isPending(): boolean {
    return this.props.status === OrderStatus.PENDING
  }
  isConfirmed(): boolean {
    return this.props.status === OrderStatus.CONFIRMED
  }
  isShipped(): boolean {
    return this.props.status === OrderStatus.SHIPPED
  }
  isDelivered(): boolean {
    return this.props.status === OrderStatus.DELIVERED
  }
  isCancelled(): boolean {
    return this.props.status === OrderStatus.CANCELLED
  }

  confirm(): this {
    if (!this.isPending()) throw new Error('Only pending orders can be confirmed')
    this.props.status = OrderStatus.CONFIRMED
    this.props.updatedAt = new Date()
    return this
  }
  ship(): this {
    if (!this.isConfirmed()) throw new Error('Only confirmed orders can be shipped')
    this.props.status = OrderStatus.SHIPPED
    this.props.updatedAt = new Date()
    return this
  }
  deliver(): this {
    if (!this.isShipped()) throw new Error('Only shipped orders can be delivered')
    this.props.status = OrderStatus.DELIVERED
    this.props.updatedAt = new Date()
    return this
  }
  cancel(): this {
    if (this.isDelivered()) throw new Error('Delivered orders cannot be cancelled')
    if (this.isCancelled()) throw new Error('Order is already cancelled')
    this.props.status = OrderStatus.CANCELLED
    this.props.updatedAt = new Date()
    return this
  }

  isDeleted(): boolean {
    return this.props.deletedAt !== null
  }

  softDelete(): void {
    if (!this.props.deletedAt) {
      this.props.deletedAt = new Date()
      this.props.updatedAt = new Date()
    }
  }

  update(newProps: Partial<Pick<OrderEntityProps, 'shippingAddress'>>): this {
    if (newProps.shippingAddress !== undefined) {
      const trimmed = newProps.shippingAddress.trim()
      if (!trimmed) throw new Error('Shipping address cannot be empty')
      this.props.shippingAddress = trimmed
      this.props.updatedAt = new Date()
    }
    return this
  }

  toJSON(): OrderEntityProps {
    return { ...this.props }
  }
}
