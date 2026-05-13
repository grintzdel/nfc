import { AppError } from '@shared/errors/app.error'

export class UpdateEventRequestDto {
  name?: string
  description?: string
  venueName?: string
  venueAddress?: string
  city?: string
  startsAt?: string
  endsAt?: string
  capacity?: number
  staffCount?: number

  constructor(body: Record<string, unknown>) {
    if (body.name !== undefined) {
      if (typeof body.name !== 'string') throw new AppError(400, 'name must be a string')
      this.name = body.name
    }
    if (body.description !== undefined) {
      if (typeof body.description !== 'string') throw new AppError(400, 'description must be a string')
      this.description = body.description
    }
    if (body.venueName !== undefined) {
      if (typeof body.venueName !== 'string') throw new AppError(400, 'venueName must be a string')
      this.venueName = body.venueName
    }
    if (body.venueAddress !== undefined) {
      if (typeof body.venueAddress !== 'string') throw new AppError(400, 'venueAddress must be a string')
      this.venueAddress = body.venueAddress
    }
    if (body.city !== undefined) {
      if (typeof body.city !== 'string') throw new AppError(400, 'city must be a string')
      this.city = body.city
    }
    if (body.startsAt !== undefined) {
      if (typeof body.startsAt !== 'string') throw new AppError(400, 'startsAt must be a string')
      this.startsAt = body.startsAt
    }
    if (body.endsAt !== undefined) {
      if (typeof body.endsAt !== 'string') throw new AppError(400, 'endsAt must be a string')
      this.endsAt = body.endsAt
    }
    if (body.capacity !== undefined) {
      if (typeof body.capacity !== 'number' || body.capacity < 0)
        throw new AppError(400, 'capacity must be a non-negative number')
      this.capacity = body.capacity
    }
    if (body.staffCount !== undefined) {
      if (typeof body.staffCount !== 'number' || body.staffCount < 0)
        throw new AppError(400, 'staffCount must be a non-negative number')
      this.staffCount = body.staffCount
    }
  }
}
