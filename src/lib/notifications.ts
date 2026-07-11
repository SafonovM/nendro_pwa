import type { DreamYogaSlot } from './dreamYogaSchedule'
import { assetUrl } from './assetUrl'
import { startAlarmSound, stopAlarmSound, supportsAlarmSound } from './alarmSound'

export type AlarmKind = 'practice' | 'dream_yoga'

export interface ActiveAlarm {
  kind: AlarmKind
  title: string
  body: string
  hint?: string
  slot?: DreamYogaSlot
}

const PRACTICE_VIBRATION = [0, 700, 150, 700, 150, 700, 300, 900, 200]
const DREAM_YOGA_VIBRATION = [0, 900, 150, 900, 150, 900, 150, 1200, 300]

let vibrationTimer: ReturnType<typeof setInterval> | null = null

function getVibrationPattern(kind: AlarmKind): number[] {
  return kind === 'practice' ? PRACTICE_VIBRATION : DREAM_YOGA_VIBRATION
}

function playVibrationPattern(pattern: number[]) {
  if (!('vibrate' in navigator)) return
  navigator.vibrate(pattern)
}

export function startAlarmVibration(kind: AlarmKind) {
  stopAlarmVibration()
  const pattern = getVibrationPattern(kind)
  playVibrationPattern(pattern)
  const cycleMs = Math.max(pattern.reduce((sum, step) => sum + step, 0), 2500)
  vibrationTimer = setInterval(() => playVibrationPattern(pattern), cycleMs)
}

export function supportsAlarmVibration(): boolean {
  return 'vibrate' in navigator
}

export function startAlarmFeedback(kind: AlarmKind) {
  if (supportsAlarmVibration()) {
    startAlarmVibration(kind)
  }
  if (supportsAlarmSound()) {
    startAlarmSound(kind)
  }
}

export function stopAlarmFeedback() {
  stopAlarmVibration()
  stopAlarmSound()
}

export function stopAlarmVibration() {
  if (vibrationTimer) {
    clearInterval(vibrationTimer)
    vibrationTimer = null
  }
  if ('vibrate' in navigator) {
    navigator.vibrate(0)
  }
}

export function vibrateForAlarm(kind: AlarmKind) {
  startAlarmFeedback(kind)
}

export async function showSystemNotification(alarm: ActiveAlarm) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const tag = alarm.kind === 'practice' ? 'practice-reminder' : `dream-yoga-${alarm.slot}`
  const vibrate = getVibrationPattern(alarm.kind)

  const registration = await navigator.serviceWorker?.ready
  if (registration?.showNotification) {
    await registration.showNotification(alarm.title, {
      body: alarm.body,
      tag,
      icon: assetUrl('icons/icon-192.svg'),
      badge: assetUrl('icons/icon-192.svg'),
      vibrate,
      silent: false,
      requireInteraction: true,
      data: { kind: alarm.kind, slot: alarm.slot },
    } as NotificationOptions)
  } else {
    new Notification(alarm.title, { body: alarm.body, tag, icon: assetUrl('icons/icon-192.svg') })
  }
}

export function getPracticeAlarmContent(): ActiveAlarm {
  return {
    kind: 'practice',
    title: 'Время практики',
    body: 'Пора выполнить сегодняшнюю практику Нёндро',
  }
}

export function getDreamYogaAlarmContent(slot: DreamYogaSlot): ActiveAlarm {
  switch (slot) {
    case 'bedtime':
      return {
        kind: 'dream_yoga',
        slot,
        title: 'Йога сна',
        body: 'Напоминание об отходе ко сну',
        hint: 'Вспомните сон. Сохраните образы, эмоции и знаки ясности.',
      }
    case 'wake':
      return {
        kind: 'dream_yoga',
        slot,
        title: 'Йога сна',
        body: 'Пора просыпаться',
        hint: 'Вспомните сон. Сохраните образы, эмоции и знаки ясности.',
      }
    default: {
      const num = ['night_1', 'night_2', 'night_3', 'night_4'].indexOf(slot) + 1
      return {
        kind: 'dream_yoga',
        slot,
        title: 'Йога сна',
        body: `Пробуждение ${num} из 4`,
        hint: 'Вспомните сон. Сохраните образы, эмоции и знаки ясности.',
      }
    }
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}
