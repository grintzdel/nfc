export const ProductCategory = {
  BRACELET: 'bracelet',
  PASS: 'pass',
  BUNDLE: 'bundle',
} as const

export type ProductCategory = (typeof ProductCategory)[keyof typeof ProductCategory]
