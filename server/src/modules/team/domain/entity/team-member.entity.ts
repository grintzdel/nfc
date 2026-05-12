import { TeamRole } from '../constants/team-role.constant'
import { TeamMemberAlreadyAcceptedError, TeamMemberInvalidRoleError } from '../errors/team.error'

export interface TeamMemberEntityProps {
  id: string
  userId: string
  eventId: string
  role: TeamRole
  invitedAt: Date
  invitedBy: string
  acceptedAt: Nullable<Date>
  createdAt: Date
  updatedAt: Date
  deletedAt: Nullable<Date>
}

export class TeamMemberEntity {
  private constructor(private readonly props: TeamMemberEntityProps) {}

  static create(props: Partial<TeamMemberEntityProps>): TeamMemberEntity {
    if (!props.userId) throw new Error('userId is required')
    if (!props.eventId) throw new Error('eventId is required')
    if (!props.invitedBy) throw new Error('invitedBy is required')
    if (!props.role) throw new Error('role is required')
    if (props.role === TeamRole.OWNER) {
      throw new Error('Cannot create OWNER team member — OWNER is stored on EventEntity.ownerId')
    }

    const now = new Date()
    return new TeamMemberEntity({
      id: props.id ?? '',
      userId: props.userId,
      eventId: props.eventId,
      role: props.role,
      invitedAt: props.invitedAt ?? now,
      invitedBy: props.invitedBy,
      acceptedAt: props.acceptedAt ?? null,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      deletedAt: props.deletedAt ?? null,
    })
  }

  static fromProps(props: TeamMemberEntityProps): TeamMemberEntity {
    return new TeamMemberEntity(props)
  }

  get id(): string { return this.props.id }
  get userId(): string { return this.props.userId }
  get eventId(): string { return this.props.eventId }
  get role(): TeamRole { return this.props.role }
  get invitedAt(): Date { return this.props.invitedAt }
  get invitedBy(): string { return this.props.invitedBy }
  get acceptedAt(): Nullable<Date> { return this.props.acceptedAt }
  get createdAt(): Date { return this.props.createdAt }
  get updatedAt(): Date { return this.props.updatedAt }
  get deletedAt(): Nullable<Date> { return this.props.deletedAt }

  isAccepted(): boolean { return this.props.acceptedAt !== null }
  isDeleted(): boolean { return this.props.deletedAt !== null }

  accept(): this {
    if (this.props.acceptedAt !== null) throw new TeamMemberAlreadyAcceptedError(this.props.id)
    this.props.acceptedAt = new Date()
    this.props.updatedAt = new Date()
    return this
  }

  changeRole(newRole: TeamRole): this {
    if (newRole === TeamRole.OWNER) {
      throw new TeamMemberInvalidRoleError('Cannot change role to OWNER')
    }
    this.props.role = newRole
    this.props.updatedAt = new Date()
    return this
  }

  softDelete(): void {
    if (!this.props.deletedAt) {
      this.props.deletedAt = new Date()
      this.props.updatedAt = new Date()
    }
  }

  toJSON(): TeamMemberEntityProps { return { ...this.props } }
}
