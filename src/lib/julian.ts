export function toJulianDate(date: Date): number {
  let y = date.getFullYear()
  let m = date.getMonth() + 1
  const d = date.getDate()
  if (m <= 2) {
    y--
    m += 12
  }
  const a = Math.floor(y / 100)
  const b = 2 - a + Math.floor(a / 4)
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5
}
