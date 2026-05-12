export function getMonthRange(offsetMonths: number): { from: Date; to: Date } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + offsetMonths
  const from = new Date(year, month, 1, 0, 0, 0, 0)
  const to = new Date(year, month + 1, 1, 0, 0, 0, 0)
  return { from, to }
}
