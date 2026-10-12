export function formatPracticeCount(n: number): string {
  return n.toLocaleString('ru-RU')
}

export function formatCompletionPercent(completed: number, target: number): string {
  if (target <= 0) return '0.0'
  const tenths = Math.min(1000, Math.max(0, Math.floor((completed * 1000) / target)))
  return `${Math.floor(tenths / 10)}.${tenths % 10}`
}
