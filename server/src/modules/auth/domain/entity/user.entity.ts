import { UserRole } from '../constants/auth.constant'

export interface UserEntityProps {
  id: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
  deletedAt: Nullable<Date>
}

export class UserEntity {
  private constructor(private readonly props: UserEntityProps) {}

  static create(props: Partial<UserEntityProps>): UserEntity {
    if (!props.email) {
      throw new Error('Email is required')
    }
    if (!props.password) {
      throw new Error('Password is required')
    }

    const now = new Date()

    return new UserEntity({
      id: props.id ?? '',
      email: props.email,
      password: props.password,
      firstName: props.firstName ?? '',
      lastName: props.lastName ?? '',
      role: props.role ?? UserRole.CUSTOMER,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      deletedAt: props.deletedAt ?? null,
    })
  }

  static fromProps(props: UserEntityProps): UserEntity {
    return new UserEntity(props)
  }

  get id(): string { return this.props.id }
  get email(): string { return this.props.email }
  get password(): string { return this.props.password }
  get firstName(): string { return this.props.firstName }
  get lastName(): string { return this.props.lastName }
  get role(): UserRole { return this.props.role }
  get createdAt(): Date { return this.props.createdAt }
  get updatedAt(): Date { return this.props.updatedAt }
  get deletedAt(): Nullable<Date> { return this.props.deletedAt }

  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`.trim()
  }

  isAdmin(): boolean {
    return this.props.role === UserRole.ADMIN
  }

  isDeleted(): boolean {
    return this.props.deletedAt !== null
  }

  update(newProps: { email?: string; firstName?: string; lastName?: string }): this {
    if (newProps.email !== undefined) this.props.email = newProps.email
    if (newProps.firstName !== undefined) this.props.firstName = newProps.firstName
    if (newProps.lastName !== undefined) this.props.lastName = newProps.lastName
    this.props.updatedAt = new Date()
    return this
  }

  updatePassword(hashedPassword: string): this {
    this.props.password = hashedPassword
    this.props.updatedAt = new Date()
    return this
  }

  softDelete(): void {
    if (!this.props.deletedAt) {
      this.props.deletedAt = new Date()
      this.props.updatedAt = new Date()
    }
  }

  toJSON(): UserEntityProps {
    return { ...this.props }
  }
}
