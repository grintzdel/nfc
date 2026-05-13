import { AppError } from '@shared/errors/app.error'

export class CategoryNotFoundError extends AppError {
  constructor(identifier: string) {
    super(404, `Category "${identifier}" not found`)
  }
}

export class CategorySlugAlreadyExistsError extends AppError {
  constructor(slug: string) {
    super(409, `Category with slug "${slug}" already exists`)
  }
}

export class CategoryInUseError extends AppError {
  constructor(slug: string, productCount: number) {
    super(
      409,
      `Category "${slug}" is used by ${productCount} product${productCount > 1 ? 's' : ''} and cannot be deleted`
    )
  }
}
