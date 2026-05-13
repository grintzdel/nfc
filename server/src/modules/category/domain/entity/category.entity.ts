export interface CategoryEntityProps {
  id: string
  name: string
  slug: string
  description: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Nullable<Date>
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export class CategoryEntity {
  private constructor(private readonly props: CategoryEntityProps) {}

  static create(props: Partial<CategoryEntityProps>): CategoryEntity {
    if (!props.name) throw new Error('Category name is required')
    const now = new Date()
    return new CategoryEntity({
      id: props.id ?? '',
      name: props.name,
      slug: props.slug ? slugify(props.slug) : slugify(props.name),
      description: props.description ?? '',
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      deletedAt: props.deletedAt ?? null,
    })
  }

  static fromProps(props: CategoryEntityProps): CategoryEntity {
    return new CategoryEntity(props)
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
  get createdAt(): Date {
    return this.props.createdAt
  }
  get updatedAt(): Date {
    return this.props.updatedAt
  }
  get deletedAt(): Nullable<Date> {
    return this.props.deletedAt
  }

  isDeleted(): boolean {
    return this.props.deletedAt !== null
  }

  update(newProps: Partial<Omit<CategoryEntityProps, 'id' | 'createdAt'>>): this {
    if (newProps.name !== undefined) this.props.name = newProps.name
    if (newProps.slug !== undefined) this.props.slug = slugify(newProps.slug)
    if (newProps.description !== undefined) this.props.description = newProps.description
    this.props.updatedAt = new Date()
    return this
  }

  softDelete(): void {
    if (!this.props.deletedAt) {
      this.props.deletedAt = new Date()
      this.props.updatedAt = new Date()
    }
  }

  toJSON(): CategoryEntityProps {
    return { ...this.props }
  }
}
