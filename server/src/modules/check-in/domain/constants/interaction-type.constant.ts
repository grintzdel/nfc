export const InteractionType = {
  CHECK_IN: 'check_in',
  NETWORKING: 'networking',
  VOTE: 'vote',
  CASHLESS: 'cashless',
} as const

export type InteractionType = (typeof InteractionType)[keyof typeof InteractionType]
