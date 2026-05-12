import { AppError } from '@shared/errors/app.error'

export class AssignBraceletRequestDto {
  userId: string
  eventId: string

  constructor(body: Record<string, unknown>) {
    if (typeof body.userId !== 'string' || !body.userId) throw new AppError(400, 'userId is required')
    if (typeof body.eventId !== 'string' || !body.eventId) throw new AppError(400, 'eventId is required')
    this.userId = body.userId
    this.eventId = body.eventId
  }
}
