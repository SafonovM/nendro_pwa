export type DreamYogaSlot =
  | 'bedtime'
  | 'night_1'
  | 'night_2'
  | 'night_3'
  | 'night_4'
  | 'wake'

export const DREAM_YOGA_SLOTS: DreamYogaSlot[] = [
  'bedtime',
  'night_1',
  'night_2',
  'night_3',
  'night_4',
  'wake',
]

export const NIGHT_DREAM_YOGA_SLOTS = DREAM_YOGA_SLOTS.filter(
  (slot): slot is Extract<DreamYogaSlot, 'night_1' | 'night_2' | 'night_3' | 'night_4'> =>
    slot.startsWith('night_'),
)

export const BOUNDARY_DREAM_YOGA_SLOTS = ['bedtime', 'wake'] as const

export const DREAM_YOGA_SLOT_LABELS: Record<DreamYogaSlot, string> = {
  bedtime: 'Отход ко сну',
  night_1: 'Ночное пробуждение 1',
  night_2: 'Ночное пробуждение 2',
  night_3: 'Ночное пробуждение 3',
  night_4: 'Ночное пробуждение 4',
  wake: 'Подъём',
}

export interface AlarmTime {
  hour: number
  minute: number
}

export const NIGHT_ALARM_COUNT = 4

export function calculateNightAlarmTimes(
  bedtimeHour: number,
  bedtimeMinute: number,
  wakeHour: number,
  wakeMinute: number,
): AlarmTime[] {
  const bedtimeTotal = bedtimeHour * 60 + bedtimeMinute
  let wakeTotal = wakeHour * 60 + wakeMinute
  if (wakeTotal <= bedtimeTotal) {
    wakeTotal += 24 * 60
  }
  const durationMinutes = wakeTotal - bedtimeTotal
  return Array.from({ length: NIGHT_ALARM_COUNT }, (_, i) => {
    const index = i + 1
    const minutes = (bedtimeTotal + (durationMinutes * index) / NIGHT_ALARM_COUNT) % (24 * 60)
    return { hour: Math.floor(minutes / 60), minute: minutes % 60 }
  })
}

export function formatAlarmTime({ hour, minute }: AlarmTime): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export interface DreamYogaSettings {
  dreamYogaBedtimeHour: number
  dreamYogaBedtimeMinute: number
  dreamYogaWakeHour: number
  dreamYogaWakeMinute: number
}

export function getSlotTime(
  settings: DreamYogaSettings,
  slot: DreamYogaSlot,
): AlarmTime | null {
  switch (slot) {
    case 'bedtime':
      return {
        hour: settings.dreamYogaBedtimeHour,
        minute: settings.dreamYogaBedtimeMinute,
      }
    case 'wake':
      return {
        hour: settings.dreamYogaWakeHour,
        minute: settings.dreamYogaWakeMinute,
      }
    case 'night_1':
    case 'night_2':
    case 'night_3':
    case 'night_4': {
      const nightIndex = DREAM_YOGA_SLOTS.indexOf(slot) - 1
      return calculateNightAlarmTimes(
        settings.dreamYogaBedtimeHour,
        settings.dreamYogaBedtimeMinute,
        settings.dreamYogaWakeHour,
        settings.dreamYogaWakeMinute,
      )[nightIndex] ?? null
    }
    default:
      return null
  }
}

export function isDreamYogaSlotEnabled(
  slot: DreamYogaSlot,
  flags: Record<DreamYogaSlot, boolean>,
): boolean {
  return flags[slot]
}
