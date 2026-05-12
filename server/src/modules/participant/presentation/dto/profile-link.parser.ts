import { AppError } from '@shared/errors/app.error'
import type { ProfileLink } from '../../domain/entity/participant.entity'
import { ProfileLinkType } from '../../domain/constants/profile-link-type.constant'

const VALID_TYPES = Object.values(ProfileLinkType) as string[]

export function parseProfileLinks(raw: unknown): ProfileLink[] {
  if (!Array.isArray(raw)) throw new AppError(400, 'links must be an array')
  return raw.map((item, i) => {
    if (typeof item !== 'object' || item === null) throw new AppError(400, `links[${i}] must be an object`)
    const o = item as Record<string, unknown>
    if (typeof o.type !== 'string' || !VALID_TYPES.includes(o.type)) {
      throw new AppError(400, `links[${i}].type is invalid`)
    }
    if (typeof o.url !== 'string' || !o.url.trim()) throw new AppError(400, `links[${i}].url is required`)
    const label = o.label === undefined || o.label === null ? null : String(o.label)
    return { type: o.type as ProfileLink['type'], url: o.url, label }
  })
}
