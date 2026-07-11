import { format } from 'date-fns'
import {
  DREAM_YOGA_SLOTS,
  getSlotTime,
  type DreamYogaSlot,
} from './dreamYogaSchedule'
import {
  getDreamYogaAlarmContent,
  getPracticeAlarmContent,
  type ActiveAlarm,
} from './notifications'
import type { AppSettings } from '../store/settingsStore'

export interface AlarmTrigger {
  id: string
  hour: number
  minute: number
  alarm: ActiveAlarm
}

export interface DueAlarm {
  id: string
  alarm: ActiveAlarm
}

const FIRED_KEY = 'yungdrung-fired-alarms'

export function getFiredToday(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(FIRED_KEY)
    if (!raw) return {}
    const data = JSON.parse(raw) as { date: string; fired: Record<string, boolean> }
    const today = format(new Date(), 'yyyy-MM-dd')
    if (data.date !== today) return {}
    return data.fired
  } catch {
    return {}
  }
}

export function markAlarmFired(id: string) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const fired = { ...getFiredToday(), [id]: true }
  localStorage.setItem(FIRED_KEY, JSON.stringify({ date: today, fired }))
}

export function clearFiredAlarm(id: string) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const fired = { ...getFiredToday() }
  delete fired[id]
  localStorage.setItem(FIRED_KEY, JSON.stringify({ date: today, fired }))
}

function isSlotEnabled(settings: AppSettings, slot: DreamYogaSlot): boolean {
  switch (slot) {
    case 'bedtime':
      return settings.dreamYogaBedtimeSlotEnabled
    case 'night_1':
      return settings.dreamYogaNight1SlotEnabled
    case 'night_2':
      return settings.dreamYogaNight2SlotEnabled
    case 'night_3':
      return settings.dreamYogaNight3SlotEnabled
    case 'night_4':
      return settings.dreamYogaNight4SlotEnabled
    case 'wake':
      return settings.dreamYogaWakeSlotEnabled
  }
}

export function buildAlarmTriggers(settings: AppSettings): AlarmTrigger[] {
  const triggers: AlarmTrigger[] = []

  if (settings.remindersEnabled) {
    triggers.push({
      id: 'practice-reminder',
      hour: settings.reminderHour,
      minute: settings.reminderMinute,
      alarm: getPracticeAlarmContent(),
    })
  }

  if (settings.dreamYogaEnabled) {
    for (const slot of DREAM_YOGA_SLOTS) {
      if (!isSlotEnabled(settings, slot)) continue
      const time = getSlotTime(settings, slot)
      if (!time) continue
      triggers.push({
        id: `dream-yoga-${slot}`,
        hour: time.hour,
        minute: time.minute,
        alarm: getDreamYogaAlarmContent(slot),
      })
    }
  }

  return triggers
}

export function getDueAlarms(settings: AppSettings, now = new Date()): DueAlarm[] {
  const h = now.getHours()
  const m = now.getMinutes()
  const fired = getFiredToday()
  const due: DueAlarm[] = []

  for (const trigger of buildAlarmTriggers(settings)) {
    if (fired[trigger.id]) continue
    if (trigger.hour === h && trigger.minute === m) {
      due.push({ id: trigger.id, alarm: trigger.alarm })
    }
  }

  return due
}

/** @deprecated Use getDueAlarms */
export function checkAlarms(settings: AppSettings): ActiveAlarm[] {
  return getDueAlarms(settings).map((item) => item.alarm)
}

export function msUntilTriggerToday(
  hour: number,
  minute: number,
  now = new Date(),
): number | null {
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  if (hour < currentHour || (hour === currentHour && minute < currentMinute)) {
    return null
  }

  const target = new Date(now)
  target.setHours(hour, minute, 0, 0)
  return Math.max(0, target.getTime() - now.getTime())
}
