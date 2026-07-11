export function startOfDay(date: Date = new Date()): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function toEpochMs(value: Date | string | number | undefined | null): number {
  if (value == null) return Date.now()
  if (typeof value === 'number') return value
  return new Date(value).getTime()
}

export function fromEpochMs(ms: number): Date {
  return startOfDay(new Date(ms))
}
