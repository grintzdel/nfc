import mongoose, { Schema, Document } from 'mongoose'
import { EventStatus } from '../../domain/constants/event-status.constant'

export interface EventDocument extends Document {
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
  status: EventStatus
  ownerId: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Nullable<Date>
}

const eventSchema = new Schema<EventDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    venueName: { type: String, default: '' },
    venueAddress: { type: String, default: '' },
    city: { type: String, default: '' },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    capacity: { type: Number, required: true },
    staffCount: { type: Number, default: 0 },
    status: { type: String, enum: Object.values(EventStatus), default: EventStatus.DRAFT, required: true },
    ownerId: { type: String, required: true, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
)
eventSchema.index({ status: 1, startsAt: 1 })

export const EventModel = mongoose.model<EventDocument>('Event', eventSchema)
