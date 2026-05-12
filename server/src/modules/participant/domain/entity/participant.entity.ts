import { ProfileLinkType } from '../constants/profile-link-type.constant'

export interface ProfileLink {
  type: ProfileLinkType
  url: string
  label: Nullable<string>
}

export interface ParticipantProfile {
  displayName: string
  role: Nullable<string>
  bio: Nullable<string>
  links: ProfileLink[]
}

export interface ParticipantEntityProps {
  id: string
  userId: string
  eventId: string
  braceletId: Nullable<string>
  profile: ParticipantProfile
  registeredAt: Date
  checkedInAt: Nullable<Date>
  createdAt: Date
  updatedAt: Date
  deletedAt: Nullable<Date>
}

const VALID_LINK_TYPES = Object.values(ProfileLinkType) as string[]
const URL_REGEX = /^https?:\/\/.+/
const MAILTO_REGEX = /^mailto:.+@.+\..+$/
const MAX_LINKS = 10

function validateLink(link: ProfileLink): void {
  if (!VALID_LINK_TYPES.includes(link.type)) throw new Error(`Invalid link type: ${link.type}`)
  if (link.type === ProfileLinkType.EMAIL) {
    if (!MAILTO_REGEX.test(link.url)) throw new Error('Invalid link URL (email must be mailto:)')
  } else if (!URL_REGEX.test(link.url)) {
    throw new Error(`Invalid link URL: ${link.url}`)
  }
  if (link.type === ProfileLinkType.CUSTOM && (!link.label || !link.label.trim())) {
    throw new Error('Custom link requires a label')
  }
}

function validateLinks(links: ProfileLink[]): void {
  if (links.length > MAX_LINKS) throw new Error(`Maximum ${MAX_LINKS} links allowed`)
  for (const link of links) validateLink(link)
}

export class ParticipantEntity {
  private constructor(private readonly props: ParticipantEntityProps) {}

  static create(props: Partial<ParticipantEntityProps>): ParticipantEntity {
    if (!props.userId) throw new Error('userId is required')
    if (!props.eventId) throw new Error('eventId is required')
    if (!props.profile?.displayName) throw new Error('displayName is required')

    const links = props.profile.links ?? []
    validateLinks(links)

    const now = new Date()
    return new ParticipantEntity({
      id: props.id ?? '',
      userId: props.userId,
      eventId: props.eventId,
      braceletId: props.braceletId ?? null,
      profile: {
        displayName: props.profile.displayName,
        role: props.profile.role ?? null,
        bio: props.profile.bio ?? null,
        links,
      },
      registeredAt: props.registeredAt ?? now,
      checkedInAt: props.checkedInAt ?? null,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      deletedAt: props.deletedAt ?? null,
    })
  }

  static fromProps(props: ParticipantEntityProps): ParticipantEntity {
    return new ParticipantEntity(props)
  }

  get id(): string { return this.props.id }
  get userId(): string { return this.props.userId }
  get eventId(): string { return this.props.eventId }
  get braceletId(): Nullable<string> { return this.props.braceletId }
  get profile(): ParticipantProfile { return { ...this.props.profile, links: [...this.props.profile.links] } }
  get registeredAt(): Date { return this.props.registeredAt }
  get checkedInAt(): Nullable<Date> { return this.props.checkedInAt }
  get createdAt(): Date { return this.props.createdAt }
  get updatedAt(): Date { return this.props.updatedAt }
  get deletedAt(): Nullable<Date> { return this.props.deletedAt }

  isDeleted(): boolean { return this.props.deletedAt !== null }
  hasBracelet(): boolean { return this.props.braceletId !== null }
  isCheckedIn(): boolean { return this.props.checkedInAt !== null }

  attachBracelet(braceletId: string): this {
    this.props.braceletId = braceletId
    this.props.updatedAt = new Date()
    return this
  }

  checkIn(): this {
    this.props.checkedInAt = new Date()
    this.props.updatedAt = new Date()
    return this
  }

  updateProfile(partial: Partial<ParticipantProfile>): this {
    if (partial.displayName !== undefined) {
      if (!partial.displayName.trim()) throw new Error('displayName cannot be empty')
      this.props.profile.displayName = partial.displayName
    }
    if (partial.role !== undefined) this.props.profile.role = partial.role
    if (partial.bio !== undefined) this.props.profile.bio = partial.bio
    if (partial.links !== undefined) {
      validateLinks(partial.links)
      this.props.profile.links = [...partial.links]
    }
    this.props.updatedAt = new Date()
    return this
  }

  softDelete(): void {
    if (!this.props.deletedAt) {
      this.props.deletedAt = new Date()
      this.props.updatedAt = new Date()
    }
  }

  toJSON(): ParticipantEntityProps {
    return { ...this.props, profile: { ...this.props.profile, links: [...this.props.profile.links] } }
  }
}
