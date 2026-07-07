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

const FIRED_KEY = 'yungdrung-fired-alarms'

function getFiredToday(): Record<string, boolean> {
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

function markFired(id: string) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const fired = { ...getFiredToday(), [id]: true }
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

export function checkAlarms(settings: AppSettings): ActiveAlarm[] {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()
  const fired = getFiredToday()
  const due: ActiveAlarm[] = []

  for (const trigger of buildAlarmTriggers(settings)) {
    if (fired[trigger.id]) continue
    if (trigger.hour === h && trigger.minute === m) {
      markFired(trigger.id)
      due.push(trigger.alarm)
    }
  }

  return due
}
