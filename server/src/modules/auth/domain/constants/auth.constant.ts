export const AuthConstant = {
  SALT_ROUNDS: 10,
  JWT_DEFAULT_EXPIRATION: '24h',
} as const

export const UserRole = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]
