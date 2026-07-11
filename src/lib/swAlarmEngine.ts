/// <reference lib="webworker" />

import {
  getNextAlarmEntry,
  getOverdueAlarmEntries,
  markAlarmEntryFired,
  type AlarmScheduleEntry,
} from './alarmStore'

declare const sw: ServiceWorkerGlobalScope

const PRACTICE_VIBRATION = [0, 700, 150, 700, 150, 700, 300, 900, 200]
const DREAM_YOGA_VIBRATION = [0, 900, 150, 900, 150, 900, 150, 1200, 300]

let nextAlarmTimer: ReturnType<typeof setTimeout> | null = null

function getVibrationPattern(kind: string) {
  return kind === 'practice' ? PRACTICE_VIBRATION : DREAM_YOGA_VIBRATION
}

function alarmDataFromEntry(entry: AlarmScheduleEntry) {
  return {
    kind: entry.kind,
    slot: entry.slot,
    body: entry.body,
    hint: entry.hint,
  }
}

async function notifyClients(entry: AlarmScheduleEntry) {
  const clients = await sw.clients.matchAll({ type: 'window', includeUncontrolled: true })
  for (const client of clients) {
    client.postMessage({
      type: 'ALARM_FIRED',
      triggerId: entry.triggerId,
      alarm: alarmDataFromEntry(entry),
    })
  }
}

export async function showAlarmNotification(entry: AlarmScheduleEntry) {
  await sw.registration.showNotification(entry.title, {
    body: entry.body,
    tag: entry.key,
    vibrate: getVibrationPattern(entry.kind),
    silent: false,
    requireInteraction: true,
    data: alarmDataFromEntry(entry),
  } as NotificationOptions)
}

export async function fireAlarmEntry(entry: AlarmScheduleEntry) {
  await showAlarmNotification(entry)
  await markAlarmEntryFired(entry.key)
  await notifyClients(entry)
}

export async function fireOverdueAlarms() {
  const overdue = await getOverdueAlarmEntries()
  for (const entry of overdue) {
    await fireAlarmEntry(entry)
  }
}

export async function scheduleNextAlarmTimer() {
  if (nextAlarmTimer) {
    clearTimeout(nextAlarmTimer)
    nextAlarmTimer = null
  }

  const next = await getNextAlarmEntry()
  if (!next) return

  const delay = Math.max(0, next.fireAt - Date.now())
  nextAlarmTimer = setTimeout(() => {
    void (async () => {
      await fireAlarmEntry(next)
      await scheduleNextAlarmTimer()
    })()
  }, delay)
}

export async function runAlarmEngine() {
  await fireOverdueAlarms()
  await scheduleNextAlarmTimer()
}

export function clearAlarmTimer() {
  if (nextAlarmTimer) {
    clearTimeout(nextAlarmTimer)
    nextAlarmTimer = null
  }
}
