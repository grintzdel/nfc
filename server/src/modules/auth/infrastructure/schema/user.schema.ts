import mongoose, { Schema, Document } from 'mongoose'
import { UserRole } from '../../domain/constants/auth.constant'

export interface UserDocument extends Document {
  email: string
  password: string
  firstName: string
  lastName: string
  role: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    role: { type: String, enum: [UserRole.ADMIN, UserRole.CUSTOMER], default: UserRole.CUSTOMER },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export const UserModel = mongoose.model<UserDocument>('User', userSchema)
