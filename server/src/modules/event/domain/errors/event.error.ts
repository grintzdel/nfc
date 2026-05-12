import { AppError } from '@shared/errors/app.error'

export class EventNotFoundError extends AppError {
  constructor(id: string) { super(404, `Event ${id} not found`) }
}
export class EventInvalidStatusTransitionError extends AppError {
  constructor(from: string, to: string) { super(400, `Cannot transition event from ${from} to ${to}`) }
}
export class EventNotOwnerError extends AppError {
  constructor() { super(403, 'Only the event owner can perform this action') }
}
export class EventFullError extends AppError {
  constructor(eventId: string) {
    super(409, `Event ${eventId} is full — no more spots available`)
  }
}
