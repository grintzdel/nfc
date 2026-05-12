import { EventEntity } from '../../domain/entity/event.entity'

export class EventResponseDto {
  id: string
  name: string
  slug: string
  description: string
  venueName: string
  venueAddress: string
  city: string
  startsAt: Date
  endsAt: Date
  capacity: number
  staffCount: number
  status: string
  ownerId: string
  createdAt: Date
  updatedAt: Date

  constructor(e: EventEntity) {
    this.id = e.id
    this.name = e.name
    this.slug = e.slug
    this.description = e.description
    this.venueName = e.venueName
    this.venueAddress = e.venueAddress
    this.city = e.city
    this.startsAt = e.startsAt
    this.endsAt = e.endsAt
    this.capacity = e.capacity
    this.staffCount = e.staffCount
    this.status = e.status
    this.ownerId = e.ownerId
    this.createdAt = e.createdAt
    this.updatedAt = e.updatedAt
  }
}
