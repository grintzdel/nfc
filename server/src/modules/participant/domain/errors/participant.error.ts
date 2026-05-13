import { AppError } from '@shared/errors/app.error'

export class ParticipantNotFoundError extends AppError {
  constructor(id: string) {
    super(404, `Participant ${id} not found`)
  }
}

export class ParticipantAlreadyRegisteredError extends AppError {
  constructor(userId: string, eventId: string) {
    super(409, `User ${userId} is already registered for event ${eventId}`)
  }
}
