import { AppError } from '@shared/errors/app.error'

export class UserAlreadyExistsError extends AppError {
  constructor(email: string) {
    super(409, `User with email "${email}" already exists`)
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super(401, 'Invalid email or password')
  }
}

export class UserNotFoundError extends AppError {
  constructor(id: string) {
    super(404, `User with id "${id}" not found`)
  }
}
