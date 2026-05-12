import mongoose, { Schema, Document } from 'mongoose'
import { TeamRole } from '../../domain/constants/team-role.constant'

export interface TeamMemberDocument extends Document {
  userId: string
  eventId: string
  role: TeamRole
  invitedAt: Date
  invitedBy: string
  acceptedAt: Nullable<Date>
  deletedAt: Nullable<Date>
  createdAt: Date
  updatedAt: Date
}

const teamMemberSchema = new Schema<TeamMemberDocument>(
  {
    userId: { type: String, required: true, index: true },
    eventId: { type: String, required: true, index: true },
    role: { type: String, enum: [TeamRole.MANAGER, TeamRole.STAFF], required: true },
    invitedAt: { type: Date, required: true },
    invitedBy: { type: String, required: true },
    acceptedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

teamMemberSchema.index(
  { userId: 1, eventId: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
)

export const TeamMemberModel = mongoose.model<TeamMemberDocument>('TeamMember', teamMemberSchema)
