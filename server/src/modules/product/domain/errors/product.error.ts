import { AppError } from '@shared/errors/app.error'

export class ProductNotFoundError extends AppError {
  constructor(identifier: string) {
    super(404, `Product "${identifier}" not found`)
  }
}

export class ProductAlreadyExistsError extends AppError {
  constructor(slug: string) {
    super(409, `Product with slug "${slug}" already exists`)
  }
}
