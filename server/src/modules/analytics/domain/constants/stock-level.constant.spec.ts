import { StockLevel, stockLevelFromFillPercent } from './stock-level.constant'

describe('stockLevelFromFillPercent', () => {
  const cases: [number, StockLevel][] = [
    [0, StockLevel.LOW],
    [44.9, StockLevel.LOW],
    [45, StockLevel.MID],
    [50, StockLevel.MID],
    [55, StockLevel.MID],
    [55.1, StockLevel.HIGH],
    [100, StockLevel.HIGH],
  ]
  it.each(cases)('pct=%s → %s', (pct, expected) => {
    expect(stockLevelFromFillPercent(pct)).toBe(expected)
  })
})
