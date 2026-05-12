export const BraceletStatus = {
  STOCK: 'stock',
  PRE_ACTIVATED: 'pre_activated',
  ACTIVE: 'active',
  DISABLED: 'disabled',
} as const

export type BraceletStatus = (typeof BraceletStatus)[keyof typeof BraceletStatus]
