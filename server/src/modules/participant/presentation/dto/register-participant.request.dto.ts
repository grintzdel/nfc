import { AppError } from '@shared/errors/app.error'
import type { ParticipantProfile } from '../../domain/entity/participant.entity'

export class RegisterParticipantRequestDto {
  eventId: string
  profile: ParticipantProfile

  constructor(body: Record<string, unknown>) {
    if (typeof body.eventId !== 'string' || !body.eventId) throw new AppError(400, 'eventId is required')
    const profile = body.profile as Record<string, unknown> | undefined
    if (!profile || typeof profile !== 'object') throw new AppError(400, 'profile is required')
    if (typeof profile.displayName !== 'string' || !profile.displayName.trim()) {
      throw new AppError(400, 'profile.displayName is required')
    }
    this.eventId = body.eventId
    this.profile = {
      displayName: profile.displayName,
      role: typeof profile.role === 'string' ? profile.role : null,
      linkedinUrl: typeof profile.linkedinUrl === 'string' ? profile.linkedinUrl : null,
      bio: typeof profile.bio === 'string' ? profile.bio : null,
    }
  }
}
