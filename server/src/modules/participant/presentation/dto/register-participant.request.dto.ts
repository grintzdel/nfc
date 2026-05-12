import { AppError } from '@shared/errors/app.error'
import type { ParticipantProfile, ProfileLink } from '../../domain/entity/participant.entity'
import { parseProfileLinks } from './profile-link.parser'

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
    const links: ProfileLink[] = profile.links !== undefined ? parseProfileLinks(profile.links) : []
    this.eventId = body.eventId
    this.profile = {
      displayName: profile.displayName,
      role: typeof profile.role === 'string' ? profile.role : null,
      bio: typeof profile.bio === 'string' ? profile.bio : null,
      links,
    }
  }
}
