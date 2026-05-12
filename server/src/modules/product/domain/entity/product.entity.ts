import { ProductCategory } from '../constants/product.constant'

export interface ProductVariant {
  name: string
  color: string
  priceModifier: number
}

export interface ProductEntityProps {
  id: string
  name: string
  slug: string
  description: string
  price: number
  images: string[]
  category: ProductCategory
  variants: ProductVariant[]
  stock: number
  featured: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Nullable<Date>
}

export class ProductEntity {
  private constructor(private readonly props: ProductEntityProps) {}

  static create(props: Partial<ProductEntityProps>): ProductEntity {
    if (!props.name) throw new Error('Product name is required')
    if (props.price === undefined || props.price < 0) throw new Error('Valid price is required')

    const now = new Date()
    const slug = props.slug ?? props.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    return new ProductEntity({
      id: props.id ?? '',
      name: props.name,
      slug,
      description: props.description ?? '',
      price: props.price,
      images: props.images ?? [],
      category: props.category ?? ProductCategory.BRACELET,
      variants: props.variants ?? [],
      stock: props.stock ?? 0,
      featured: props.featured ?? false,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      deletedAt: props.deletedAt ?? null,
    })
  }

  static fromProps(props: ProductEntityProps): ProductEntity {
    return new ProductEntity(props)
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
  get price(): number {
    return this.props.price
  }
  get images(): string[] {
    return this.props.images
  }
  get category(): ProductCategory {
    return this.props.category
  }
  get variants(): ProductVariant[] {
    return this.props.variants
  }
  get stock(): number {
    return this.props.stock
  }
  get featured(): boolean {
    return this.props.featured
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
    return this.props.stock > 0
  }
  isFeatured(): boolean {
    return this.props.featured
  }
  isDeleted(): boolean {
    return this.props.deletedAt !== null
  }

  decrementStock(quantity: number): this {
    if (this.props.stock < quantity) throw new Error('Insufficient stock')
    this.props.stock -= quantity
    this.props.updatedAt = new Date()
    return this
  }

  update(newProps: Partial<Omit<ProductEntityProps, 'id' | 'createdAt'>>): this {
    if (newProps.name !== undefined) this.props.name = newProps.name
    if (newProps.slug !== undefined) this.props.slug = newProps.slug
    if (newProps.description !== undefined) this.props.description = newProps.description
    if (newProps.price !== undefined) this.props.price = newProps.price
    if (newProps.images !== undefined) this.props.images = newProps.images
    if (newProps.category !== undefined) this.props.category = newProps.category
    if (newProps.variants !== undefined) this.props.variants = newProps.variants
    if (newProps.stock !== undefined) this.props.stock = newProps.stock
    if (newProps.featured !== undefined) this.props.featured = newProps.featured
    this.props.updatedAt = new Date()
    return this
  }

  softDelete(): void {
    if (!this.props.deletedAt) {
      this.props.deletedAt = new Date()
      this.props.updatedAt = new Date()
    }
  }

  toJSON(): ProductEntityProps {
    return { ...this.props }
  }
}
