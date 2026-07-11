import { addDays, format } from 'date-fns'
import { buildAlarmTriggers, getFiredToday } from './alarmScheduler'
import type { AlarmScheduleEntry } from './alarmStore'
import type { AppSettings } from '../store/settingsStore'

const SCHEDULE_DAYS = 8

export function buildAlarmScheduleEntries(settings: AppSettings): AlarmScheduleEntry[] {
  const triggers = buildAlarmTriggers(settings)
  const firedToday = getFiredToday()
  const entries: AlarmScheduleEntry[] = []
  const now = Date.now()

  for (let dayOffset = 0; dayOffset < SCHEDULE_DAYS; dayOffset++) {
    const day = addDays(new Date(), dayOffset)
    const dateStr = format(day, 'yyyy-MM-dd')

    for (const trigger of triggers) {
      if (dayOffset === 0 && firedToday[trigger.id]) continue

      const fireAtDate = new Date(day)
      fireAtDate.setHours(trigger.hour, trigger.minute, 0, 0)
      const fireAt = fireAtDate.getTime()

      if (fireAt < now - 60_000) continue

      entries.push({
        key: `${trigger.id}:${dateStr}`,
        triggerId: trigger.id,
        date: dateStr,
        fireAt,
        title: trigger.alarm.title,
        body: trigger.alarm.body,
        kind: trigger.alarm.kind,
        slot: trigger.alarm.slot,
        hint: trigger.alarm.hint,
        fired: false,
      })
    }
  }

  return entries
}
