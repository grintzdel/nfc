export const EventStatus = {
  DRAFT: 'draft',
  UPCOMING: 'upcoming',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus]
