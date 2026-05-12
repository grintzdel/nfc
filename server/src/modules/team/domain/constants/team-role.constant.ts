export const TeamRole = {
  OWNER: 'owner',
  MANAGER: 'manager',
  STAFF: 'staff',
} as const

export type TeamRole = (typeof TeamRole)[keyof typeof TeamRole]
