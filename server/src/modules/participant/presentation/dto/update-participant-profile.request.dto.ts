import { AppError } from '@shared/errors/app.error'
import type { ParticipantProfile, ProfileLink } from '../../domain/entity/participant.entity'
import { parseProfileLinks } from './profile-link.parser'

export class UpdateParticipantProfileRequestDto {
  displayName?: string
  role?: Nullable<string>
  bio?: Nullable<string>
  links?: ProfileLink[]

  constructor(body: Record<string, unknown>) {
    if (body.displayName !== undefined) {
      if (typeof body.displayName !== 'string' || !body.displayName.trim()) {
        throw new AppError(400, 'displayName must be a non-empty string')
      }
      this.displayName = body.displayName
    }
    if (body.role !== undefined) {
      if (body.role !== null && typeof body.role !== 'string') throw new AppError(400, 'role must be string or null')
      this.role = body.role as Nullable<string>
    }
    if (body.bio !== undefined) {
      if (body.bio !== null && typeof body.bio !== 'string') throw new AppError(400, 'bio must be string or null')
      this.bio = body.bio as Nullable<string>
    }
    if (body.links !== undefined) this.links = parseProfileLinks(body.links)
  }

  toPartialProfile(): Partial<ParticipantProfile> {
    const partial: Partial<ParticipantProfile> = {}
    if (this.displayName !== undefined) partial.displayName = this.displayName
    if (this.role !== undefined) partial.role = this.role
    if (this.bio !== undefined) partial.bio = this.bio
    if (this.links !== undefined) partial.links = this.links
    return partial
  }
}
