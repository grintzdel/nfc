export const StockLevel = { LOW: 'low', MID: 'mid', HIGH: 'high' } as const
export type StockLevel = (typeof StockLevel)[keyof typeof StockLevel]

export function stockLevelFromFillPercent(pct: number): StockLevel {
  if (pct < 45) return StockLevel.LOW
  if (pct <= 55) return StockLevel.MID
  return StockLevel.HIGH
}
