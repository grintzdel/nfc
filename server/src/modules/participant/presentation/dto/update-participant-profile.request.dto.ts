import { AppError } from '@shared/errors/app.error'
import type { ParticipantProfile } from '../../domain/entity/participant.entity'

export class UpdateParticipantProfileRequestDto {
  displayName?: string
  role?: Nullable<string>
  linkedinUrl?: Nullable<string>
  bio?: Nullable<string>

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
    if (body.linkedinUrl !== undefined) {
      if (body.linkedinUrl !== null && typeof body.linkedinUrl !== 'string') throw new AppError(400, 'linkedinUrl must be string or null')
      this.linkedinUrl = body.linkedinUrl as Nullable<string>
    }
    if (body.bio !== undefined) {
      if (body.bio !== null && typeof body.bio !== 'string') throw new AppError(400, 'bio must be string or null')
      this.bio = body.bio as Nullable<string>
    }
  }

  toPartialProfile(): Partial<ParticipantProfile> {
    const partial: Partial<ParticipantProfile> = {}
    if (this.displayName !== undefined) partial.displayName = this.displayName
    if (this.role !== undefined) partial.role = this.role
    if (this.linkedinUrl !== undefined) partial.linkedinUrl = this.linkedinUrl
    if (this.bio !== undefined) partial.bio = this.bio
    return partial
  }
}
