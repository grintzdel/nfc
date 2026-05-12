export interface CartItemEntityProps {
  id: string
  userId: string
  productId: string
  variantName: Nullable<string>
  quantity: number
  createdAt: Date
  updatedAt: Date
}

export class CartItemEntity {
  private constructor(private readonly props: CartItemEntityProps) {}

  static create(props: Partial<CartItemEntityProps>): CartItemEntity {
    if (!props.userId) throw new Error('User ID is required')
    if (!props.productId) throw new Error('Product ID is required')
    if (!props.quantity || props.quantity < 1) throw new Error('Quantity must be at least 1')

    const now = new Date()

    return new CartItemEntity({
      id: props.id ?? '',
      userId: props.userId,
      productId: props.productId,
      variantName: props.variantName ?? null,
      quantity: props.quantity,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    })
  }

  static fromProps(props: CartItemEntityProps): CartItemEntity {
    return new CartItemEntity(props)
  }

  get id(): string {
    return this.props.id
  }
  get userId(): string {
    return this.props.userId
  }
  get productId(): string {
    return this.props.productId
  }
  get variantName(): Nullable<string> {
    return this.props.variantName
  }
  get quantity(): number {
    return this.props.quantity
  }
  get createdAt(): Date {
    return this.props.createdAt
  }
  get updatedAt(): Date {
    return this.props.updatedAt
  }

  updateQuantity(quantity: number): this {
    if (quantity < 1) throw new Error('Quantity must be at least 1')
    ;(this.props as CartItemEntityProps).quantity = quantity
    ;(this.props as CartItemEntityProps).updatedAt = new Date()
    return this
  }

  incrementQuantity(amount: number): this {
    ;(this.props as CartItemEntityProps).quantity += amount
    ;(this.props as CartItemEntityProps).updatedAt = new Date()
    return this
  }

  toJSON(): CartItemEntityProps {
    return { ...this.props }
  }
}
