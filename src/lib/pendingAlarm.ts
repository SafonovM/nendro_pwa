import type { ActiveAlarm } from './notifications'

const PENDING_ALARM_KEY = 'yungdrung-pending-alarm'

export function savePendingAlarm(alarm: ActiveAlarm): void {
  try {
    sessionStorage.setItem(PENDING_ALARM_KEY, JSON.stringify(alarm))
  } catch {
    // sessionStorage may be unavailable in private mode
  }
}

export function loadPendingAlarm(): ActiveAlarm | null {
  try {
    const raw = sessionStorage.getItem(PENDING_ALARM_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ActiveAlarm
  } catch {
    return null
  }
}

export function clearPendingAlarm(): void {
  try {
    sessionStorage.removeItem(PENDING_ALARM_KEY)
  } catch {
    // ignore
  }
}
