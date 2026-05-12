import mongoose, { Schema, Document } from 'mongoose'

export interface ParticipantDocument extends Document {
  userId: string
  eventId: string
  braceletId: Nullable<string>
  profile: {
    displayName: string
    role: Nullable<string>
    linkedinUrl: Nullable<string>
    bio: Nullable<string>
  }
  registeredAt: Date
  checkedInAt: Nullable<Date>
  deletedAt: Nullable<Date>
  createdAt: Date
  updatedAt: Date
}

const profileSchema = new Schema(
  {
    displayName: { type: String, required: true },
    role: { type: String, default: null },
    linkedinUrl: { type: String, default: null },
    bio: { type: String, default: null },
  },
  { _id: false },
)

const participantSchema = new Schema<ParticipantDocument>(
  {
    userId: { type: String, required: true, index: true },
    eventId: { type: String, required: true, index: true },
    braceletId: { type: String, default: null },
    profile: { type: profileSchema, required: true },
    registeredAt: { type: Date, required: true },
    checkedInAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

participantSchema.index(
  { userId: 1, eventId: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
)

export const ParticipantModel = mongoose.model<ParticipantDocument>('Participant', participantSchema)
