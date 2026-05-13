import { AppError } from '@shared/errors/app.error'

export class OrderNotFoundError extends AppError {
  constructor(id: string) {
    super(404, `Order "${id}" not found`)
  }
}
export class InvalidOrderTransitionError extends AppError {
  constructor(from: string, to: string) {
    super(400, `Cannot transition order from "${from}" to "${to}"`)
  }
}
export class OrderCannotBeDeletedError extends AppError {
  constructor(id: string) {
    super(409, `Order "${id}" has been delivered and cannot be deleted`)
  }
}
