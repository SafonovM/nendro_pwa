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



export const DEFAULT_BEDTIME: AlarmTime = { hour: 23, minute: 0 }

export const DEFAULT_WAKE: AlarmTime = { hour: 7, minute: 0 }



export interface DreamYogaSlotTimes {

  dreamYogaBedtimeHour: number

  dreamYogaBedtimeMinute: number

  dreamYogaNight1Hour: number

  dreamYogaNight1Minute: number

  dreamYogaNight2Hour: number

  dreamYogaNight2Minute: number

  dreamYogaNight3Hour: number

  dreamYogaNight3Minute: number

  dreamYogaNight4Hour: number

  dreamYogaNight4Minute: number

  dreamYogaWakeHour: number

  dreamYogaWakeMinute: number

}



const SLOT_TIME_KEYS: Record<

  DreamYogaSlot,

  { hour: keyof DreamYogaSlotTimes; minute: keyof DreamYogaSlotTimes }

> = {

  bedtime: { hour: 'dreamYogaBedtimeHour', minute: 'dreamYogaBedtimeMinute' },

  night_1: { hour: 'dreamYogaNight1Hour', minute: 'dreamYogaNight1Minute' },

  night_2: { hour: 'dreamYogaNight2Hour', minute: 'dreamYogaNight2Minute' },

  night_3: { hour: 'dreamYogaNight3Hour', minute: 'dreamYogaNight3Minute' },

  night_4: { hour: 'dreamYogaNight4Hour', minute: 'dreamYogaNight4Minute' },

  wake: { hour: 'dreamYogaWakeHour', minute: 'dreamYogaWakeMinute' },

}



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

    const minutes =

      (bedtimeTotal + Math.floor((durationMinutes * index) / NIGHT_ALARM_COUNT)) % (24 * 60)

    return { hour: Math.floor(minutes / 60), minute: minutes % 60 }

  })

}



export function defaultDreamYogaSlotTimes(): DreamYogaSlotTimes {

  const nights = calculateNightAlarmTimes(

    DEFAULT_BEDTIME.hour,

    DEFAULT_BEDTIME.minute,

    DEFAULT_WAKE.hour,

    DEFAULT_WAKE.minute,

  )

  return {

    dreamYogaBedtimeHour: DEFAULT_BEDTIME.hour,

    dreamYogaBedtimeMinute: DEFAULT_BEDTIME.minute,

    dreamYogaNight1Hour: nights[0]?.hour ?? 1,

    dreamYogaNight1Minute: nights[0]?.minute ?? 0,

    dreamYogaNight2Hour: nights[1]?.hour ?? 3,

    dreamYogaNight2Minute: nights[1]?.minute ?? 0,

    dreamYogaNight3Hour: nights[2]?.hour ?? 5,

    dreamYogaNight3Minute: nights[2]?.minute ?? 0,

    dreamYogaNight4Hour: nights[3]?.hour ?? 7,

    dreamYogaNight4Minute: nights[3]?.minute ?? 0,

    dreamYogaWakeHour: DEFAULT_WAKE.hour,

    dreamYogaWakeMinute: DEFAULT_WAKE.minute,

  }

}



export function formatAlarmTime({ hour, minute }: AlarmTime): string {

  const normalizedHour = ((Math.floor(hour) % 24) + 24) % 24

  const normalizedMinute = ((Math.floor(minute) % 60) + 60) % 60

  return `${String(normalizedHour).padStart(2, '0')}:${String(normalizedMinute).padStart(2, '0')}`

}



export function alarmTimeToInputValue(time: AlarmTime): string {

  return formatAlarmTime(time)

}



export function parseAlarmTimeInput(value: string): AlarmTime {

  const [hourRaw, minuteRaw] = value.split(':')

  return {

    hour: Number(hourRaw) || 0,

    minute: Number(minuteRaw) || 0,

  }

}



export function getSlotTime(settings: DreamYogaSlotTimes, slot: DreamYogaSlot): AlarmTime {

  const keys = SLOT_TIME_KEYS[slot]

  return {

    hour: Number(settings[keys.hour]),

    minute: Number(settings[keys.minute]),

  }

}



export function setSlotTime(

  settings: DreamYogaSlotTimes,

  slot: DreamYogaSlot,

  hour: number,

  minute: number,

): DreamYogaSlotTimes {

  const keys = SLOT_TIME_KEYS[slot]

  return {

    ...settings,

    [keys.hour]: hour,

    [keys.minute]: minute,

  }

}



export function isDreamYogaSlotEnabled(

  slot: DreamYogaSlot,

  flags: Record<DreamYogaSlot, boolean>,

): boolean {

  return flags[slot]

}


