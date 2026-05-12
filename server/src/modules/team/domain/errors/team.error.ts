import { AppError } from '@shared/errors/app.error'

export class TeamMemberNotFoundError extends AppError {
  constructor(id: string) {
    super(404, `Team member ${id} not found`)
  }
}

export class TeamMemberAlreadyExistsError extends AppError {
  constructor(userId: string, eventId: string) {
    super(409, `User ${userId} is already a team member of event ${eventId}`)
  }
}

export class TeamMemberNotAuthorizedError extends AppError {
  constructor(message: string) {
    super(403, message)
  }
}

export class TeamMemberAlreadyAcceptedError extends AppError {
  constructor(id: string) {
    super(400, `Team member ${id} already accepted`)
  }
}

export class TeamMemberInvalidRoleError extends AppError {
  constructor(message: string) {
    super(400, message)
  }
}
