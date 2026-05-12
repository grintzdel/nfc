import { AppError } from '@shared/errors/app.error'

export class CreateEventRequestDto {
  name: string
  description: string
  venueName: string
  venueAddress: string
  city: string
  startsAt: string
  endsAt: string
  capacity: number
  staffCount: number

  constructor(body: Record<string, unknown>) {
    if (typeof body.name !== 'string' || !body.name.trim()) throw new AppError(400, 'name is required')
    if (typeof body.startsAt !== 'string') throw new AppError(400, 'startsAt is required')
    if (typeof body.endsAt !== 'string') throw new AppError(400, 'endsAt is required')
    if (typeof body.capacity !== 'number' || body.capacity < 0) throw new AppError(400, 'capacity must be a non-negative number')
    this.name = body.name
    this.description = typeof body.description === 'string' ? body.description : ''
    this.venueName = typeof body.venueName === 'string' ? body.venueName : ''
    this.venueAddress = typeof body.venueAddress === 'string' ? body.venueAddress : ''
    this.city = typeof body.city === 'string' ? body.city : ''
    this.startsAt = body.startsAt
    this.endsAt = body.endsAt
    this.capacity = body.capacity
    this.staffCount = typeof body.staffCount === 'number' && body.staffCount >= 0 ? body.staffCount : 0
  }
}
